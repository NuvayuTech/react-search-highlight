# Quick Reference Guide

## Installation

```bash
npm install @nuvayutech/react-search-highlight
```

## Basic Usage

```tsx
import { SearchableContent } from '@nuvayutech/react-search-highlight';

<SearchableContent>
  <YourContent />
</SearchableContent>
```

## All Props

### SearchableContent Props

```tsx
<SearchableContent
  // Required
  children={<YourContent />}
  
  // Optional customization
  searchBoxClassNames={{
    container: 'your-class',
    input: 'your-class',
    button: 'your-class',
    // ... see complete list below
  }}
  
  searchBoxIcons={{
    search: <YourIcon />,
    previous: <YourIcon />,
    next: <YourIcon />,
    close: <YourIcon />,
    loading: <YourIcon />,
  }}
  
  searchOptions={{
    highlightColor: 'rgba(255, 255, 0, 0.3)',
    currentHighlightColor: 'rgba(255, 165, 0, 0.6)',
    caseSensitive: false,
    wholeWord: false,
    debounceMs: 100,
    minSearchLength: 1,
    maxHighlights: 500,
    disableBrowserSearch: true,
  }}
  
  searchPlaceholder="Search..."
  containerClassName="your-container-class"
  isSearchBlocked={false}
  onSearchOpenChange={(isOpen) => console.log(isOpen)}
  
  // Optional tooltips (none shown by default)
  searchBoxTooltips={{
    previousButton: 'Previous match (Shift+Enter)',
    nextButton: 'Next match (Enter)',
    closeButton: 'Close search (Escape)',
  }}
/>
```

## Complete CSS Classes Reference

```tsx
interface SearchBoxClassNames {
  container?: string;        // Main search box wrapper
  inputWrapper?: string;     // Wrapper around icon + input
  input?: string;           // Text input field
  counter?: string;         // Match counter (e.g., "1/5")
  button?: string;          // Navigation buttons
  buttonDisabled?: string;  // Disabled button state
  divider?: string;         // Visual divider
  iconWrapper?: string;     // Icon containers
  spinner?: string;         // Loading spinner
}
```

## Default CSS Classes

You can target these in your global CSS:

```css
.search-box-container       { /* Main wrapper */ }
.search-box-input-wrapper   { /* Input wrapper */ }
.search-box-input          { /* Input field */ }
.search-box-counter        { /* Match counter */ }
.search-box-button         { /* Buttons */ }
.search-box-button-disabled { /* Disabled state */ }
.search-box-divider        { /* Divider */ }
.search-box-icon           { /* Icon wrappers */ }
.text-search-highlight     { /* Highlight overlays */ }
.text-search-overlay       { /* Overlay container */ }
```

## Search Options Reference

```tsx
interface SearchOptions {
  // Override browser's native Ctrl/Cmd+F
  disableBrowserSearch?: boolean;     // Default: true
  
  // Background color for all matches
  highlightColor?: string;            // Default: 'rgba(255, 255, 0, 0.3)'
  
  // Background color for current match
  currentHighlightColor?: string;     // Default: 'rgba(255, 165, 0, 0.6)'
  
  // Enable case-sensitive search
  caseSensitive?: boolean;            // Default: false
  
  // Match whole words only
  wholeWord?: boolean;                // Default: false
  
  // Debounce delay in milliseconds
  debounceMs?: number;                // Default: 100
  
  // Minimum search term length
  minSearchLength?: number;           // Default: 1
  
  // Maximum highlights to render
  maxHighlights?: number;             // Default: 500
}
```

## Icons Reference

```tsx
interface SearchBoxIcons {
  search?: React.ReactNode;    // Search icon (when not searching)
  previous?: React.ReactNode;  // Previous match button
  next?: React.ReactNode;      // Next match button
  close?: React.ReactNode;     // Close search button
  loading?: React.ReactNode;   // Loading spinner (when searching)
}
```

## Common Icon Libraries

### Lucide React
```tsx
import { Search, ChevronUp, ChevronDown, X, Loader2 } from 'lucide-react';

searchBoxIcons={{
  search: <Search size={20} />,
  previous: <ChevronUp size={20} />,
  next: <ChevronDown size={20} />,
  close: <X size={20} />,
  loading: <Loader2 size={20} className="animate-spin" />,
}}
```

### React Icons
```tsx
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import { BiChevronUp, BiChevronDown } from 'react-icons/bi';

searchBoxIcons={{
  search: <AiOutlineSearch size={20} />,
  previous: <BiChevronUp size={20} />,
  next: <BiChevronDown size={20} />,
  close: <AiOutlineClose size={20} />,
}}
```

### Font Awesome
```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

searchBoxIcons={{
  search: <FontAwesomeIcon icon={faSearch} />,
  close: <FontAwesomeIcon icon={faTimes} />,
}}
```

### Material UI
```tsx
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

searchBoxIcons={{
  search: <SearchIcon />,
  close: <CloseIcon />,
}}
```

### Emoji
```tsx
searchBoxIcons={{
  search: '🔍',
  previous: '⬆️',
  next: '⬇️',
  close: '✕',
  loading: '⟳',
}}
```

## Hook API

For complete control, use the hook directly:

```tsx
import { useSearchableContent } from '@nuvayutech/react-search-highlight';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    searchTerm,        // Current search term
    isSearchOpen,      // Whether search is open
    matches,           // Array of matches
    currentIndex,      // Current match index
    searchInputRef,    // Ref for input element
    search,            // (term: string) => void
    goToNext,          // () => void
    goToPrevious,      // () => void
    openSearch,        // () => void
    closeSearch,       // () => void
    setSearchTerm,     // (term: string) => void
    config,            // Current search config
  } = useSearchableContent(containerRef, {
    // SearchOptions
  });
  
  return (
    <div ref={containerRef}>
      {/* Build your own UI */}
    </div>
  );
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+F` | Open search |
| `Enter` | Next match |
| `Shift+Enter` | Previous match |
| `Escape` | Close search |

## TypeScript Types

```tsx
import type {
  SearchableContentProps,
  SearchBoxProps,
  SearchBoxClassNames,
  SearchBoxIcons,
  SearchBoxTooltips,
  SearchOptions,
  UseSearchableContentReturn,
  Match,
  TextRange,
} from '@nuvayutech/react-search-highlight';
```

## Common Patterns

### Tailwind Dark Mode
```tsx
<SearchableContent
  searchBoxClassNames={{
    container: 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
    input: 'bg-gray-100 dark:bg-gray-800',
  }}
/>
```

### Responsive Design
```tsx
<SearchableContent
  searchBoxClassNames={{
    container: 'fixed top-4 right-4 md:top-6 md:right-6',
    input: 'w-40 md:w-64',
  }}
/>
```

### Conditional Search
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

<SearchableContent isSearchBlocked={isModalOpen}>
  <YourContent />
</SearchableContent>
```

### Search State Tracking
```tsx
<SearchableContent
  onSearchOpenChange={(isOpen) => {
    console.log('Search is', isOpen ? 'open' : 'closed');
  }}
>
  <YourContent />
</SearchableContent>
```

## Links

- 📘 [Full Documentation](./README.md)
- 🎨 [Customization Guide](./CUSTOMIZATION.md)
- 💻 [Code Examples](./examples)
- 🤝 [Contributing](./CONTRIBUTING.md)
