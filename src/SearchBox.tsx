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
  container: 'search-box-container',
  inputWrapper: 'search-box-input-wrapper',
  input: 'search-box-input',
  counter: 'search-box-counter',
  button: 'search-box-button',
  buttonDisabled: 'search-box-button-disabled',
  divider: 'search-box-divider',
  iconWrapper: 'search-box-icon',
  spinner: 'search-box-spinner',
};

// ─── Default inline styles (looks good out-of-the-box, no CSS framework needed) ─

const defaultStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 10,
  } as React.CSSProperties,
  inputWrapper: {
    display: 'flex',
    flex: 1,
    gap: 8,
    alignItems: 'center',
  } as React.CSSProperties,
  input: {
    flex: 1,
    padding: '6px 8px',
    background: 'transparent',
    outline: 'none',
    border: 'none',
    fontSize: 14,
    color: '#1e293b',
    minWidth: 140,
  } as React.CSSProperties,
  counter: {
    margin: '0 4px',
    fontSize: 13,
    whiteSpace: 'nowrap' as const,
    color: '#64748b',
    userSelect: 'none' as const,
    minWidth: 50,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    color: '#475569',
    transition: 'background 0.15s, color 0.15s',
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  divider: {
    width: 1,
    height: 20,
    background: '#e2e8f0',
    margin: '0 4px',
  } as React.CSSProperties,
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'inherit',
  } as React.CSSProperties,
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

const getSearchStatus = (_isSearching: boolean, totalMatches: number, currentIndex: number): string => {
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
      style={{ ...defaultStyles.container, ...computedStyle }}
      role="search"
      aria-label="In-page search"
    >
      <div className={mergedClassNames.inputWrapper} style={defaultStyles.inputWrapper}>
        <div className={mergedClassNames.iconWrapper} style={{ ...defaultStyles.iconWrapper, color: '#94a3b8' }}>
          {mergedIcons.search}
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={mergedClassNames.input}
          style={defaultStyles.input}
          autoFocus
          aria-label={mergedAriaLabels.searchInput}
          role="searchbox"
        />
      </div>

      <span
        className={mergedClassNames.counter}
        style={defaultStyles.counter}
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
        title="Previous (Shift+Enter)"
        className={`${mergedClassNames.button} ${isPreviousDisabled ? mergedClassNames.buttonDisabled : ''}`}
        style={{
          ...defaultStyles.button,
          ...(isPreviousDisabled ? defaultStyles.buttonDisabled : {}),
        }}
        aria-label={mergedAriaLabels.previousButton}
      >
        <div className={mergedClassNames.iconWrapper} style={defaultStyles.iconWrapper}>{mergedIcons.previous}</div>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        title="Next (Enter)"
        className={`${mergedClassNames.button} ${isNextDisabled ? mergedClassNames.buttonDisabled : ''}`}
        style={{
          ...defaultStyles.button,
          ...(isNextDisabled ? defaultStyles.buttonDisabled : {}),
        }}
        aria-label={mergedAriaLabels.nextButton}
      >
        <div className={mergedClassNames.iconWrapper} style={defaultStyles.iconWrapper}>{mergedIcons.next}</div>
      </button>

      <div className={mergedClassNames.divider} style={defaultStyles.divider} />

      <button
        type="button"
        onClick={onClose}
        title="Close (Escape)"
        className={mergedClassNames.button}
        style={defaultStyles.button}
        aria-label={mergedAriaLabels.closeButton}
      >
        <div className={mergedClassNames.iconWrapper} style={defaultStyles.iconWrapper}>{mergedIcons.close}</div>
      </button>
    </div>
  );
};
