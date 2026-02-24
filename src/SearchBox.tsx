import React, { RefObject } from 'react';
import { Match } from './useSearchableContent';

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

const defaultIcons: Required<SearchBoxIcons> = {
  search: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  previous: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M15 12l-5-5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  next: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M15 5L5 15M5 5l10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  loading: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="animate-spin"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="50"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M10 2a8 8 0 0 1 8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const defaultClassNames: Required<SearchBoxClassNames> = {
  container:
    'search-box-container absolute z-10 flex items-center rounded-2xl border bg-white px-6 py-3 gap-4 shadow-lg',
  inputWrapper: 'search-box-input-wrapper flex flex-1 gap-2 items-center',
  input:
    'search-box-input flex-1 p-2 bg-transparent outline-none text-sm',
  counter: 'search-box-counter mx-2 text-sm whitespace-nowrap',
  button: 'search-box-button cursor-pointer p-1 hover:bg-gray-100 rounded transition-colors',
  buttonDisabled: 'search-box-button-disabled opacity-50 cursor-not-allowed',
  divider: 'search-box-divider w-px h-6 bg-gray-300 mx-2',
  iconWrapper: 'search-box-icon flex items-center justify-center',
  spinner: 'search-box-spinner',
};

const positionStyles: Record<Exclude<SearchBoxPosition, 'custom'>, React.CSSProperties> = {
  'top-right': { position: 'absolute', top: 12, right: 16 },
  'top-left': { position: 'absolute', top: 12, left: 16 },
  'top-center': { position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { position: 'absolute', bottom: 12, right: 16 },
  'bottom-left': { position: 'absolute', bottom: 12, left: 16 },
  'bottom-center': { position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)' },
};

const defaultAriaLabels: Required<SearchBoxAriaLabels> = {
  searchInput: 'Search text',
  previousButton: 'Previous match',
  nextButton: 'Next match',
  closeButton: 'Close search',
  matchStatus: '{current} of {total} matches',
};

const getSearchStatus = (isSearching: boolean, totalMatches: number, currentIndex: number): string => {
  if (isSearching) {
    return 'Searching...';
  }
  if (totalMatches > 0) {
    return `${currentIndex + 1}/${totalMatches}`;
  }
  return '0/0';
};

/**
 * SearchBox component for displaying search controls
 * Fully customizable with CSS classes, custom icons, positioning, ARIA labels, and render function
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  searchTerm,
  isSearchOpen,
  matches,
  currentIndex,
  isSearching = false,
  searchInputRef,
  onSearch,
  onNext,
  onPrevious,
  onClose,
  classNames = {},
  icons = {},
  placeholder = 'Search...',
  position = 'top-right',
  containerStyle,
  ariaLabels = {},
  renderSearchBox,
}) => {
  const totalMatches = matches.length;

  const mergedClassNames = {
    ...defaultClassNames,
    ...classNames,
  };

  const mergedIcons = {
    ...defaultIcons,
    ...icons,
  };

  const mergedAriaLabels = {
    ...defaultAriaLabels,
    ...ariaLabels,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (totalMatches > 0) {
        if (e.shiftKey) {
          onPrevious();
        } else {
          onNext();
        }
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isSearchOpen) return null;

  const isPreviousDisabled = totalMatches === 0 || isSearching;
  const isNextDisabled = totalMatches === 0 || isSearching;
  const statusText = getSearchStatus(isSearching, totalMatches, currentIndex);

  // If a custom render is provided, use it
  if (renderSearchBox) {
    return (
      <>
        {renderSearchBox({
          searchTerm,
          matches,
          currentIndex,
          totalMatches,
          isSearching,
          searchInputRef,
          onSearch,
          onNext,
          onPrevious,
          onClose,
          isPreviousDisabled,
          isNextDisabled,
          statusText,
        })}
      </>
    );
  }

  // Calculate container style based on position
  const computedStyle: React.CSSProperties =
    position === 'custom'
      ? containerStyle || {}
      : { ...positionStyles[position], ...containerStyle };

  // Format ARIA match status
  const ariaMatchStatus = mergedAriaLabels.matchStatus
    .replace('{current}', String(currentIndex + 1))
    .replace('{total}', String(totalMatches));

  return (
    <div
      className={mergedClassNames.container}
      style={computedStyle}
      role="search"
      aria-label="In-page search"
    >
      <div className={mergedClassNames.inputWrapper}>
        <div className={mergedClassNames.iconWrapper}>
          {isSearching ? mergedIcons.loading : mergedIcons.search}
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={mergedClassNames.input}
          autoFocus
          aria-label={mergedAriaLabels.searchInput}
          role="searchbox"
        />
      </div>

      <span
        className={mergedClassNames.counter}
        role="status"
        aria-live="polite"
        aria-label={ariaMatchStatus}
      >
        {statusText}
      </span>

      <button
        type="button"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        title="Previous"
        className={`${mergedClassNames.button} ${isPreviousDisabled ? mergedClassNames.buttonDisabled : ''}`}
        aria-label={mergedAriaLabels.previousButton}
      >
        <div className={mergedClassNames.iconWrapper}>{mergedIcons.previous}</div>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        title="Next (Enter)"
        className={`${mergedClassNames.button} ${isNextDisabled ? mergedClassNames.buttonDisabled : ''}`}
        aria-label={mergedAriaLabels.nextButton}
      >
        <div className={mergedClassNames.iconWrapper}>{mergedIcons.next}</div>
      </button>

      <div className={mergedClassNames.divider} />

      <button
        type="button"
        onClick={onClose}
        title="Close (Escape)"
        className={mergedClassNames.button}
        aria-label={mergedAriaLabels.closeButton}
      >
        <div className={mergedClassNames.iconWrapper}>{mergedIcons.close}</div>
      </button>
    </div>
  );
};
