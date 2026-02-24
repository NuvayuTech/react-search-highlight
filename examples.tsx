import React from 'react';
// Note: After publishing to npm, use: import { SearchableContent, useSearchableContent } from 'react-search-highlight';
// For local development, use the dist build or link the package
import { SearchableContent, useSearchableContent } from './src/index';

/**
 * Basic Example - Minimal setup
 */
export function BasicExample() {
  return (
    <SearchableContent>
      <div style={{ padding: '20px' }}>
        <h1>Hello World</h1>
        <p>
          Press Ctrl/Cmd+F to search within this content.
          You can search for words like "search", "content", or "highlight".
        </p>
        <p>
          The search functionality will highlight all matching text
          and allow you to navigate between matches.
        </p>
      </div>
    </SearchableContent>
  );
}

/**
 * Custom Styling Example - With Tailwind CSS classes
 */
export function CustomStyledExample() {
  return (
    <SearchableContent
      searchOptions={{
        highlightColor: 'rgba(59, 130, 246, 0.3)', // Blue highlight
        currentHighlightColor: 'rgba(239, 68, 68, 0.5)', // Red for current
        caseSensitive: false,
        minSearchLength: 2,
      }}
      searchBoxClassNames={{
        container: 'fixed top-4 right-4 bg-white shadow-2xl rounded-xl p-4 flex gap-3 items-center border-2 border-blue-500',
        input: 'px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
        button: 'p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
        counter: 'text-sm font-semibold text-gray-700 min-w-[60px] text-center',
        divider: 'w-px h-8 bg-gray-300',
      }}
      searchPlaceholder="Type to search..."
    >
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">Custom Styled Search</h1>
        <div className="space-y-4">
          <p>This example demonstrates custom styling using Tailwind CSS.</p>
          <p>
            The search box has a blue theme with custom borders and shadows.
            Try searching for "custom", "styling", or "theme".
          </p>
        </div>
      </div>
    </SearchableContent>
  );
}

/**
 * Custom Icons Example - Using custom icon components
 */
export function CustomIconsExample() {
  const customIcons = {
    search: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    previous: <span>↑</span>,
    next: <span>↓</span>,
    close: <span>✕</span>,
    loading: <span className="animate-spin">⟳</span>,
  };

  return (
    <SearchableContent
      searchBoxIcons={customIcons}
      searchOptions={{
        highlightColor: 'rgba(34, 197, 94, 0.3)', // Green
        currentHighlightColor: 'rgba(239, 68, 68, 0.5)', // Red
      }}
    >
      <article style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Custom Icons Example</h1>
        <p>This example uses custom icon components instead of the default SVGs.</p>
        <p>Search to see the custom icons in action!</p>
      </article>
    </SearchableContent>
  );
}

/**
 * Advanced Example - With callbacks and blocked state
 */
export function AdvancedExample() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Open Modal
      </button>

      <SearchableContent
        searchOptions={{
          wholeWord: false,
          caseSensitive: false,
          debounceMs: 150,
        }}
        isSearchBlocked={isModalOpen}
        onSearchOpenChange={setSearchOpen}
      >
        <div style={{ padding: '100px 40px', maxWidth: '900px', margin: '0 auto' }}>
          <h1>Advanced Features Demo</h1>
          <p>Search status: {searchOpen ? 'Open' : 'Closed'}</p>
          <p>
            This example demonstrates:
          </p>
          <ul>
            <li>Blocked search when modal is open</li>
            <li>Search state callback</li>
            <li>Custom search options</li>
          </ul>
          <p>
            Try opening the modal - you'll notice that Ctrl/Cmd+F won't work
            when the modal is open, preventing conflicts.
          </p>
        </div>
      </SearchableContent>

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '40px',
              borderRadius: '12px',
              maxWidth: '500px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Modal</h2>
            <p>Search is blocked while this modal is open.</p>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook Usage Example - Using the hook directly
 */
export function HookExample() {
  const containerRef = React.useRef<HTMLDivElement>(null);
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
    <div style={{ padding: '40px' }}>
      <button
        onClick={openSearch}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Open Custom Search UI
      </button>

      <div ref={containerRef} style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
        <h1>Using the Hook Directly</h1>
        <p>
          This example demonstrates using the useSearchableContent hook
          to build a completely custom search UI.
        </p>
        <p>
          You have full control over the search interface and can integrate
          it however you like into your application.
        </p>
      </div>

      {isSearchOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => search(e.target.value)}
            placeholder="Custom search..."
            style={{
              padding: '8px 12px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
          </span>
          <button onClick={goToPrevious} style={{ padding: '8px 12px' }}>
            ↑
          </button>
          <button onClick={goToNext} style={{ padding: '8px 12px' }}>
            ↓
          </button>
          <button onClick={closeSearch} style={{ padding: '8px 12px' }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
