/**
 * Comprehensive Customization Examples for react-search-highlight
 * 
 * This file demonstrates various ways to customize the SearchableContent component
 * with different styling approaches and icon libraries.
 * 
 * Note: After publishing to npm, use: import { SearchableContent, useSearchableContent } from 'react-search-highlight';
 * For local development, use the dist build or link the package
 */

import { useState, useRef } from 'react';
import { SearchableContent, useSearchableContent } from '../src/index';

// ============================================================================
// Example 1: Using Tailwind CSS with Custom Classes
// ============================================================================

export function TailwindExample() {
  return (
    <SearchableContent
      searchBoxClassNames={{
        container: 'fixed top-6 right-6 z-50 flex items-center gap-3 bg-white shadow-2xl rounded-2xl border-2 border-indigo-500 px-6 py-4 backdrop-blur-sm bg-white/95',
        inputWrapper: 'flex items-center gap-2 flex-1 min-w-[300px]',
        input: 'flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400',
        counter: 'text-sm font-bold text-indigo-600 min-w-[60px] text-center bg-indigo-50 px-3 py-1 rounded-full',
        button: 'p-2.5 rounded-lg transition-all duration-200 hover:bg-indigo-100 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent',
        buttonDisabled: 'opacity-30 cursor-not-allowed',
        divider: 'w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent',
        iconWrapper: 'flex items-center justify-center text-gray-600 w-5 h-5',
      }}
      searchOptions={{
        highlightColor: 'rgba(99, 102, 241, 0.25)',
        currentHighlightColor: 'rgba(99, 102, 241, 0.5)',
        caseSensitive: false,
        minSearchLength: 2,
      }}
      searchPlaceholder="Search with Tailwind styles..."
    >
      <div className="max-w-4xl mx-auto p-12 space-y-6">
        <h1 className="text-5xl font-bold text-gray-900">Tailwind Styled Search</h1>
        <p className="text-lg text-gray-700">
          This example uses Tailwind CSS classes for a modern, polished look.
          Try searching for "Tailwind", "styled", or "modern".
        </p>
        <p className="text-gray-600">
          The search box has a glassmorphism effect with indigo accent colors,
          smooth transitions, and hover effects on all interactive elements.
        </p>
      </div>
    </SearchableContent>
  );
}

// ============================================================================
// Example 2: Dark Mode Theme
// ============================================================================

export function DarkModeExample() {
  return (
    <SearchableContent
      searchBoxClassNames={{
        container: 'fixed top-6 right-6 bg-gray-900 text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl px-6 py-4 flex gap-4 items-center border border-gray-700',
        inputWrapper: 'flex gap-3 items-center flex-1',
        input: 'bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500 transition-all',
        counter: 'text-sm text-gray-300 font-semibold min-w-[60px] text-center bg-gray-800 px-3 py-1 rounded-lg',
        button: 'p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed',
        divider: 'w-px h-8 bg-gray-700',
        iconWrapper: 'w-5 h-5',
      }}
      searchOptions={{
        highlightColor: 'rgba(59, 130, 246, 0.3)',
        currentHighlightColor: 'rgba(96, 165, 250, 0.5)',
      }}
      searchPlaceholder="Search in the dark..."
    >
      <div className="bg-gray-950 min-h-screen p-12 text-white">
        <h1 className="text-4xl font-bold mb-6">Dark Mode Search Interface</h1>
        <div className="space-y-4 text-gray-300">
          <p>
            This example demonstrates a dark theme optimized for low-light environments.
            The search box integrates seamlessly with the dark background.
          </p>
          <p>
            Try searching for terms like "dark", "mode", or "interface" to see
            the blue highlight colors against the dark background.
          </p>
          <p>
            Notice the subtle hover effects and focus states designed for accessibility
            while maintaining the dark aesthetic.
          </p>
        </div>
      </div>
    </SearchableContent>
  );
}

// ============================================================================
// Example 3: Minimalist Floating Design
// ============================================================================

