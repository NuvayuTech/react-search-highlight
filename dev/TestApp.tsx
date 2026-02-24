import React, { useState, useRef } from 'react';
import { SearchableContent, useSearchableContent } from '../src';

/**
 * Test file — delete after manual testing.
 * 
 * Usage:
 *   1. Import <TestApp /> into your dev app's root
 *   2. Or run in a simple Vite/CRA setup that resolves TSX
 */

// ─── Tab 1: Basic Usage ──────────────────────────────────────────────────────

const BasicTest = () => (
  <SearchableContent
    searchOptions={{ highlightColor: 'rgba(255, 255, 0, 0.4)' }}
    searchBoxPosition="top-right"
    containerClassName="test-container"
    containerStyle={{ padding: 24, border: '1px solid #ddd', borderRadius: 8, position: 'relative', maxHeight: 400, overflow: 'auto' }}
  >
    <h2>Basic Search Test</h2>
    <p>Press <strong>Ctrl+F</strong> (or <strong>Cmd+F</strong> on Mac) to open the search box.</p>
    <p>Try searching for "React" or "search" or "highlight" in this content.</p>
    <p>
      React is a JavaScript library for building user interfaces. It lets you compose
      complex UIs from small and isolated pieces of code called "components". React
      has been designed from the start for gradual adoption, and you can use as little
      or as much React as you need.
    </p>
    <p>
      This library adds search and highlight functionality to any React content. It
      works by creating an overlay with positioned highlight elements, so your original
      DOM remains completely untouched.
    </p>
    <ul>
      <li>Search within nested elements</li>
      <li>Highlight all matches with customizable colors</li>
      <li>Navigate between matches with keyboard or buttons</li>
      <li>Case-sensitive and whole-word options</li>
      <li>Performance optimized for large documents</li>
    </ul>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
      nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <p>
      The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the
      lazy dog. The quick brown fox jumps over the lazy dog. Search for "fox" or "dog"
      to see multiple matches highlighted.
    </p>
  </SearchableContent>
);

// ─── Tab 2: Custom Styling & Icons ───────────────────────────────────────────

const StyledTest = () => (
  <SearchableContent
    searchOptions={{
      highlightColor: 'rgba(59, 130, 246, 0.3)',
      currentHighlightColor: 'rgba(239, 68, 68, 0.5)',
      highlightStyle: {
        borderRadius: '4px',
        border: '1px solid rgba(59, 130, 246, 0.6)',
        boxShadow: '0 0 6px rgba(59, 130, 246, 0.4)',
        activeClassName: 'active-highlight',
      },
      scrollOptions: { behavior: 'smooth', block: 'center' },
    }}
    searchBoxPosition="top-center"
    searchBoxClassNames={{
      container: 'search-box-container',
      input: 'search-box-input',
    }}
    searchBoxStyle={{
      background: '#1e293b',
      color: '#e2e8f0',
      borderRadius: 12,
      padding: '8px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}
    searchPlaceholder="Find in page..."
    containerStyle={{ padding: 24, border: '1px solid #334155', borderRadius: 8, background: '#f8fafc', position: 'relative' }}
  >
    <h2>Custom Styled Search</h2>
    <p>This test shows custom highlight colors (blue highlights, red active), custom search box styling (dark theme, centered), and smooth scrolling.</p>
    <p>Search for common words like "custom", "styled", or "search" to see the blue highlights with borders and shadows.</p>
    <div style={{ marginTop: 16 }}>
      <h3>Features Being Tested</h3>
      <ul>
        <li>Custom highlight color (blue)</li>
        <li>Custom active highlight color (red)</li>
        <li>Border and box-shadow on highlights</li>
        <li>Custom border radius (4px)</li>
        <li>Dark-themed search box</li>
        <li>Center-positioned search box</li>
        <li>Smooth scroll to matches</li>
      </ul>
    </div>
  </SearchableContent>
);

// ─── Tab 3: Advanced Options ─────────────────────────────────────────────────

const AdvancedTest = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));

  return (
    <div>
      <SearchableContent
        searchOptions={{
          caseSensitive: false,
          wholeWord: false,
          debounceMs: 150,
          minSearchLength: 2,
          maxHighlights: 100,
          excludeSelector: '.no-search',
          performance: { chunkSize: 25, useIdleCallback: true },
        }}
        searchCallbacks={{
          onSearchStart: (term) => addLog(`🔍 Search started: "${term}"`),
          onSearchComplete: (term, count) => addLog(`✅ Complete: "${term}" → ${count} matches`),
          onMatchesFound: (matches) => addLog(`📍 Matches found: ${matches.length}`),
          onCurrentMatchChange: (_match, idx) => addLog(`➡️ Current match: #${idx}`),
          onMaxHighlightsReached: (limit) => addLog(`⚠️ Max highlights reached: ${limit}`),
        }}
        searchBoxPosition="top-right"
        searchPlaceholder="Min 2 chars..."
        containerStyle={{ padding: 24, border: '1px solid #ddd', borderRadius: 8, position: 'relative' }}
      >
        <h2>Advanced Options Test</h2>
        <p>This test uses <strong>minSearchLength: 2</strong>, so single characters won't trigger a search.</p>
        <p>It also uses <strong>excludeSelector: '.no-search'</strong> — text in excluded elements won't be found.</p>

        <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 6, margin: '12px 0' }}>
          <p>✅ This paragraph IS searchable. Try searching for "searchable".</p>
        </div>

        <div className="no-search" style={{ background: '#fef2f2', padding: 12, borderRadius: 6, margin: '12px 0' }}>
          <p>❌ This paragraph is NOT searchable (has className="no-search"). Try searching for "excluded" — it won't match here.</p>
          <p>excluded excluded excluded — none of these will highlight.</p>
        </div>

        <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 6, margin: '12px 0' }}>
          <p>✅ This is searchable again. The word "excluded" here WILL be found.</p>
        </div>

        <p>Lifecycle callbacks are logged below. Watch as you search, navigate, etc.</p>
      </SearchableContent>

      {/* Callback log */}
      <div style={{ marginTop: 16, padding: 12, background: '#1e293b', color: '#a5f3fc', borderRadius: 8, fontFamily: 'monospace', fontSize: 12, maxHeight: 200, overflow: 'auto' }}>
        <strong style={{ color: '#fbbf24' }}>Callback Log:</strong>
        {logs.length === 0 && <div style={{ color: '#64748b', marginTop: 4 }}>Open search and type to see callbacks...</div>}
        {logs.map((log, i) => (
          <div key={i} style={{ marginTop: 2 }}>{log}</div>
        ))}
      </div>
    </div>
  );
};

