import { useState, useEffect, useRef, useCallback, useMemo, RefObject } from 'react';

// ─── Keyboard Shortcut ───────────────────────────────────────────────────────

export interface KeyboardShortcut {
  /** The key to listen for (e.g., 'f', 'k', '/') */
  key: string;
  /** Require Ctrl key */
  ctrl?: boolean;
  /** Require Meta/Cmd key */
  meta?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Alt/Option key */
  alt?: boolean;
}

// ─── Scroll Options ──────────────────────────────────────────────────────────

export interface ScrollOptions {
  /** Scroll behavior when navigating matches */
  behavior?: ScrollBehavior;
  /** Vertical alignment of match in viewport */
  block?: ScrollLogicalPosition;
  /** Horizontal alignment of match in viewport */
  inline?: ScrollLogicalPosition;
}

// ─── Highlight Style ─────────────────────────────────────────────────────────

export interface HighlightStyle {
  /** Border radius for highlights (default: '2px') */
  borderRadius?: string;
  /** Border for highlights (e.g., '1px solid red') */
  border?: string;
  /** Box shadow for highlights (e.g., '0 0 4px rgba(0,0,0,0.3)') */
  boxShadow?: string;
  /** Opacity for highlights (0-1) */
  opacity?: number;
  /** z-index for the overlay layer (default: 999) */
  zIndex?: number;
  /** Custom CSS class to add to each highlight element */
  className?: string;
  /** Custom CSS class to add to the current/active highlight */
  activeClassName?: string;
}

// ─── Performance Options ─────────────────────────────────────────────────────

export interface PerformanceOptions {
  /** Number of highlights to process per chunk (default: 50) */
  chunkSize?: number;
  /** Use requestIdleCallback when available (default: true) */
  useIdleCallback?: boolean;
  /** Timeout for idle callback in ms (default: 100) */
  idleCallbackTimeout?: number;
}

// ─── Lifecycle Callbacks ─────────────────────────────────────────────────────

export interface SearchCallbacks {
  /** Called when search starts */
  onSearchStart?: (searchTerm: string) => void;
  /** Called when search completes with results */
  onSearchComplete?: (searchTerm: string, matchCount: number) => void;
  /** Called when matches are found/updated */
  onMatchesFound?: (matches: Match[], totalCount: number) => void;
  /** Called when the current active match changes */
  onCurrentMatchChange?: (match: Match | null, index: number) => void;
  /** Called when max highlights limit is reached */
  onMaxHighlightsReached?: (limit: number) => void;
}

// ─── Search Options ──────────────────────────────────────────────────────────

export interface SearchOptions {
  /** Override browser's native search with Ctrl+F / Cmd+F */
  disableBrowserSearch?: boolean;
  /** Background color for all matches */
  highlightColor?: string;
  /** Background color for the current/active match */
  currentHighlightColor?: string;
  /** Enable case-sensitive search */
  caseSensitive?: boolean;
  /** Match whole words only */
  wholeWord?: boolean;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Minimum search term length to trigger search */
  minSearchLength?: number;
  /** Maximum number of highlights to render */
  maxHighlights?: number;
  /** Custom keyboard shortcut to open search (default: Ctrl/Cmd+F) */
  keyboardShortcut?: KeyboardShortcut;
  /** Scroll behavior when navigating to matches */
  scrollOptions?: ScrollOptions;
  /** Custom highlight element styling */
  highlightStyle?: HighlightStyle;
  /** Performance tuning options */
  performance?: PerformanceOptions;
  /** CSS selector for elements to exclude from search (e.g., '.no-search, [data-no-search]') */
  excludeSelector?: string;
  /** Custom text normalization function applied before matching (e.g., remove accents) */
  normalizeText?: (text: string) => string;
}

// ─── Resolved config type (all required) ─────────────────────────────────────

export interface ResolvedSearchOptions {
  disableBrowserSearch: boolean;
  highlightColor: string;
  currentHighlightColor: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  debounceMs: number;
  minSearchLength: number;
  maxHighlights: number;
  keyboardShortcut: KeyboardShortcut;
  scrollOptions: Required<ScrollOptions>;
  highlightStyle: Required<HighlightStyle>;
  performance: Required<PerformanceOptions>;
  excludeSelector: string;
  normalizeText: (text: string) => string;
}

export interface TextRange {
  start: number;
  end: number;
  text: string;
}