export function MinimalistExample() {
  return (
    <SearchableContent
      searchBoxClassNames={{
        container: 'fixed top-8 right-8 bg-white/90 backdrop-blur-lg rounded-full px-6 py-3 flex gap-2 items-center shadow-lg border border-gray-200/50',
        inputWrapper: 'flex gap-2 items-center',
        input: 'bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-[200px] focus:w-[250px] transition-all duration-300',
        counter: 'text-xs text-gray-500 font-medium min-w-[45px] text-center',
        button: 'p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200 disabled:opacity-20',
        divider: 'w-px h-5 bg-gray-300',
        iconWrapper: 'w-4 h-4 flex items-center justify-center text-gray-500',
      }}
      searchBoxIcons={{
        search: <span style={{ fontSize: '16px' }}>🔍</span>,
        previous: <span style={{ fontSize: '14px' }}>↑</span>,
        next: <span style={{ fontSize: '14px' }}>↓</span>,
        close: <span style={{ fontSize: '14px' }}>✕</span>,
      }}
      searchPlaceholder="Search..."
    >
      <div className="max-w-3xl mx-auto p-16 space-y-6">
        <h1 className="text-4xl font-light text-gray-800">Minimalist Design</h1>
        <p className="text-gray-600 leading-relaxed">
          Clean, simple, and effective. This minimalist search interface
          features a floating pill-shaped design that expands on focus.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Using emoji icons keeps the design lightweight and playful while
          maintaining full functionality.
        </p>
      </div>
    </SearchableContent>
  );
}

// ============================================================================
// Example 4: Custom Icons with Lucide React (if installed)
// ============================================================================

export function CustomIconsExample() {
  // Simulated custom icons - replace with actual icon library
  const CustomIcons = {
    Search: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    ChevronUp: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    ),
    ChevronDown: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    X: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    Loader: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ),
  };

  return (
    <SearchableContent
      searchBoxIcons={{
        search: <CustomIcons.Search />,
        previous: <CustomIcons.ChevronUp />,
        next: <CustomIcons.ChevronDown />,
        close: <CustomIcons.X />,
        loading: <CustomIcons.Loader />,
      }}
      searchBoxClassNames={{
        container: 'fixed top-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl rounded-xl px-5 py-3 flex gap-3 items-center',
        input: 'bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg border border-white/30 focus:border-white/60 focus:outline-none placeholder-white/60',
        counter: 'text-sm font-bold min-w-[50px] text-center',
        button: 'p-2 hover:bg-white/20 rounded-lg transition-all',
        divider: 'w-px h-6 bg-white/30',
      }}
      searchOptions={{
        highlightColor: 'rgba(168, 85, 247, 0.4)',
        currentHighlightColor: 'rgba(236, 72, 153, 0.5)',
      }}
    >
      <div className="p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Custom Icons Example</h1>
        <p className="text-gray-700">
          This example shows how to use custom SVG icons with your search interface.
          You can use any icon library like Lucide, React Icons, Font Awesome, or custom SVGs.
        </p>
      </div>
    </SearchableContent>
  );
}

// ============================================================================
// Example 5: Material Design Style
// ============================================================================

export function MaterialDesignExample() {
  return (
    <SearchableContent
      searchBoxClassNames={{
        container: 'fixed top-6 right-6 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] rounded-lg px-4 py-3 flex gap-3 items-center',
        inputWrapper: 'flex gap-2 items-center flex-1',
        input: 'border-b-2 border-gray-300 focus:border-blue-600 outline-none px-2 py-1.5 text-sm transition-colors bg-transparent',
        counter: 'text-sm text-gray-600 font-medium min-w-[50px] text-center',
        button: 'p-2 hover:bg-gray-100 rounded-full transition-all duration-200 disabled:opacity-40',
        iconWrapper: 'text-gray-600 w-5 h-5 flex items-center justify-center',
        divider: 'w-px h-6 bg-gray-300 mx-1',
      }}
      searchOptions={{
        highlightColor: 'rgba(33, 150, 243, 0.25)',
        currentHighlightColor: 'rgba(33, 150, 243, 0.45)',
      }}
      searchPlaceholder="Material search..."
    >
      <div className="max-w-4xl mx-auto p-12">
        <h1 className="text-4xl font-normal text-gray-800 mb-6">Material Design</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          This example follows Material Design principles with elevation shadows,
          underlined input fields, and circular button ripples.
        </p>
        <p className="text-gray-600 leading-relaxed">
          The clean, structured layout emphasizes usability and follows Google's
          design language for a familiar user experience.
        </p>
      </div>
    </SearchableContent>
  );
}

