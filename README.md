# react-search-highlight

A lightweight, fully customizable React component for adding in-page text search with visual highlighting to any content. Searches all text within the wrapped container (including nested elements). Features customizable keyboard shortcuts, match navigation, lifecycle callbacks, and complete styling control. Built with TypeScript and zero dependencies (except React).

**Perfect for:** Documentation sites, chat interfaces, code viewers, long-form content, data tables, and any React app that needs search functionality.

📚 **[Quick Reference](./QUICK_REFERENCE.md)** | 🎨 **[Customization Guide](./CUSTOMIZATION.md)** | 💻 **[Examples](./examples)**

## Features

- 🔍 **Text Search & Highlighting** — Search all text content within the wrapped container (including nested HTML elements) and highlight matches
- ⌨️ **Customizable Keyboard Shortcuts** — Default Ctrl/Cmd+F, configurable to any key combo
- 🎨 **Fully Customizable** — CSS classes, icons, positioning, ARIA labels, and render functions
- 🎭 **Bring Your Own Icons** — Works with Lucide, React Icons, Font Awesome, Material UI, or custom SVGs
- 💅 **Style Freedom** — Use Tailwind, CSS Modules, Styled Components, or any CSS framework
- 📦 **TypeScript First** — Full type safety and IntelliSense support
- 🪝 **Hook API** — Use the hook directly for 100% custom UI
- ⚡ **Performance Tunable** — Configurable chunk size, debounce, idle callbacks
- 🎯 **Scoped Search** — Search within specific containers only, with element exclusion
- ♿ **Accessible** — Customizable ARIA labels, keyboard navigation, live regions
- 📐 **Flexible Positioning** — 6 preset positions + fully custom placement
- 🔄 **Lifecycle Callbacks** — React to search events (start, complete, match change, etc.)
- 🔧 **Advanced Options** — Text normalization, exclude selectors, highlight styling, scroll control

## Installation

```bash
npm install react-search-highlight
```

## Quick Start

```tsx
import { SearchableContent } from 'react-search-highlight';

function App() {
  return (
    <SearchableContent>
      <div>
        <h1>Hello World</h1>
        <p>Search within this content using Ctrl/Cmd+F</p>
        <p>All text in nested elements will be searchable</p>
      </div>
    </SearchableContent>
  );
}
```

### With Custom Styling (Tailwind)

```tsx
<SearchableContent
  searchBoxClassNames={{
    container: 'fixed top-4 right-4 bg-white shadow-xl rounded-xl p-4',
    input: 'px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
    button: 'p-2 hover:bg-gray-100 rounded transition',
  }}
  searchOptions={{ highlightColor: 'rgba(59, 130, 246, 0.3)' }}
>
  <YourContent />
</SearchableContent>
```

### With Custom Icons (Lucide React)

```tsx
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

<SearchableContent
  searchBoxIcons={{
    search: <Search size={20} />,
    previous: <ChevronUp size={20} />,
    next: <ChevronDown size={20} />,
    close: <X size={20} />,
  }}
>
  <YourContent />
</SearchableContent>
```

---

## API Reference

### SearchableContent Component

Main component that wraps your searchable content.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | **Required.** Content to make searchable |
| `searchOptions` | `SearchOptions` | `{}` | Configuration for search behavior |
| `searchCallbacks` | `SearchCallbacks` | `{}` | Lifecycle callbacks for search events |
| `onSearchOpenChange` | `(isOpen: boolean) => void` | — | Callback when search box opens/closes |
| `isSearchBlocked` | `boolean` | `false` | Block search (useful for modals) |
| `searchBoxClassNames` | `SearchBoxClassNames` | — | Custom CSS classes for search box |
| `searchBoxIcons` | `SearchBoxIcons` | — | Custom icon components |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder text for input |
| `containerClassName` | `string` | `''` | Class for content container |
| `containerStyle` | `React.CSSProperties` | — | Inline styles for content container |
| `searchBoxPosition` | `SearchBoxPosition` | `'top-right'` | Where to place the search box |
| `searchBoxStyle` | `React.CSSProperties` | — | Inline styles for search box |
| `searchBoxAriaLabels` | `SearchBoxAriaLabels` | — | Custom ARIA labels for i18n |
| `renderSearchBox` | `(props: SearchBoxRenderProps) => ReactNode` | — | Completely custom search box render |

