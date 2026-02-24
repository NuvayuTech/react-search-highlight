import { useState, useEffect, useRef, useCallback, useMemo, RefObject } from 'react';

import type {
  KeyboardShortcut,
  ScrollOptions,
  HighlightStyle,
  PerformanceOptions,
  SearchCallbacks,
  SearchOptions,
  ResolvedSearchOptions,
  TextNodeInfo,
  TextRange,
  Match,
  UseSearchableContentReturn,
} from './types';

import { getTextNodesWithOffsets, findNodeAtOffset, getTextFromNodes } from './utils/dom';
import { createHighlight, buildHighlightsByIndex, buildMatchObjects, yieldToMainThread } from './utils/highlight';

// Re-export types so existing `import { … } from './useSearchableContent'` still works
export type {
  KeyboardShortcut,
  ScrollOptions,
  HighlightStyle,
  PerformanceOptions,
  SearchCallbacks,
  SearchOptions,
  ResolvedSearchOptions,
  TextRange,
  Match,
  UseSearchableContentReturn,
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
  const rafIdsRef = useRef<Set<number>>(new Set());
  const isMountedRef = useRef(true);

  // Cached text-node metadata
  const textNodesRef = useRef<TextNodeInfo[]>([]);
  const containerTextRef = useRef('');
  const lastContainerSizeRef = useRef(0);

  // Keep callbacks in a ref to avoid stale closures
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  /** Schedule a `requestAnimationFrame` that is automatically cancelled on unmount. */
  const safeRAF = useCallback((callback: FrameRequestCallback) => {
    const id = requestAnimationFrame((time) => {
      rafIdsRef.current.delete(id);
      if (isMountedRef.current) {
        callback(time);
      }
    });
    rafIdsRef.current.add(id);
    return id;
  }, []);

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
      if (activeSearchTermRef.current !== term || !isMountedRef.current) {
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
        safeRAF(() => {
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
      safeRAF,
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

  // ─── Match navigation (DRY helper) ────────────────────────────────

  /**
   * Navigate to a specific match index, updating highlight colors and
   * scrolling the target into view.
   */
  const navigateToMatch = useCallback(
    (newIndex: number) => {
      if (matches.length === 0) return;

      setCurrentIndex(newIndex);
      callbacksRef.current.onCurrentMatchChange?.(
        matches[newIndex] ?? null,
        newIndex
      );

      safeRAF(() => {
        // Reset all highlights to default color
        for (const h of highlightsRef.current) {
          h.style.backgroundColor = config.highlightColor;
          if (config.highlightStyle.activeClassName) {
            h.classList.remove(config.highlightStyle.activeClassName);
          }
        }

        // Activate the target match
        if (matches[newIndex]?.highlights) {
          for (const h of matches[newIndex].highlights) {
            h.style.backgroundColor = config.currentHighlightColor;
            if (config.highlightStyle.activeClassName) {
              h.classList.add(config.highlightStyle.activeClassName);
            }
          }
          matches[newIndex].highlights[0]?.scrollIntoView({
            behavior: config.scrollOptions.behavior,
            block: config.scrollOptions.block,
            inline: config.scrollOptions.inline,
          });
        }
      });
    },
    [
      matches,
      config.highlightColor,
      config.currentHighlightColor,
      config.scrollOptions,
      config.highlightStyle.activeClassName,
      safeRAF,
    ]
  );

  const goToNext = useCallback(() => {
    if (matches.length === 0) return;
    navigateToMatch((currentIndex + 1) % matches.length);
  }, [matches.length, currentIndex, navigateToMatch]);

  const goToPrevious = useCallback(() => {
    if (matches.length === 0) return;
    navigateToMatch(currentIndex <= 0 ? matches.length - 1 : currentIndex - 1);
  }, [matches.length, currentIndex, navigateToMatch]);

  // ─── Open / Close ──────────────────────────────────────────────────

  const openSearch = useCallback(() => {
    if (isBlocked) return;

    setIsSearchOpen(true);
    safeRAF(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    });
  }, [isBlocked, safeRAF]);

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
      // Mark unmounted so safeRAF callbacks are suppressed
      isMountedRef.current = false;

      // Cancel any pending requestAnimationFrame callbacks
      for (const id of rafIdsRef.current) {
        cancelAnimationFrame(id);
      }
      rafIdsRef.current.clear();

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