// ============================================================================
// Example 6: Bottom Floating Search Bar
// ============================================================================

export function BottomFloatingExample() {
  return (
    <SearchableContent
      searchBoxClassNames={{
        container: 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] rounded-full px-6 py-3 flex gap-3 items-center',
        inputWrapper: 'flex gap-2 items-center flex-1',
        input: 'bg-white/20 backdrop-blur text-white px-5 py-2.5 rounded-full border border-white/30 focus:border-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/70 min-w-[280px]',
        counter: 'text-sm font-bold min-w-[55px] text-center bg-white/20 px-3 py-1 rounded-full',
        button: 'p-2 hover:bg-white/20 rounded-full transition-all duration-200 disabled:opacity-30',
        divider: 'w-px h-7 bg-white/30',
        iconWrapper: 'w-5 h-5',
      }}
      searchOptions={{
        highlightColor: 'rgba(6, 182, 212, 0.35)',
        currentHighlightColor: 'rgba(14, 165, 233, 0.55)',
      }}
      searchPlaceholder="Search from the bottom..."
    >
      <div className="min-h-screen p-16 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">Bottom Floating Search</h1>
        <div className="space-y-6 text-gray-700 max-w-3xl">
          <p className="text-lg">
            The search bar floats at the bottom center of the screen,
            perfect for mobile-first designs or command palette-like interfaces.
          </p>
          <p>
            The gradient background with glassmorphism effects creates a modern,
            eye-catching design that stands out from the content.
          </p>
          <p>
            Try scrolling down to see how the search bar stays fixed at the bottom,
            always accessible no matter where you are on the page.
          </p>
        </div>
      </div>
    </SearchableContent>
  );
}

// ============================================================================
// Example 7: Compact Sidebar Style
// ============================================================================

export function CompactSidebarExample() {
  return (
    <SearchableContent
      searchBoxClassNames={{
        container: 'fixed left-6 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-2xl p-4 flex flex-col gap-3 items-center border border-gray-200',
        inputWrapper: 'flex flex-col gap-2 items-center',
        input: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        counter: 'text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded',
        button: 'w-full p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30',
        divider: 'h-px w-full bg-gray-300',
        iconWrapper: 'w-5 h-5 text-gray-600',
      }}
      searchPlaceholder="Search"
    >
      <div className="ml-32 p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Sidebar Search</h1>
        <p className="text-gray-700">
          This vertical layout is perfect for sidebar placements.
          The compact design saves horizontal space while maintaining functionality.
        </p>
      </div>
    </SearchableContent>
  );
}

// ============================================================================
// Example 8: Using the Hook Directly for Complete Custom UI
// ============================================================================