---

### SearchOptions

Full configuration object for search behavior and styling.

```typescript
interface SearchOptions {
  // --- Core Search ---
  disableBrowserSearch?: boolean;       // Override native Ctrl/Cmd+F (default: true)
  caseSensitive?: boolean;              // Case-sensitive matching (default: false)
  wholeWord?: boolean;                  // Match whole words only (default: false)
  debounceMs?: number;                  // Debounce delay in ms (default: 100)
  minSearchLength?: number;             // Min chars to trigger search (default: 1)
  maxHighlights?: number;               // Max highlights to render (default: 500)

  // --- Colors ---
  highlightColor?: string;              // All matches (default: 'rgba(255, 255, 0, 0.3)')
  currentHighlightColor?: string;       // Active match (default: 'rgba(255, 165, 0, 0.6)')

  // --- Keyboard Shortcut ---
  keyboardShortcut?: KeyboardShortcut;  // Custom shortcut (default: Ctrl/Cmd+F)

  // --- Scroll Behavior ---
  scrollOptions?: ScrollOptions;        // How to scroll to matches

  // --- Highlight Styling ---
  highlightStyle?: HighlightStyle;      // Visual style of highlight elements

  // --- Performance ---
  performance?: PerformanceOptions;     // Tuning for large content

  // --- Advanced ---
  excludeSelector?: string;             // CSS selector for elements to skip
  normalizeText?: (text: string) => string; // Custom text preprocessing
}
```

---

### KeyboardShortcut

Customize which key combination opens the search.

```typescript
interface KeyboardShortcut {
  key: string;      // Key to listen for (e.g., 'f', 'k', '/')
  ctrl?: boolean;   // Require Ctrl key
  meta?: boolean;   // Require Meta/Cmd key
  shift?: boolean;  // Require Shift key
  alt?: boolean;    // Require Alt/Option key
}
```

**Examples:**

```tsx
// Default: Ctrl/Cmd+F
{ key: 'f', ctrl: true, meta: true }

// VS Code-style: Ctrl/Cmd+K
{ key: 'k', ctrl: true, meta: true }

// Slash to search (like GitHub)
{ key: '/', ctrl: false, meta: false }

// Shift+Ctrl+F
{ key: 'f', ctrl: true, meta: true, shift: true }
```

---

### ScrollOptions

Control how matches scroll into view.

```typescript
interface ScrollOptions {
  behavior?: ScrollBehavior;         // 'auto' | 'smooth' (default: 'smooth')
  block?: ScrollLogicalPosition;     // 'start' | 'center' | 'end' | 'nearest' (default: 'center')
  inline?: ScrollLogicalPosition;    // 'start' | 'center' | 'end' | 'nearest' (default: 'nearest')
}
```

**Example:**

```tsx
<SearchableContent
  searchOptions={{
    scrollOptions: {
      behavior: 'auto',    // Instant scroll, no animation
      block: 'start',      // Align match to top of viewport
    },
  }}
>
```

---

### HighlightStyle

Customize the visual appearance of highlight overlays.

```typescript
interface HighlightStyle {
  borderRadius?: string;      // default: '2px'
  border?: string;            // e.g., '1px solid red'
  boxShadow?: string;        // e.g., '0 0 4px rgba(0,0,0,0.3)'
  opacity?: number;           // 0–1 (default: 1)
  zIndex?: number;            // Overlay z-index (default: 999)
  className?: string;         // Extra CSS class on each highlight
  activeClassName?: string;   // Extra CSS class on the current match highlight
}
```

**Example:**

```tsx
<SearchableContent
  searchOptions={{
    highlightStyle: {
      borderRadius: '4px',
      border: '2px solid orange',
      boxShadow: '0 0 8px rgba(255, 165, 0, 0.5)',
      className: 'my-highlight',
      activeClassName: 'my-highlight--active',
    },
  }}
>
```

