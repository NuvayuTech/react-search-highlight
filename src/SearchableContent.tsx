import React, { useRef, useEffect, ReactNode } from 'react';

import { useSearchableContent } from './useSearchableContent';
import { SearchBox } from './SearchBox';
import type {
  SearchOptions,
  SearchCallbacks,
  SearchBoxClassNames,
  SearchBoxIcons,
  SearchBoxPosition,
  SearchBoxAriaLabels,
  SearchBoxRenderProps,
} from './types';

export interface SearchableContentProps {
  /** Content to make searchable */
  children: ReactNode;
  /** Configuration options for search behavior */
  searchOptions?: SearchOptions;
  /** Lifecycle callbacks for search events */
  searchCallbacks?: SearchCallbacks;
  /** Callback when search box open state changes */
  onSearchOpenChange?: (isOpen: boolean) => void;
  /** Block search functionality (e.g., when modal is open) */
  isSearchBlocked?: boolean;
  /** Custom CSS classes for the search box */
  searchBoxClassNames?: SearchBoxClassNames;
  /** Custom icons for the search box */
  searchBoxIcons?: SearchBoxIcons;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Custom className for the content container */
  containerClassName?: string;
  /** Custom inline styles for the content container */
  containerStyle?: React.CSSProperties;
  /** Position of the search box (default: 'top-right') */
  searchBoxPosition?: SearchBoxPosition;
  /** Custom inline styles for the search box */
  searchBoxStyle?: React.CSSProperties;
  /** Custom ARIA labels for accessibility / i18n */
  searchBoxAriaLabels?: SearchBoxAriaLabels;
  /** Render function for completely custom search box UI */
  renderSearchBox?: (props: SearchBoxRenderProps) => React.ReactNode;
}

/**
 * SearchableContent - Makes any content searchable with text highlighting
 *
 * @example
 * ```tsx
 * <SearchableContent
 *   searchOptions={{
 *     highlightColor: 'rgba(255, 255, 0, 0.4)',
 *     caseSensitive: false,
 *     keyboardShortcut: { key: 'f', ctrl: true, meta: true },
 *     scrollOptions: { behavior: 'smooth', block: 'center' },
 *     highlightStyle: { borderRadius: '4px', boxShadow: '0 0 4px gold' },
 *   }}
 *   searchCallbacks={{
 *     onMatchesFound: (matches) => console.log('Found', matches.length),
 *     onSearchComplete: (term, count) => console.log(`"${term}" → ${count} results`),
 *   }}
 *   searchBoxPosition="top-right"
 *   searchBoxClassNames={{ container: 'my-search-box', input: 'my-input' }}
 * >
 *   <div>Your searchable content here</div>
 * </SearchableContent>
 * ```
 */
export const SearchableContent: React.FC<SearchableContentProps> = ({
  children,
  searchOptions,
  searchCallbacks,
  onSearchOpenChange,
  isSearchBlocked = false,
  searchBoxClassNames,
  searchBoxIcons,
  searchPlaceholder,
  containerClassName = '',
  containerStyle,
  searchBoxPosition,
  searchBoxStyle,
  searchBoxAriaLabels,
  renderSearchBox,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    searchTerm,
    isSearchOpen,
    isSearching,
    matches,
    currentIndex,
    searchInputRef,
    search,
    goToNext,
    goToPrevious,
    closeSearch,
  } = useSearchableContent(containerRef, searchOptions, isSearchBlocked, searchCallbacks);

  useEffect(() => {
    if (onSearchOpenChange) {
      onSearchOpenChange(isSearchOpen);
    }
  }, [isSearchOpen, onSearchOpenChange]);

  return (
    <>
      <div ref={containerRef} className={containerClassName} style={containerStyle}>
        {children}
      </div>

      <SearchBox
        searchTerm={searchTerm}
        isSearchOpen={isSearchOpen}
        matches={matches}
        currentIndex={currentIndex}
        isSearching={isSearching}
        searchInputRef={searchInputRef}
        onSearch={search}
        onNext={goToNext}
        onPrevious={goToPrevious}
        onClose={closeSearch}
        classNames={searchBoxClassNames}
        icons={searchBoxIcons}
        placeholder={searchPlaceholder}
        position={searchBoxPosition}
        containerStyle={searchBoxStyle}
        ariaLabels={searchBoxAriaLabels}
        renderSearchBox={renderSearchBox}
      />
    </>
  );
};
