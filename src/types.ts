import React, { RefObject } from 'react';

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

// ─── Match & Range ───────────────────────────────────────────────────────────

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

export interface TextNodeInfo {
  node: Text;
  /** Accumulated character offset where this node starts */
  start: number;
  /** Accumulated character offset where this node ends (exclusive) */
  end: number;
}

// ─── Hook return type ────────────────────────────────────────────────────────

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

// ─── SearchBox types ─────────────────────────────────────────────────────────

export interface SearchBoxClassNames {
  /** Class for the search box container */
  container?: string;
  /** Class for the search input wrapper */
  inputWrapper?: string;
  /** Class for the search input field */
  input?: string;
  /** Class for the match counter text */
  counter?: string;
  /** Class for navigation buttons */
  button?: string;
  /** Class for disabled buttons */
  buttonDisabled?: string;
  /** Class for the divider element */
  divider?: string;
  /** Class for icon wrapper */
  iconWrapper?: string;
  /** Class for the loading spinner */
  spinner?: string;
}

export interface SearchBoxIcons {
  /** Icon component for search */
  search?: React.ReactNode;
  /** Icon component for previous/up navigation */
  previous?: React.ReactNode;
  /** Icon component for next/down navigation */
  next?: React.ReactNode;
  /** Icon component for close button */
  close?: React.ReactNode;
  /** Icon component or element for loading state */
  loading?: React.ReactNode;
}

/** Predefined search box positions */
export type SearchBoxPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'custom';

/** ARIA labels for i18n / accessibility customization */
export interface SearchBoxAriaLabels {
  /** Label for the search input (default: 'Search text') */
  searchInput?: string;
  /** Label for previous button (default: 'Previous match') */
  previousButton?: string;
  /** Label for next button (default: 'Next match') */
  nextButton?: string;
  /** Label for close button (default: 'Close search') */
  closeButton?: string;
  /** Live region label for match status (default: '{current} of {total} matches') */
  matchStatus?: string;
}

/** Props passed to custom render functions */
export interface SearchBoxRenderProps {
  searchTerm: string;
  matches: Match[];
  currentIndex: number;
  totalMatches: number;
  isSearching: boolean;
  searchInputRef: RefObject<HTMLInputElement>;
  onSearch: (term: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
  statusText: string;
}

export interface SearchBoxProps {
  /** Current search term */
  searchTerm: string;
  /** Whether the search box is visible */
  isSearchOpen: boolean;
  /** Array of found matches */
  matches: Match[];
  /** Index of currently active match */
  currentIndex: number;
  /** Whether search is in progress */
  isSearching?: boolean;
  /** Ref for the search input element */
  searchInputRef: RefObject<HTMLInputElement>;
  /** Callback when search term changes */
  onSearch: (term: string) => void;
  /** Callback to navigate to next match */
  onNext: () => void;
  /** Callback to navigate to previous match */
  onPrevious: () => void;
  /** Callback to close search */
  onClose: () => void;
  /** Custom CSS class names for styling */
  classNames?: SearchBoxClassNames;
  /** Custom icons for buttons */
  icons?: SearchBoxIcons;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Predefined position for the search box (default: 'top-right') */
  position?: SearchBoxPosition;
  /** Custom inline styles for the search box container (use with position='custom') */
  containerStyle?: React.CSSProperties;
  /** Custom ARIA labels for accessibility / i18n */
  ariaLabels?: SearchBoxAriaLabels;
  /** Render function for completely custom search box UI */
  renderSearchBox?: (props: SearchBoxRenderProps) => React.ReactNode;
}