---

### PerformanceOptions

Fine-tune rendering for large content.

```typescript
interface PerformanceOptions {
  chunkSize?: number;             // Highlights per batch (default: 50)
  useIdleCallback?: boolean;      // Use requestIdleCallback (default: true)
  idleCallbackTimeout?: number;   // Idle callback timeout in ms (default: 100)
}
```

**Example — large documents:**

```tsx
<SearchableContent
  searchOptions={{
    maxHighlights: 1000,
    performance: {
      chunkSize: 100,             // Process more per chunk
      useIdleCallback: true,
      idleCallbackTimeout: 200,   // Give more time
    },
  }}
>
```

---

### SearchCallbacks

React to search lifecycle events.

```typescript
interface SearchCallbacks {
  onSearchStart?: (searchTerm: string) => void;
  onSearchComplete?: (searchTerm: string, matchCount: number) => void;
  onMatchesFound?: (matches: Match[], totalCount: number) => void;
  onCurrentMatchChange?: (match: Match | null, index: number) => void;
  onMaxHighlightsReached?: (limit: number) => void;
}
```

**Example:**

```tsx
<SearchableContent
  searchCallbacks={{
    onSearchStart: (term) => console.log('Searching for:', term),
    onSearchComplete: (term, count) => console.log(`Found ${count} results for "${term}"`),
    onMatchesFound: (matches) => analytics.track('search_results', { count: matches.length }),
    onCurrentMatchChange: (match, idx) => console.log('Now viewing match', idx),
    onMaxHighlightsReached: (limit) => toast.warn(`Showing first ${limit} results`),
  }}
>
```

---

### SearchBoxPosition

Predefined positions or fully custom placement.

```typescript
type SearchBoxPosition = 'top-left' | 'top-right' | 'top-center'
                       | 'bottom-left' | 'bottom-right' | 'bottom-center'
                       | 'custom';
```

**Examples:**

```tsx
// Bottom-center floating search bar
<SearchableContent searchBoxPosition="bottom-center">

// Custom position with inline styles
<SearchableContent
  searchBoxPosition="custom"
  searchBoxStyle={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)' }}
>
```

---

### SearchBoxAriaLabels

Customize accessibility labels (useful for i18n / localization).

```typescript
interface SearchBoxAriaLabels {
  searchInput?: string;      // default: 'Search text'
  previousButton?: string;   // default: 'Previous match'
  nextButton?: string;       // default: 'Next match'
  closeButton?: string;      // default: 'Close search'
  matchStatus?: string;      // default: '{current} of {total} matches'
}
```

**Example — Spanish UI:**

```tsx
<SearchableContent
  searchPlaceholder="Buscar..."
  searchBoxAriaLabels={{
    searchInput: 'Buscar texto',
    previousButton: 'Resultado anterior',
    nextButton: 'Siguiente resultado',
    closeButton: 'Cerrar búsqueda',
    matchStatus: '{current} de {total} resultados',
  }}
>
```

---

### Custom Render Function

For 100% control over the search box UI, use `renderSearchBox`:

```tsx
<SearchableContent
  renderSearchBox={({
    searchTerm,
    totalMatches,
    currentIndex,
    searchInputRef,
    onSearch,
    onNext,
    onPrevious,
    onClose,
    statusText,
  }) => (
    <div className="my-custom-search">
      <input
        ref={searchInputRef}
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Find..."
      />
      <span>{statusText}</span>
      <button onClick={onPrevious}>←</button>
      <button onClick={onNext}>→</button>
      <button onClick={onClose}>✕</button>
    </div>
  )}
>
  <YourContent />
</SearchableContent>
```

---

### Exclude Elements from Search

Skip specific elements using a CSS selector:

```tsx
<SearchableContent
  searchOptions={{
    excludeSelector: '.no-search, [data-no-search], .sidebar',
  }}
>
  <div>
    <p>This text IS searchable</p>
    <p className="no-search">This text is NOT searchable</p>
    <aside data-no-search>Excluded content</aside>
  </div>
</SearchableContent>
```