export function CompletelyCustomUIExample() {
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
    caseSensitive: false,
  });

  return (
    <div className="relative">
      {/* Custom trigger button */}
      <button
        onClick={openSearch}
        className="fixed top-6 right-6 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 font-semibold"
      >
        🔍 Open Custom Search
      </button>

      {/* Your content */}
      <div ref={containerRef} className="p-16 max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">
          Completely Custom Search UI
        </h1>
        <div className="space-y-6 text-gray-700">
          <p className="text-lg">
            This example uses the <code className="bg-gray-100 px-2 py-1 rounded">useSearchableContent</code> hook
            directly to create a 100% custom search interface.
          </p>
          <p>
            You have complete control over the UI, positioning, styling, and behavior.
            The hook handles all the search logic and highlighting for you.
          </p>
          <p>
            Click the custom button in the top-right to see the custom search interface.
            Try searching for "custom", "hook", or "control".
          </p>
        </div>
      </div>

      {/* Completely custom search UI */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Search Content</h2>
              <button
                onClick={closeSearch}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search term
                </label>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => search(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-lg transition-all"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Results:</span>
                  <span className="ml-2 text-2xl font-bold text-amber-600">
                    {matches.length > 0 ? `${currentIndex + 1} / ${matches.length}` : '0 matches'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={goToPrevious}
                    disabled={matches.length === 0 || currentIndex === 0}
                    className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={matches.length === 0 || currentIndex === matches.length - 1}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Press <kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> to close
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 9: Theme Switcher
// ============================================================================

export function ThemeSwitcherExample() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'neon'>('light');

  const themes = {
    light: {
      classNames: {
        container: 'fixed top-6 right-6 bg-white shadow-lg rounded-xl px-5 py-3 flex gap-3 items-center border border-gray-200',
        input: 'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        button: 'p-2 hover:bg-gray-100 rounded-lg transition-colors',
        counter: 'text-sm font-semibold text-gray-700',
      },
      options: {
        highlightColor: 'rgba(59, 130, 246, 0.3)',
        currentHighlightColor: 'rgba(37, 99, 235, 0.5)',
      },
    },
    dark: {
      classNames: {
        container: 'fixed top-6 right-6 bg-gray-900 text-white shadow-2xl rounded-xl px-5 py-3 flex gap-3 items-center border border-gray-700',
        input: 'px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500',
        button: 'p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-300 hover:text-white',
        counter: 'text-sm font-semibold text-gray-300',
      },
      options: {
        highlightColor: 'rgba(96, 165, 250, 0.3)',
        currentHighlightColor: 'rgba(147, 197, 253, 0.5)',
      },
    },
    neon: {
      classNames: {
        container: 'fixed top-6 right-6 bg-black text-lime-400 shadow-[0_0_30px_rgba(132,204,22,0.5)] rounded-xl px-5 py-3 flex gap-3 items-center border-2 border-lime-400',
        input: 'px-4 py-2 bg-black text-lime-400 border-2 border-lime-400 rounded-lg focus:ring-2 focus:ring-lime-400 focus:shadow-[0_0_10px_rgba(132,204,22,0.5)] placeholder-lime-600',
        button: 'p-2 hover:bg-lime-400/20 rounded-lg transition-all text-lime-400',
        counter: 'text-sm font-bold text-lime-400 bg-lime-400/20 px-3 py-1 rounded-lg',
      },
      options: {
        highlightColor: 'rgba(132, 204, 22, 0.3)',
        currentHighlightColor: 'rgba(163, 230, 53, 0.5)',
      },
    },
  };

  return (
    <div className={theme === 'dark' ? 'bg-gray-950 min-h-screen' : theme === 'neon' ? 'bg-black min-h-screen' : 'bg-white min-h-screen'}>
      <div className="fixed top-6 left-6 flex gap-2">
        <button
          onClick={() => setTheme('light')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Dark
        </button>
        <button
          onClick={() => setTheme('neon')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${theme === 'neon' ? 'bg-lime-500 text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Neon
        </button>
      </div>

      <SearchableContent
        searchBoxClassNames={themes[theme].classNames}
        searchOptions={themes[theme].options}
      >
        <div className={`p-20 ${theme === 'dark' ? 'text-white' : theme === 'neon' ? 'text-lime-400' : 'text-gray-900'}`}>
          <h1 className="text-5xl font-bold mb-6">Theme Switcher</h1>
          <p className="text-lg mb-4">
            Switch between Light, Dark, and Neon themes to see dynamic styling in action.
            The search box and highlights adapt to each theme automatically.
          </p>
          <p>
            Current theme: <strong className={theme === 'neon' ? 'text-lime-300' : ''}>{theme}</strong>
          </p>
        </div>
      </SearchableContent>
    </div>
  );
}

// ============================================================================
// Export all examples
// ============================================================================

export default {
  TailwindExample,
  DarkModeExample,
  MinimalistExample,
  CustomIconsExample,
  MaterialDesignExample,
  BottomFloatingExample,
  CompactSidebarExample,
  CompletelyCustomUIExample,
  ThemeSwitcherExample,
};