// ─── Tab 4: Hook API ─────────────────────────────────────────────────────────

const HookTest = () => {
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
    openSearch,
    closeSearch,
    refresh,
  } = useSearchableContent(containerRef, {
    highlightColor: 'rgba(168, 85, 247, 0.3)',
    currentHighlightColor: 'rgba(168, 85, 247, 0.7)',
    disableBrowserSearch: false, // Don't override Ctrl+F for this one
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={openSearch} style={btnStyle}>Open Search</button>
        <button onClick={closeSearch} style={btnStyle}>Close Search</button>
        <button onClick={refresh} style={btnStyle}>Refresh</button>
        <span style={{ padding: '6px 12px', background: '#f3e8ff', borderRadius: 6, fontSize: 13 }}>
          {isSearching ? '⏳ Searching...' : `${matches.length} matches | Current: ${currentIndex + 1}`}
        </span>
      </div>

      {isSearchOpen && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => search(e.target.value)}
            placeholder="Hook-powered search..."
            style={{ padding: '8px 12px', border: '2px solid #a855f7', borderRadius: 8, outline: 'none', flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goToNext();
              if (e.key === 'Escape') closeSearch();
            }}
          />
          <button onClick={goToPrevious} style={btnStyle}>⬆ Prev</button>
          <button onClick={goToNext} style={btnStyle}>⬇ Next</button>
        </div>
      )}

      <div
        ref={containerRef}
        style={{ padding: 24, border: '2px solid #e9d5ff', borderRadius: 8, position: 'relative' }}
      >
        <h2>Hook API Test</h2>
        <p>This test uses the <code>useSearchableContent</code> hook directly with a completely custom UI.</p>
        <p>Click "Open Search" above to start (Ctrl+F is NOT overridden for this test).</p>
        <p>
          The hook gives you full control: searchTerm, matches, currentIndex, isSearching,
          goToNext, goToPrevious, refresh — everything you need to build your own search UI.
        </p>
        <p>
          Purple highlights are used here. Search for "hook", "test", "purple", or any word
          to see the custom-colored highlights.
        </p>
        <blockquote style={{ borderLeft: '3px solid #a855f7', paddingLeft: 12, margin: '16px 0', color: '#6b21a8' }}>
          "The best way to predict the future is to implement it." — Alan Kay
        </blockquote>
      </div>
    </div>
  );
};