---

### Text Normalization

Preprocess text before matching (e.g., remove accents):

```tsx
<SearchableContent
  searchOptions={{
    normalizeText: (text) =>
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  }}
>
  <div>
    <p>Café résumé naïve</p>  {/* Matches "cafe", "resume", "naive" */}
  </div>
</SearchableContent>
```

> **Note:** `normalizeText` should ideally preserve string length (character count).
> The common accent-stripping pattern above works correctly because browsers
> store text in NFC form where accented characters are single code points.
> If your normalization changes string length (e.g., ligature expansion),
> highlight positions may be slightly off.

---

### useSearchableContent Hook

For advanced use cases, use the hook directly to build your own UI.

```typescript
import { useSearchableContent } from 'react-search-highlight';

function CustomSearchComponent() {
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
    refresh,       // Call after dynamic content changes
    isSearching,   // True while async highlight rendering is in progress
    config,        // Resolved config (all defaults applied)
  } = useSearchableContent(
    containerRef,
    { highlightColor: 'yellow' },
    false,
    {
      onSearchComplete: (term, count) => console.log(`${count} matches`),
    }
  );

  return (
    <div>
      <button onClick={openSearch}>Open Search</button>
      <div ref={containerRef}>
        {/* Your searchable content */}
      </div>
      {isSearchOpen && (
        <div>
          <input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => search(e.target.value)}
          />
          <span>{matches.length} matches</span>
          <button onClick={goToPrevious}>Prev</button>
          <button onClick={goToNext}>Next</button>
          <button onClick={closeSearch}>Close</button>
        </div>
      )}
    </div>
  );
}
```

The `refresh()` method is useful when your container content changes dynamically (e.g., new messages loaded, content expanded) and you want to re-run the current search.

---

### SearchBoxClassNames

```typescript
interface SearchBoxClassNames {
  container?: string;        // Search box wrapper
  inputWrapper?: string;     // Input field wrapper
  input?: string;            // Input field
  counter?: string;          // Match counter (e.g., "1/5")
  button?: string;           // Navigation buttons
  buttonDisabled?: string;   // Disabled button state
  divider?: string;          // Visual divider
  iconWrapper?: string;      // Icon containers
  spinner?: string;          // Loading spinner
}
```

### SearchBoxIcons

```typescript
interface SearchBoxIcons {
  search?: React.ReactNode;
  previous?: React.ReactNode;
  next?: React.ReactNode;
  close?: React.ReactNode;
  loading?: React.ReactNode;
}
```

Works with any icon library: Lucide, React Icons, Font Awesome, Material UI, custom SVGs, or even emoji.

---

## Use Cases

### 1. Documentation Search
```tsx
<SearchableContent searchPlaceholder="Search docs...">
  <Documentation />
</SearchableContent>
```

### 2. Chat / Messages Search
```tsx
<SearchableContent
  searchOptions={{ debounceMs: 200, minSearchLength: 2 }}
  searchBoxPosition="top-center"
  searchCallbacks={{
    onSearchComplete: (term, count) =>
      console.log(`Found ${count} messages matching "${term}"`),
  }}
>
  <MessageList messages={messages} />
</SearchableContent>
```

### 3. Code Editor Search
```tsx
<SearchableContent
  searchOptions={{
    caseSensitive: true,
    highlightColor: 'rgba(255, 215, 0, 0.3)',
    keyboardShortcut: { key: 'f', ctrl: true, meta: true },
  }}
>
  <CodeBlock code={code} />
</SearchableContent>
```

### 4. i18n-Ready Documentation
```tsx
<SearchableContent
  searchPlaceholder="検索..."
  searchBoxAriaLabels={{
    searchInput: 'テキスト検索',
    previousButton: '前の結果',
    nextButton: '次の結果',
    closeButton: '検索を閉じる',
    matchStatus: '{total}件中{current}件目',
  }}
>
  <JapaneseContent />
</SearchableContent>
```

### 5. Conditional Search Block
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

