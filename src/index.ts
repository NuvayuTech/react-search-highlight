// Components
export { SearchableContent } from './SearchableContent';
export type { SearchableContentProps } from './SearchableContent';
export { SearchBox } from './SearchBox';

// Hook
export { useSearchableContent } from './useSearchableContent';

// Types (centralized)
export type {
  // Search configuration
  SearchOptions,
  ResolvedSearchOptions,
  KeyboardShortcut,
  ScrollOptions,
  HighlightStyle,
  PerformanceOptions,
  SearchCallbacks,

  // Search results
  Match,
  TextRange,
  UseSearchableContentReturn,

  // SearchBox UI
  SearchBoxProps,
  SearchBoxClassNames,
  SearchBoxIcons,
  SearchBoxPosition,
  SearchBoxAriaLabels,
  SearchBoxRenderProps,
} from './types';
