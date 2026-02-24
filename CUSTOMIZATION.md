# Customization Guide

This guide shows you how to fully customize the appearance and icons of `@nuvayutech/react-search-highlight`.

## Table of Contents
- [Custom CSS Classes](#custom-css-classes)
- [Custom Icons](#custom-icons)
- [Complete Examples](#complete-examples)
- [Theming](#theming)

---

## Custom CSS Classes

Every element in the search box can be styled using custom CSS classes via the `searchBoxClassNames` prop.

### Available Class Names

```typescript
interface SearchBoxClassNames {
  container?: string;        // Main search box wrapper
  inputWrapper?: string;     // Wrapper around icon + input
  input?: string;           // Text input field
  counter?: string;         // Match counter display (e.g., "1/5")
  button?: string;          // All navigation buttons
  buttonDisabled?: string;  // Disabled state for buttons
  divider?: string;         // Visual divider between sections
  iconWrapper?: string;     // Wrappers for all icons
  spinner?: string;         // Loading spinner (when searching)
}
```

### Basic Example

```tsx
<SearchableContent
  searchBoxClassNames={{
    container: 'my-search-container',
    input: 'my-search-input',
    button: 'my-button',
  }}
>
  <YourContent />
</SearchableContent>
```

### Tailwind CSS Example

```tsx
<SearchableContent
  searchBoxClassNames={{
    container: 'fixed top-4 right-4 z-50 flex items-center gap-3 bg-white shadow-2xl rounded-xl border-2 border-blue-500 px-6 py-4',
    inputWrapper: 'flex items-center gap-2 flex-1',
    input: 'flex-1 px-4 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    counter: 'text-sm font-semibold text-gray-700 min-w-[60px] text-center',
    button: 'p-2 rounded-lg transition-colors hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed',
    buttonDisabled: 'opacity-30 cursor-not-allowed',
    divider: 'w-px h-8 bg-gray-300',
    iconWrapper: 'flex items-center justify-center w-6 h-6',
  }}
>
  <YourContent />
</SearchableContent>
```

### CSS Modules Example

```tsx
import styles from './SearchStyles.module.css';

<SearchableContent
  searchBoxClassNames={{
    container: styles.searchContainer,
    input: styles.searchInput,
    button: styles.navButton,
    counter: styles.matchCounter,
  }}
>
  <YourContent />
</SearchableContent>
```

```css
/* SearchStyles.module.css */
.searchContainer {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  gap: 12px;
  align-items: center;
}

.searchInput {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  outline: none;
}

.searchInput::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.navButton {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.navButton:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.navButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.matchCounter {
  color: white;
  font-size: 14px;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}
```

### Styled Components Example

```tsx
import styled from 'styled-components';

const StyledSearch = styled.div`
  .search-container {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ffffff;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .search-input {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    outline: none;
    
    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  .search-button {
    background: transparent;
    border: none;
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: #f3f4f6;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
`;

function App() {
  return (
    <StyledSearch>
      <SearchableContent
        searchBoxClassNames={{
          container: 'search-container',
          input: 'search-input',
          button: 'search-button',
        }}
      >
        <YourContent />
      </SearchableContent>
    </StyledSearch>
  );
}
```

---

## Custom Icons

Replace default icons with your own components using the `searchBoxIcons` prop.

### Available Icons

```typescript
interface SearchBoxIcons {
  search?: React.ReactNode;    // Search icon (shown when not searching)
  previous?: React.ReactNode;  // Previous match button icon
  next?: React.ReactNode;      // Next match button icon
  close?: React.ReactNode;     // Close search button icon
  loading?: React.ReactNode;   // Loading spinner (shown when searching)
}
```

### Using Lucide Icons

```tsx
import { Search, ChevronUp, ChevronDown, X, Loader2 } from 'lucide-react';

<SearchableContent
  searchBoxIcons={{
    search: <Search size={20} />,
    previous: <ChevronUp size={20} />,
    next: <ChevronDown size={20} />,
    close: <X size={20} />,
    loading: <Loader2 size={20} className="animate-spin" />,
  }}
>
  <YourContent />
</SearchableContent>
```

### Using React Icons

```tsx
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import { BiChevronUp, BiChevronDown } from 'react-icons/bi';
import { CgSpinner } from 'react-icons/cg';

<SearchableContent
  searchBoxIcons={{
    search: <AiOutlineSearch size={20} />,
    previous: <BiChevronUp size={20} />,
    next: <BiChevronDown size={20} />,
    close: <AiOutlineClose size={20} />,
    loading: <CgSpinner size={20} className="animate-spin" />,
  }}
>
  <YourContent />
</SearchableContent>
```

### Using Font Awesome

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronUp, faChevronDown, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

<SearchableContent
  searchBoxIcons={{
    search: <FontAwesomeIcon icon={faSearch} />,
    previous: <FontAwesomeIcon icon={faChevronUp} />,
    next: <FontAwesomeIcon icon={faChevronDown} />,
    close: <FontAwesomeIcon icon={faTimes} />,
    loading: <FontAwesomeIcon icon={faSpinner} spin />,
  }}
>
  <YourContent />
</SearchableContent>
```

### Using Material UI Icons

```tsx
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

<SearchableContent
  searchBoxIcons={{
    search: <SearchIcon />,
    previous: <ArrowUpwardIcon />,
    next: <ArrowDownwardIcon />,
    close: <CloseIcon />,
    loading: <CircularProgress size={20} />,
  }}
>
  <YourContent />
</SearchableContent>
```

### Using Custom SVG Icons

```tsx
const CustomSearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
  </svg>
);

const CustomCloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
  </svg>
);

<SearchableContent
  searchBoxIcons={{
    search: <CustomSearchIcon />,
    close: <CustomCloseIcon />,
    previous: '⬆️',
    next: '⬇️',
  }}
>
  <YourContent />
</SearchableContent>
```

### Using Emoji or Text

```tsx
<SearchableContent
  searchBoxIcons={{
    search: '🔍',
    previous: '↑',
    next: '↓',
    close: '✕',
    loading: '⟳',
  }}
>
  <YourContent />
</SearchableContent>
```

---

## Complete Examples

### Example 1: Dark Theme with Custom Icons

```tsx
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

function DarkSearchExample() {
  return (
    <SearchableContent
      searchOptions={{
        highlightColor: 'rgba(59, 130, 246, 0.4)',
        currentHighlightColor: 'rgba(96, 165, 250, 0.6)',
      }}
      searchBoxClassNames={{
        container: 'fixed top-4 right-4 bg-gray-900 text-white shadow-2xl rounded-lg px-5 py-3 flex gap-3 items-center border border-gray-700',
        inputWrapper: 'flex gap-2 items-center flex-1',
        input: 'bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-400',
        counter: 'text-sm text-gray-300 font-medium',
        button: 'p-2 hover:bg-gray-800 rounded transition-colors disabled:opacity-30',
        divider: 'w-px h-6 bg-gray-700',
      }}
      searchBoxIcons={{
        search: <Search size={18} className="text-gray-400" />,
        previous: <ChevronUp size={18} />,
        next: <ChevronDown size={18} />,
        close: <X size={18} />,
      }}
      searchPlaceholder="Search in dark mode..."
    >
      <div className="p-8 bg-gray-900 text-white min-h-screen">
        <h1>Dark Mode Content</h1>
        <p>This is searchable content with a dark theme.</p>
      </div>
    </SearchableContent>
  );
}
```

### Example 2: Minimalist Design

```tsx
function MinimalistSearchExample() {
  return (
    <SearchableContent
      searchOptions={{
        highlightColor: 'rgba(255, 215, 0, 0.3)',
        currentHighlightColor: 'rgba(255, 165, 0, 0.5)',
      }}
      searchBoxClassNames={{
        container: 'fixed top-8 right-8 bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 flex gap-2 items-center shadow-lg border border-gray-200',
        inputWrapper: 'flex gap-2 items-center',
        input: 'bg-transparent border-none outline-none text-sm placeholder-gray-400',
        counter: 'text-xs text-gray-500 min-w-[40px] text-center',
        button: 'p-1 hover:bg-gray-100 rounded-full transition-all disabled:opacity-20',
        divider: 'w-px h-4 bg-gray-300',
        iconWrapper: 'w-4 h-4 flex items-center justify-center',
      }}
      searchBoxIcons={{
        search: <span className="text-gray-400">🔍</span>,
        previous: <span className="text-xs">↑</span>,
        next: <span className="text-xs">↓</span>,
        close: <span className="text-xs">✕</span>,
      }}
      searchPlaceholder="Search..."
    >
      <YourContent />
    </SearchableContent>
  );
}
```

### Example 3: Material Design Style

```tsx
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

function MaterialDesignExample() {
  return (
    <SearchableContent
      searchOptions={{
        highlightColor: 'rgba(103, 58, 183, 0.2)',
        currentHighlightColor: 'rgba(103, 58, 183, 0.4)',
      }}
      searchBoxClassNames={{
        container: 'fixed top-6 right-6 bg-white shadow-md rounded-md px-4 py-2 flex gap-2 items-center elevation-4',
        inputWrapper: 'flex gap-2 items-center flex-1',
        input: 'border-b border-gray-300 focus:border-purple-600 outline-none px-2 py-1 transition-colors',
        counter: 'text-sm text-gray-600 font-medium',
        button: 'p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40',
        iconWrapper: 'text-gray-600',
      }}
      searchBoxIcons={{
        search: <SearchIcon fontSize="small" />,
        previous: <KeyboardArrowUpIcon fontSize="small" />,
        next: <KeyboardArrowDownIcon fontSize="small" />,
        close: <CloseIcon fontSize="small" />,
      }}
      searchPlaceholder="Type to search"
    >
      <YourContent />
    </SearchableContent>
  );
}
```

### Example 4: Floating Search Bar

```tsx
import { Search, ArrowUp, ArrowDown, X } from 'lucide-react';

function FloatingSearchExample() {
  return (
    <SearchableContent
      searchOptions={{
        highlightColor: 'rgba(245, 158, 11, 0.3)',
        currentHighlightColor: 'rgba(217, 119, 6, 0.5)',
      }}
      searchBoxClassNames={{
        container: 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl rounded-full px-6 py-3 flex gap-3 items-center',
        inputWrapper: 'flex gap-2 items-center flex-1',
        input: 'bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full border border-white/30 focus:border-white/60 focus:outline-none placeholder-white/60',
        counter: 'text-sm font-semibold min-w-[50px] text-center',
        button: 'p-2 hover:bg-white/20 rounded-full transition-all disabled:opacity-30',
        divider: 'w-px h-6 bg-white/30',
        iconWrapper: 'w-5 h-5',
      }}
      searchBoxIcons={{
        search: <Search size={18} />,
        previous: <ArrowUp size={18} />,
        next: <ArrowDown size={18} />,
        close: <X size={18} />,
      }}
      searchPlaceholder="Search content..."
    >
      <YourContent />
    </SearchableContent>
  );
}
```

---

## Theming

### Creating a Reusable Theme

```tsx
// searchThemes.ts
import { Search, ChevronUp, ChevronDown, X, Loader2 } from 'lucide-react';

export const searchThemes = {
  default: {
    classNames: {
      container: 'fixed top-4 right-4 bg-white shadow-lg rounded-lg px-4 py-3 flex gap-3 items-center',
      input: 'px-3 py-2 border rounded focus:ring-2 focus:border-blue-500',
      button: 'p-2 hover:bg-gray-100 rounded',
    },
    icons: {
      search: <Search size={20} />,
      previous: <ChevronUp size={20} />,
      next: <ChevronDown size={20} />,
      close: <X size={20} />,
      loading: <Loader2 size={20} className="animate-spin" />,
    },
  },
  
  dark: {
    classNames: {
      container: 'fixed top-4 right-4 bg-gray-900 text-white shadow-2xl rounded-lg px-4 py-3 flex gap-3 items-center border border-gray-700',
      input: 'bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500',
      button: 'p-2 hover:bg-gray-800 rounded text-white',
      counter: 'text-gray-300',
    },
    icons: {
      search: <Search size={20} />,
      previous: <ChevronUp size={20} />,
      next: <ChevronDown size={20} />,
      close: <X size={20} />,
      loading: <Loader2 size={20} className="animate-spin" />,
    },
  },
  
  minimal: {
    classNames: {
      container: 'fixed top-4 right-4 bg-white/80 backdrop-blur rounded-full px-5 py-2 flex gap-2 items-center shadow',
      input: 'bg-transparent border-none outline-none text-sm',
      button: 'p-1 hover:bg-gray-100 rounded-full',
      counter: 'text-xs text-gray-500',
    },
    icons: {
      search: '🔍',
      previous: '↑',
      next: '↓',
      close: '✕',
    },
  },
};

// Usage
import { searchThemes } from './searchThemes';

function App() {
  const theme = searchThemes.dark; // or 'default', 'minimal'
  
  return (
    <SearchableContent
      searchBoxClassNames={theme.classNames}
      searchBoxIcons={theme.icons}
    >
      <YourContent />
    </SearchableContent>
  );
}
```

### Dynamic Theming

```tsx
function ThemedSearchableContent() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const themes = {
    light: {
      classNames: {
        container: 'bg-white text-gray-900 border-gray-200',
        input: 'bg-gray-50 text-gray-900 border-gray-300',
      },
      options: {
        highlightColor: 'rgba(59, 130, 246, 0.3)',
        currentHighlightColor: 'rgba(59, 130, 246, 0.5)',
      },
    },
    dark: {
      classNames: {
        container: 'bg-gray-900 text-white border-gray-700',
        input: 'bg-gray-800 text-white border-gray-600',
      },
      options: {
        highlightColor: 'rgba(96, 165, 250, 0.3)',
        currentHighlightColor: 'rgba(96, 165, 250, 0.5)',
      },
    },
  };
  
  return (
    <>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      
      <SearchableContent
        searchBoxClassNames={themes[theme].classNames}
        searchOptions={themes[theme].options}
      >
        <YourContent />
      </SearchableContent>
    </>
  );
}
```

---

## Advanced: Completely Custom Search UI

For complete control, use the `useSearchableContent` hook directly:

```tsx
import { useSearchableContent } from '@nuvayutech/react-search-highlight';
import { useRef } from 'react';

function CompletelyCustomSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    searchTerm,
    isSearchOpen,
    matches,
    currentIndex,
    searchInputRef,
    search,
    goToNext,
    goToPrevious,
    openSearch,
    closeSearch,
  } = useSearchableContent(containerRef, {
    highlightColor: 'rgba(251, 191, 36, 0.4)',
    currentHighlightColor: 'rgba(239, 68, 68, 0.6)',
  });

  return (
    <div>
      {/* Your completely custom UI */}
      <button onClick={openSearch}>Open Search</button>
      
      <div ref={containerRef}>
        <YourContent />
      </div>

      {isSearchOpen && (
        <div className="your-custom-search-ui">
          <input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => search(e.target.value)}
            placeholder="Custom search..."
          />
          <span>{matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}</span>
          <button onClick={goToPrevious}>Previous</button>
          <button onClick={goToNext}>Next</button>
          <button onClick={closeSearch}>Close</button>
        </div>
      )}
    </div>
  );
}
```

---

## Summary

- **CSS Classes**: Use `searchBoxClassNames` to customize every visual element
- **Icons**: Use `searchBoxIcons` to replace all icons with your own components
- **Tooltips**: Use `searchBoxTooltips` to add hover tooltips to buttons (none by default)
- **Full Control**: Use the `useSearchableContent` hook for complete customization
- **Theming**: Create reusable theme objects for consistent styling

All customization is optional - the package works out of the box with sensible defaults!