<SearchableContent isSearchBlocked={isModalOpen}>
  <Content />
</SearchableContent>
```

---

## Default CSS Class Names

All elements have default class names you can target in CSS:

```css
.search-box-container { /* Search box wrapper */ }
.search-box-input-wrapper { /* Input wrapper */ }
.search-box-input { /* Input field */ }
.search-box-counter { /* Match counter */ }
.search-box-button { /* Buttons */ }
.search-box-button-disabled { /* Disabled buttons */ }
.search-box-divider { /* Divider */ }
.search-box-icon { /* Icon wrappers */ }
.text-search-highlight { /* Highlight overlays */ }
.text-search-overlay { /* Overlay container */ }
```

---

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  SearchableContentProps,
  SearchOptions,
  ResolvedSearchOptions,
  SearchBoxClassNames,
  SearchBoxIcons,
  SearchBoxPosition,
  SearchBoxAriaLabels,
  SearchBoxRenderProps,
  Match,
  TextRange,
  KeyboardShortcut,
  ScrollOptions,
  HighlightStyle,
  PerformanceOptions,
  SearchCallbacks,
  UseSearchableContentReturn,
} from 'react-search-highlight';
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd+F (configurable) | Open search |
| Enter | Next match (wraps around) |
| Shift+Enter | Previous match (wraps around) |
| Escape | Close search |

---

## How It Works

The package uses a **non-invasive DOM overlay technique** to highlight search matches:

1. **Text-Node Collection** — A `TreeWalker` collects every text node under the container in a single pass, pre-computing character offsets. `excludeSelector` elements (and their entire subtrees) are skipped via `FILTER_REJECT`.
2. **Text Normalization** — Applies optional `normalizeText` function before matching.
3. **Pattern Matching** — Finds all matches using configurable options (case-sensitive, whole word, max highlights cap).
4. **Range Calculation** — Maps text offsets back to DOM text nodes via **binary search** (`O(log m)`) on the pre-computed node array — no per-range iterator scanning.
5. **Async Chunked Rendering** — Highlights are rendered in configurable batches. Between each batch the browser gets control back via `requestIdleCallback` / `requestAnimationFrame`, keeping the UI responsive on large documents.
6. **Scroll-Aware Positioning** — Highlight coordinates account for the container's scroll offset, so highlights in scrollable containers remain correctly aligned.
7. **Navigation** — Scrolls to matches with configurable scroll behavior and updates highlight colors.

This approach means:
- ✅ Your original content DOM remains unchanged
- ✅ No wrapping of text nodes or DOM manipulation
- ✅ Works with any content (React components, HTML, text, etc.)
- ✅ Highlights automatically adjust on window resize
- ✅ Works correctly in scrollable containers
- ✅ Clean removal when search is closed

## Performance

| Technique | Details |
|---|---|
| **TreeWalker + cached text nodes** | All text nodes are collected once per search (not once per match). `FILTER_REJECT` skips excluded subtrees in O(1). |
| **Binary-search node lookup** | Match offsets are resolved to DOM nodes in O(log m) instead of the previous O(m) linear iterator scan per match. |
| **Truly async chunk rendering** | Highlights are processed in batches (default 50). Between batches the main thread is freed via `requestIdleCallback` / `requestAnimationFrame`, so the UI stays responsive even with thousands of matches. |
| **Debounced search** | Configurable delay (default 100ms) prevents work on every keystroke. |
| **Cancellation token** | Every async chunk checks `activeSearchTermRef` — stale work from a previous keystroke is discarded immediately. |
| **`isSearching` flag** | Tracks in-flight async work so the UI can show a spinner. |
| **Text caching** | Container text and text-node arrays are cached; invalidated on resize or manual `refresh()`. |
| **Scroll-aware positioning** | Highlights account for `scrollLeft`/`scrollTop`, overlay sized to `scrollWidth`/`scrollHeight`. |
| **Maximum highlight limit** | Configurable cap (default 500) with `onMaxHighlightsReached` callback. |

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern browsers with ES2015+ support

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © [Your Name]