export interface Match {
  index: number;
  highlights: HTMLDivElement[];
  text: string;
}

// ─── Pre-computed text node info for O(log n) lookups ────────────────────────

interface TextNodeInfo {
  node: Text;
  /** Accumulated character offset where this node starts */
  start: number;
  /** Accumulated character offset where this node ends (exclusive) */
  end: number;
}

export interface UseSearchableContentReturn {
  searchTerm: string;
  isSearchOpen: boolean;
  /** Whether an async highlight-rendering pass is in progress */
  isSearching: boolean;
  matches: Match[];
  currentIndex: number;
  searchInputRef: RefObject<HTMLInputElement>;
  search: (term: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchTerm: (term: string) => void;
  /** Programmatically refresh highlights (e.g., after dynamic content change) */
  refresh: () => void;
  config: ResolvedSearchOptions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility functions — pure helpers, no React state
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collect all text nodes under `root` with pre-computed character offsets.
 *
 * Uses **TreeWalker** with `FILTER_REJECT` so excluded-subtrees and the
 * highlight overlay are skipped entirely (O(1) per skipped subtree instead
 * of O(n) per child node).
 */
const getTextNodesWithOffsets = (
  root: HTMLElement,
  excludeSelector: string
): TextNodeInfo[] => {
  const nodes: TextNodeInfo[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
    acceptNode: (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip the highlight overlay subtree
        if ((node as Element).classList?.contains('text-search-overlay')) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip excluded elements and their entire subtree
        if (excludeSelector) {
          try {
            if ((node as Element).matches(excludeSelector)) {
              return NodeFilter.FILTER_REJECT;
            }
          } catch {
            /* invalid selector — don't skip */
          }
        }
        // Process children of this element but don't include the element itself
        return NodeFilter.FILTER_SKIP;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    },
  });

  let offset = 0;
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const textNode = current as Text;
    const len = textNode.length;
    nodes.push({ node: textNode, start: offset, end: offset + len });
    offset += len;
  }

  return nodes;
};

/**
 * Binary-search the pre-computed text-node array for the node at `offset`.
 *
 * @param isEnd — when `true`, allows `offset === node.end` (valid for
 *                `Range.setEnd` which accepts the boundary *after* the
 *                last character).
 *
 * Complexity: O(log m) where m = number of text nodes.
 * (Previous approach: linear scan via NodeIterator → O(m) **per range**.)
 */
const findNodeAtOffset = (
  nodes: TextNodeInfo[],
  offset: number,
  isEnd = false
): { node: Text; localOffset: number } | null => {
  let lo = 0;
  let hi = nodes.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const { start, end } = nodes[mid];

    if (offset < start) {
      hi = mid - 1;
    } else if (isEnd ? offset > end : offset >= end) {
      lo = mid + 1;
    } else {
      return { node: nodes[mid].node, localOffset: offset - start };
    }
  }
  return null;
};

/** Extract plain text from pre-computed text nodes (consistent with node offsets). */
const getTextFromNodes = (nodes: TextNodeInfo[]): string => {
  let text = '';
  for (const n of nodes) {
    text += n.node.textContent ?? '';
  }
  return text;
};

/** Create a single positioned highlight `<div>`. */
const createHighlight = (
  rect: DOMRect,
  index: number,
  config: ResolvedSearchOptions,
  containerRect: DOMRect,
  scrollLeft: number,
  scrollTop: number
): HTMLDivElement => {
  const highlight = document.createElement('div');
  highlight.className = `text-search-highlight${
    config.highlightStyle.className ? ` ${config.highlightStyle.className}` : ''
  }`;
  highlight.dataset.index = String(index);

  const x = rect.left - containerRect.left + scrollLeft;
  const y = rect.top - containerRect.top + scrollTop;
  const style = config.highlightStyle;

  let css = `
    position: absolute;
    transform: translate(${x}px, ${y}px);
    width: ${rect.width}px;
    height: ${rect.height}px;
    background-color: ${config.highlightColor};
    border-radius: ${style.borderRadius};
    pointer-events: none;
    will-change: background-color;
    contain: layout style paint;
  `;
  if (style.border) css += `border: ${style.border};`;
  if (style.boxShadow) css += `box-shadow: ${style.boxShadow};`;
  if (style.opacity !== undefined && style.opacity < 1) css += `opacity: ${style.opacity};`;

  highlight.style.cssText = css;
  return highlight;
};

