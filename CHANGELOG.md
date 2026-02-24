# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-24

### Added
- Initial release of react-search-highlight
- `SearchableContent` component for making any content searchable
- `SearchBox` component with customizable UI
- `useSearchableContent` hook for advanced use cases
- Full TypeScript support with comprehensive type definitions
- Customizable CSS class injection via `searchBoxClassNames` prop
- Custom icon injection via `searchBoxIcons` prop
- Search options configuration:
  - `highlightColor` - Color for all matches
  - `currentHighlightColor` - Color for current match
  - `caseSensitive` - Case-sensitive search toggle
  - `wholeWord` - Whole word matching toggle
  - `debounceMs` - Debounce delay configuration
  - `minSearchLength` - Minimum characters for search
  - `maxHighlights` - Maximum highlights limit
  - `disableBrowserSearch` - Override native browser search
- Keyboard shortcuts (Ctrl/Cmd+F, Enter, Escape)
- Performance optimizations (debouncing, chunked rendering, requestIdleCallback)
- Accessibility features (ARIA labels, keyboard navigation)
- Browser native search override
- Search blocking capability for modals/overlays
- Comprehensive documentation and examples

### Features
- Zero dependencies (except React peer dependency)
- Lightweight bundle size
- Works with any React content
- Scoped search within specific containers
- Smooth scrolling to matches
- Visual highlighting with customizable colors
- Match counter display
- Navigate between matches
- Case-insensitive and case-sensitive search
- Whole word matching option
- Responsive and mobile-friendly

[1.0.0]: https://github.com/yourusername/react-search-highlight/releases/tag/v1.0.0