// ─── Tab 5: Large Content (Performance) ──────────────────────────────────────

const LargeContentTest = () => {
  const paragraphs = Array.from({ length: 50 }, (_, i) => (
    <p key={i} style={{ marginBottom: 8 }}>
      Paragraph {i + 1}: The quick brown fox jumps over the lazy dog. React search
      highlight makes it easy to find text within large documents. This library uses
      TreeWalker with binary search for O(log m) node lookups and async chunked
      rendering to keep the UI responsive. Performance is key when dealing with
      thousands of text nodes and hundreds of matches. Search for "fox", "React",
      "performance", or "search" to test with many highlights.
    </p>
  ));

  return (
    <SearchableContent
      searchOptions={{
        maxHighlights: 1000,
        performance: { chunkSize: 100, useIdleCallback: true, idleCallbackTimeout: 200 },
      }}
      searchCallbacks={{
        onSearchComplete: (term, count) => console.log(`[Perf Test] "${term}" → ${count} matches`),
        onMaxHighlightsReached: (limit) => console.log(`[Perf Test] Hit limit: ${limit}`),
      }}
      searchBoxPosition="top-right"
      containerStyle={{ padding: 24, border: '1px solid #ddd', borderRadius: 8, position: 'relative', maxHeight: 500, overflow: 'auto' }}
    >
      <h2>Large Content Performance Test</h2>
      <p><strong>50 paragraphs below.</strong> Search for common words to generate many highlights. Check the console for timing logs.</p>
      <hr style={{ margin: '16px 0' }} />
      {paragraphs}
    </SearchableContent>
  );
};

// ─── Tab 6: Custom Render Function ───────────────────────────────────────────

const CustomRenderTest = () => (
  <SearchableContent
    searchBoxPosition="custom"
    renderSearchBox={({ searchTerm, totalMatches, currentIndex, searchInputRef, onSearch, onNext, onPrevious, onClose, isSearching, statusText }) => (
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', padding: '12px 24px', borderRadius: 50,
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
        zIndex: 9999,
      }}>
        <span style={{ fontSize: 18 }}>🔎</span>
        <input
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Custom search..."
          style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', outline: 'none',
            color: 'white', padding: '6px 12px', borderRadius: 20, width: 200,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.shiftKey ? onPrevious() : onNext();
            if (e.key === 'Escape') onClose();
          }}
        />
        <span style={{ fontSize: 13, opacity: 0.9 }}>{isSearching ? '⏳' : statusText}</span>
        <button onClick={onPrevious} style={{ ...pillBtn, background: 'rgba(255,255,255,0.2)' }}>↑</button>
        <button onClick={onNext} style={{ ...pillBtn, background: 'rgba(255,255,255,0.2)' }}>↓</button>
        <button onClick={onClose} style={{ ...pillBtn, background: 'rgba(255,255,255,0.2)' }}>✕</button>
      </div>
    )}
    containerStyle={{ padding: 24, border: '1px solid #ddd', borderRadius: 8, position: 'relative' }}
  >
    <h2>Custom Render Function Test</h2>
    <p>Press Ctrl/Cmd+F to see a <strong>completely custom</strong> floating search bar rendered at the bottom of the screen.</p>
    <p>The gradient pill-shaped search bar is built using the <code>renderSearchBox</code> prop.</p>
    <p>
      You get all the props you need: searchTerm, totalMatches, currentIndex, refs, callbacks —
      just wire them up to your own UI.
    </p>
    <p>Search for "custom", "gradient", "render", or "search" to test it.</p>
  </SearchableContent>
);

// ─── Shared styles ───────────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#7c3aed',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
};

const pillBtn: React.CSSProperties = {
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  borderRadius: '50%',
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
};

// ─── Main Test App ───────────────────────────────────────────────────────────

const tabs = [
  { label: '🔍 Basic', component: BasicTest },
  { label: '🎨 Styled', component: StyledTest },
  { label: '⚙️ Advanced', component: AdvancedTest },
  { label: '🪝 Hook API', component: HookTest },
  { label: '⚡ Large Content', component: LargeContentTest },
  { label: '🎭 Custom Render', component: CustomRenderTest },
];

const TestApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = tabs[activeTab].component;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>react-search-highlight — Test Suite</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Select a tab below to test different features. Press Ctrl/Cmd+F to open search in each tab.</p>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === i ? 600 : 400,
              background: activeTab === i ? '#3b82f6' : '#f1f5f9',
              color: activeTab === i ? 'white' : '#334155',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <ActiveComponent />
    </div>
  );
};

export default TestApp;