const buildHighlightsByIndex = (
  highlights: HTMLDivElement[]
): Record<number, HTMLDivElement[]> => {
  const highlightsByIndex: Record<number, HTMLDivElement[]> = {};
  for (const highlight of highlights) {
    const index = Number.parseInt(highlight.dataset.index || '-1');
    if (!highlightsByIndex[index]) highlightsByIndex[index] = [];
    highlightsByIndex[index].push(highlight);
  }
  return highlightsByIndex;
};

const buildMatchObjects = (
  highlightsByIndex: Record<number, HTMLDivElement[]>,
  ranges: TextRange[]
): Match[] => {
  return Object.keys(highlightsByIndex).map((index) => ({
    index: Number.parseInt(index),
    highlights: highlightsByIndex[Number(index)],
    text: ranges[Number(index)].text,
  }));
};

/**
 * Yield control to the main thread between chunks.
 * Uses `requestIdleCallback` when enabled + available, otherwise `requestAnimationFrame`.
 */
const yieldToMainThread = (perf: Required<PerformanceOptions>): Promise<void> => {
  return new Promise((resolve) => {
    if (perf.useIdleCallback && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => resolve(), {
        timeout: perf.idleCallbackTimeout,
      });
    } else {
      requestAnimationFrame(() => resolve());
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to make any container content searchable with text highlighting.
 *
 * ### Performance architecture (optimized for large pages)
 *
 * 1. **TreeWalker** collects all text nodes + accumulated offsets in one pass.
 *    Excluded elements are skipped via `FILTER_REJECT` (entire subtrees).
 * 2. **Binary search** (`O(log m)`) locates the DOM node for each match offset,
 *    replacing the previous per-range `NodeIterator` linear scan (`O(m)`).
 * 3. Highlights are rendered in **truly async chunks** — the browser gets control
 *    back between batches via `requestIdleCallback` / `requestAnimationFrame`,
 *    keeping the UI responsive on documents with thousands of matches.
 * 4. An **`isSearching` flag** tracks in-flight work so the UI can show progress.
 * 5. Every async iteration checks a cancellation token (`activeSearchTermRef`)
 *    so stale work is discarded immediately when the user types again.
 *
 * @param containerRef - Reference to the container element to search within
 * @param options      - Configuration options for search behavior and styling
 * @param isBlocked    - Block search functionality (e.g., when a modal is open)
 * @param callbacks    - Lifecycle callbacks for search events
 */
export const useSearchableContent = (
  containerRef: RefObject<HTMLElement>,
  options: SearchOptions = {},
  isBlocked = false,
  callbacks: SearchCallbacks = {}
): UseSearchableContentReturn => {
  // ─── State ─────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // ─── Refs ──────────────────────────────────────────────────────────
  const searchInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const highlightsRef = useRef<HTMLDivElement[]>([]);
  const activeSearchTermRef = useRef('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cached text-node metadata
  const textNodesRef = useRef<TextNodeInfo[]>([]);
  const containerTextRef = useRef('');
  const lastContainerSizeRef = useRef(0);

  // Keep callbacks in a ref to avoid stale closures
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // ─── Resolve options with defaults ─────────────────────────────────
  const config = useMemo<ResolvedSearchOptions>(
    () => ({
      disableBrowserSearch: options.disableBrowserSearch ?? true,
      highlightColor: options.highlightColor ?? 'rgba(255, 255, 0, 0.3)',
      currentHighlightColor:
        options.currentHighlightColor ?? 'rgba(255, 165, 0, 0.6)',
      caseSensitive: options.caseSensitive ?? false,
      wholeWord: options.wholeWord ?? false,
      debounceMs: options.debounceMs ?? 100,
      minSearchLength: options.minSearchLength ?? 1,
      maxHighlights: options.maxHighlights ?? 500,
      keyboardShortcut: options.keyboardShortcut ?? {
        key: 'f',
        ctrl: true,
        meta: true,
      },
      scrollOptions: {
        behavior: options.scrollOptions?.behavior ?? 'smooth',
        block: options.scrollOptions?.block ?? 'center',
        inline: options.scrollOptions?.inline ?? 'nearest',
      },
      highlightStyle: {
        borderRadius: options.highlightStyle?.borderRadius ?? '2px',
        border: options.highlightStyle?.border ?? '',
        boxShadow: options.highlightStyle?.boxShadow ?? '',
        opacity: options.highlightStyle?.opacity ?? 1,
        zIndex: options.highlightStyle?.zIndex ?? 999,
        className: options.highlightStyle?.className ?? '',
        activeClassName: options.highlightStyle?.activeClassName ?? '',
      },
      performance: {
        chunkSize: options.performance?.chunkSize ?? 50,
        useIdleCallback: options.performance?.useIdleCallback ?? true,
        idleCallbackTimeout: options.performance?.idleCallbackTimeout ?? 100,
      },
      excludeSelector: options.excludeSelector ?? '',
      normalizeText: options.normalizeText ?? ((text: string) => text),
    }),
    /* Individual primitive deps avoid re-computing on every render when
       the user passes an inline options object. Object/function deps
       (keyboardShortcut, normalizeText) should ideally be memoized by
       the consumer for best performance. */
    [
      options.disableBrowserSearch,
      options.highlightColor,
      options.currentHighlightColor,
      options.caseSensitive,
      options.wholeWord,
      options.debounceMs,
      options.minSearchLength,
      options.maxHighlights,
      options.keyboardShortcut,
      options.scrollOptions?.behavior,
      options.scrollOptions?.block,
      options.scrollOptions?.inline,
      options.highlightStyle?.borderRadius,
      options.highlightStyle?.border,
      options.highlightStyle?.boxShadow,
      options.highlightStyle?.opacity,
      options.highlightStyle?.zIndex,
      options.highlightStyle?.className,
      options.highlightStyle?.activeClassName,
      options.performance?.chunkSize,
      options.performance?.useIdleCallback,
      options.performance?.idleCallbackTimeout,
      options.excludeSelector,
      options.normalizeText,
    ]
  );

  // ─── Overlay management ────────────────────────────────────────────

  const ensureOverlay = useCallback((): HTMLDivElement | null => {
    if (!containerRef.current) return null;

    // Re-use existing overlay if still attached; update its dimensions
    if (overlayRef.current) {
      if (overlayRef.current.parentNode === containerRef.current) {
        overlayRef.current.style.width = `${containerRef.current.scrollWidth}px`;
        overlayRef.current.style.height = `${containerRef.current.scrollHeight}px`;
        overlayRef.current.style.zIndex = String(config.highlightStyle.zIndex);
        return overlayRef.current;
      }
      overlayRef.current = null;
    }

    const overlay = document.createElement('div');
    overlay.className = 'text-search-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${containerRef.current.scrollWidth}px;
      height: ${containerRef.current.scrollHeight}px;
      pointer-events: none;
      z-index: ${config.highlightStyle.zIndex};
      contain: layout style paint;
    `;

    // Ensure the container is a positioning root
    const containerStyle = window.getComputedStyle(containerRef.current);
    if (containerStyle.position === 'static') {
      containerRef.current.style.position = 'relative';
    }

    containerRef.current.appendChild(overlay);
    overlayRef.current = overlay;
    return overlay;
  }, [containerRef, config.highlightStyle.zIndex]);

  const removeOverlay = useCallback(() => {
    if (overlayRef.current?.parentNode) {
      overlayRef.current.remove();
    }
    overlayRef.current = null;
    highlightsRef.current = [];
  }, []);

  const clearHighlights = useCallback(() => {
    if (overlayRef.current && highlightsRef.current.length > 0) {
      overlayRef.current.textContent = '';
      highlightsRef.current = [];
    }
  }, []);

  // ─── Text-node computation (cached) ────────────────────────────────

  /**
   * Build (or return cached) array of text nodes + accumulated offsets.
   *
   * The same node list is used for **both** text extraction and highlight
   * positioning, guaranteeing that character offsets from `getTextRanges`
   * always correspond to the correct DOM nodes — even when `excludeSelector`
   * filters elements out.
   */
  const computeTextNodes = useCallback((): TextNodeInfo[] => {
    if (!containerRef.current) return [];

    const currentSize = containerRef.current.children.length;
    if (
      currentSize !== lastContainerSizeRef.current ||
      textNodesRef.current.length === 0
    ) {
      textNodesRef.current = getTextNodesWithOffsets(
        containerRef.current,
        config.excludeSelector
      );
      containerTextRef.current = getTextFromNodes(textNodesRef.current);
      lastContainerSizeRef.current = currentSize;
    }
    return textNodesRef.current;
  }, [containerRef, config.excludeSelector]);

  const getContainerText = useCallback((): string => {
    computeTextNodes();
    return containerTextRef.current;
  }, [computeTextNodes]);

  // ─── Find text ranges matching the search term ─────────────────────

  const getTextRanges = useCallback(
    (text: string): TextRange[] => {
      if (
        !containerRef.current ||
        !text.trim() ||
        text.length < config.minSearchLength
      ) {
        return [];
      }

      const containerText = getContainerText();
      if (!containerText) return [];

      // Apply text normalization if provided
      const normalize = config.normalizeText;
      const normalizedSearch = normalize(
        config.caseSensitive ? text : text.toLowerCase()
      );
      const normalizedTarget = normalize(
        config.caseSensitive ? containerText : containerText.toLowerCase()
      );
      const ranges: TextRange[] = [];

      if (config.wholeWord) {
        const escapedTerm = normalizedSearch.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );
        const regex = new RegExp(
          `\\b${escapedTerm}\\b`,
          config.caseSensitive ? 'g' : 'gi'
        );
        let match: RegExpExecArray | null;
        let matchCount = 0;

        while (
          (match = regex.exec(normalizedTarget)) !== null &&
          matchCount < config.maxHighlights
        ) {
          ranges.push({
            start: match.index,
            end: match.index + match[0].length,
            text: containerText.substring(
              match.index,
              match.index + match[0].length
            ),
          });
          matchCount++;
        }
      } else {
        let startPos = 0;
        let index: number;
        let matchCount = 0;

        while (
          (index = normalizedTarget.indexOf(normalizedSearch, startPos)) !==
            -1 &&
          matchCount < config.maxHighlights
        ) {
          ranges.push({
            start: index,
            end: index + normalizedSearch.length,
            text: containerText.substring(index, index + normalizedSearch.length),
          });
          startPos = index + normalizedSearch.length;
          matchCount++;
        }
      }

      // Fire callback when max highlights limit is reached
      if (ranges.length >= config.maxHighlights) {
        callbacksRef.current.onMaxHighlightsReached?.(config.maxHighlights);
      }

      return ranges;
    },
    [config, getContainerText, containerRef]
  );

  // ─── Async chunked highlight rendering ─────────────────────────────

  /**
   * Process highlights **truly asynchronously** in configurable batches.
   *
   * Between each batch the browser gets control back via
   * `requestIdleCallback` (or `requestAnimationFrame`), keeping the page
   * responsive even when rendering thousands of highlights on large
   * documents.
   *
   * Every iteration checks `activeSearchTermRef` so stale work from a
   * previous keystroke is cancelled immediately.
   */
  const processHighlightsAsync = useCallback(
    async (ranges: TextRange[], term: string) => {
      if (!containerRef.current || !ranges.length) {
        setIsSearching(false);
        callbacksRef.current.onSearchComplete?.(term, 0);
        return;
      }

      const overlay = ensureOverlay();
      if (!overlay) {
        setIsSearching(false);
        return;
      }

      clearHighlights();

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;
      const textNodes = computeTextNodes();
      const chunkSize = config.performance.chunkSize;
      const allHighlights: HTMLDivElement[] = [];

      for (
        let chunkStart = 0;
        chunkStart < ranges.length;
        chunkStart += chunkSize
      ) {
        // ── Cancellation check (runs before every chunk) ──
        if (activeSearchTermRef.current !== term) {
          setIsSearching(false);
          return;
        }

        const chunkEnd = Math.min(chunkStart + chunkSize, ranges.length);
        const fragment = document.createDocumentFragment();

        for (let i = chunkStart; i < chunkEnd; i++) {
          const range = ranges[i];
          try {
            const startInfo = findNodeAtOffset(textNodes, range.start, false);
            const endInfo = findNodeAtOffset(textNodes, range.end, true);
            if (!startInfo || !endInfo) continue;

            const textRange = new Range();
            textRange.setStart(startInfo.node, startInfo.localOffset);
            textRange.setEnd(endInfo.node, endInfo.localOffset);

            const rects = textRange.getClientRects();
            for (let j = 0; j < rects.length; j++) {
              const highlight = createHighlight(
                rects[j],
                i,
                config,
                containerRect,
                scrollLeft,
                scrollTop
              );
              fragment.appendChild(highlight);
              allHighlights.push(highlight);
            }
          } catch (error) {
            console.error('Error creating highlight:', error);
          }
        }

        overlay.appendChild(fragment);
        highlightsRef.current = allHighlights;

        // ── Yield to main thread between chunks ──
        if (chunkStart + chunkSize < ranges.length) {
          await yieldToMainThread(config.performance);
        }
      }

      // ── Final cancellation check ──
      if (activeSearchTermRef.current !== term) {
        clearHighlights();
        setIsSearching(false);
        return;
      }

      // ── Build match objects & update state ──
      const highlightsByIndex = buildHighlightsByIndex(allHighlights);
      const matchObjects = buildMatchObjects(highlightsByIndex, ranges);

      setMatches(matchObjects);
      setIsSearching(false);

      callbacksRef.current.onMatchesFound?.(matchObjects, matchObjects.length);
      callbacksRef.current.onSearchComplete?.(term, matchObjects.length);

      if (matchObjects.length > 0) {
        setCurrentIndex(0);
        callbacksRef.current.onCurrentMatchChange?.(matchObjects[0], 0);
        requestAnimationFrame(() => {
          if (
            activeSearchTermRef.current === term &&
            matchObjects[0]?.highlights?.length > 0
          ) {
            for (const h of matchObjects[0].highlights) {
              h.style.backgroundColor = config.currentHighlightColor;
              if (config.highlightStyle.activeClassName) {
                h.classList.add(config.highlightStyle.activeClassName);
              }
            }
            matchObjects[0].highlights[0].scrollIntoView({
              behavior: config.scrollOptions.behavior,
              block: config.scrollOptions.block,
              inline: config.scrollOptions.inline,
            });
          }
        });
      }
    },
    [
      ensureOverlay,
      clearHighlights,
      computeTextNodes,
      config,
      containerRef,
    ]
  );

  // ─── Debounced search trigger ──────────────────────────────────────

  const debouncedSearch = useCallback(
    (term: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      callbacksRef.current.onSearchStart?.(term);

      debounceTimeoutRef.current = setTimeout(() => {
        if (activeSearchTermRef.current !== term) return;

        try {
          const ranges = getTextRanges(term);
          if (activeSearchTermRef.current !== term) return;

          if (ranges.length === 0) {
            setMatches([]);
            setCurrentIndex(-1);
            setIsSearching(false);
            callbacksRef.current.onSearchComplete?.(term, 0);
            return;
          }

          // processHighlightsAsync manages its own state; catch unexpected errors
          processHighlightsAsync(ranges, term).catch((error) => {
            console.error('Highlight rendering error:', error);
            setMatches([]);
            setCurrentIndex(-1);
            setIsSearching(false);
          });
        } catch (error) {
          console.error('Search error:', error);
          setMatches([]);
          setCurrentIndex(-1);
          setIsSearching(false);
        }
      }, config.debounceMs);
    },
    [getTextRanges, processHighlightsAsync, config.debounceMs]
  );

  // ─── Public search API ─────────────────────────────────────────────

  const performSearch = useCallback(
    (term: string) => {
      activeSearchTermRef.current = term;

      if (!term.trim() || term.length < config.minSearchLength) {
        clearHighlights();
        setMatches([]);
        setCurrentIndex(-1);
        setIsSearching(false);
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        return;
      }

      clearHighlights();
      setMatches([]);
      setCurrentIndex(-1);
      setIsSearching(true);
      debouncedSearch(term);
    },
    [clearHighlights, debouncedSearch, config.minSearchLength]
  );

  const search = useCallback(
    (term: string) => {
      setSearchTerm(term);
      performSearch(term);
    },
    [performSearch]
  );

  // ─── Match navigation ─────────────────────────────────────────────

  const goToNext = useCallback(() => {
    if (matches.length === 0) return;

    const nextIndex = (currentIndex + 1) % matches.length;
    setCurrentIndex(nextIndex);
    callbacksRef.current.onCurrentMatchChange?.(
      matches[nextIndex] ?? null,
      nextIndex
    );

    requestAnimationFrame(() => {
      for (const h of highlightsRef.current) {
        h.style.backgroundColor = config.highlightColor;
        if (config.highlightStyle.activeClassName) {
          h.classList.remove(config.highlightStyle.activeClassName);
        }
      }

      if (matches[nextIndex]?.highlights) {
        for (const h of matches[nextIndex].highlights) {
          h.style.backgroundColor = config.currentHighlightColor;
          if (config.highlightStyle.activeClassName) {
            h.classList.add(config.highlightStyle.activeClassName);
          }
        }
        matches[nextIndex].highlights[0]?.scrollIntoView({
          behavior: config.scrollOptions.behavior,
          block: config.scrollOptions.block,
          inline: config.scrollOptions.inline,
        });
      }
    });
  }, [
    matches,
    currentIndex,
    config.highlightColor,
    config.currentHighlightColor,
    config.scrollOptions,
    config.highlightStyle.activeClassName,
  ]);

  const goToPrevious = useCallback(() => {
    if (matches.length === 0) return;

    const prevIndex =
      currentIndex <= 0 ? matches.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    callbacksRef.current.onCurrentMatchChange?.(
      matches[prevIndex] ?? null,
      prevIndex
    );

    requestAnimationFrame(() => {
      for (const h of highlightsRef.current) {
        h.style.backgroundColor = config.highlightColor;
        if (config.highlightStyle.activeClassName) {
          h.classList.remove(config.highlightStyle.activeClassName);
        }
      }

      if (matches[prevIndex]?.highlights) {
        for (const h of matches[prevIndex].highlights) {
          h.style.backgroundColor = config.currentHighlightColor;
          if (config.highlightStyle.activeClassName) {
            h.classList.add(config.highlightStyle.activeClassName);
          }
        }
        matches[prevIndex].highlights[0]?.scrollIntoView({
          behavior: config.scrollOptions.behavior,
          block: config.scrollOptions.block,
          inline: config.scrollOptions.inline,
        });
      }
    });
  }, [
    matches,
    currentIndex,
    config.highlightColor,
    config.currentHighlightColor,
    config.scrollOptions,
    config.highlightStyle.activeClassName,
  ]);

  // ─── Open / Close ──────────────────────────────────────────────────

  const openSearch = useCallback(() => {
    if (isBlocked) return;

    setIsSearchOpen(true);
    requestAnimationFrame(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    });
  }, [isBlocked]);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setMatches([]);
    setCurrentIndex(-1);
    setIsSearching(false);
    clearHighlights();
    activeSearchTermRef.current = '';
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [clearHighlights]);

  // ─── Keyboard shortcut listener ────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!config.disableBrowserSearch) return;
      if (isBlocked) return;

      const shortcut = config.keyboardShortcut;
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true;
      const metaMatch = shortcut.meta ? e.metaKey : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      // For default Ctrl/Cmd+F, accept either Ctrl or Meta
      const ctrlOrMeta =
        shortcut.ctrl && shortcut.meta
          ? e.ctrlKey || e.metaKey
          : ctrlMatch && metaMatch;

      if (keyMatch && ctrlOrMeta && shiftMatch && altMatch) {
        e.preventDefault();
        e.stopPropagation();
        openSearch();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [
    config.disableBrowserSearch,
    config.keyboardShortcut,
    openSearch,
    isBlocked,
  ]);

  // ─── Window resize handler ────────────────────────────────────────

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Invalidate all caches
        containerTextRef.current = '';
        lastContainerSizeRef.current = 0;
        textNodesRef.current = [];
        if (searchTerm && searchTerm.length >= config.minSearchLength) {
          performSearch(searchTerm);
        }
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [searchTerm, performSearch, config.minSearchLength]);

  // ─── Cleanup on unmount ────────────────────────────────────────────

  useEffect(() => {
    return () => {
      // Cancel any in-flight async highlight work
      activeSearchTermRef.current = '';
      removeOverlay();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [removeOverlay]);

  // ─── Refresh (for dynamic content) ─────────────────────────────────

  /** Manually refresh highlights — useful after dynamic content changes. */
  const refresh = useCallback(() => {
    containerTextRef.current = '';
    lastContainerSizeRef.current = 0;
    textNodesRef.current = [];
    if (searchTerm && searchTerm.length >= config.minSearchLength) {
      performSearch(searchTerm);
    }
  }, [searchTerm, performSearch, config.minSearchLength]);

  // ─── Return ────────────────────────────────────────────────────────

  return {
    searchTerm,
    isSearchOpen,
    isSearching,
    matches,
    currentIndex,
    searchInputRef,
    search,
    goToNext,
    goToPrevious,
    openSearch,
    closeSearch,
    setSearchTerm,
    refresh,
    config,
  };
};
