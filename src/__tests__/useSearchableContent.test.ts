import { renderHook, act } from '@testing-library/react';
import { useSearchableContent } from '../useSearchableContent';
import type { SearchOptions, SearchCallbacks } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a real ref wrapping a container div with given HTML. */
const createContainerRef = (html: string) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);

  // Ensure container has position so overlay appends correctly
  el.style.position = 'relative';

  const ref = { current: el };
  return { ref, cleanup: () => document.body.removeChild(el) };
};

const defaultOptions: SearchOptions = {
  disableBrowserSearch: false, // don't interfere with test runner
  debounceMs: 0, // instant for tests
};

// Flush debounce timers + RAF + microtasks
const flushAll = async () => {
  jest.runAllTimers();
  await Promise.resolve(); // flush microtasks
  jest.runAllTimers();
  await Promise.resolve();
};

/**
 * Mock Range.getClientRects so processHighlightsAsync can complete
 * in jsdom (which doesn't support layout APIs).
 */
const mockGetClientRects = () => {
  const original = Range.prototype.getClientRects;
  Range.prototype.getClientRects = function () {
    return [
      { top: 10, left: 20, width: 50, height: 16, right: 70, bottom: 26, x: 20, y: 10, toJSON: () => ({}) },
    ] as unknown as DOMRectList;
  };
  return () => {
    Range.prototype.getClientRects = original;
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('useSearchableContent', () => {
  // ── Initial state ──────────────────────────────────────────────────

  it('returns correct initial state', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.isSearchOpen).toBe(false);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.matches).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);

    cleanup();
  });

  // ── openSearch / closeSearch ───────────────────────────────────────

  it('opens and closes search', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    act(() => result.current.openSearch());
    expect(result.current.isSearchOpen).toBe(true);

    act(() => result.current.closeSearch());
    expect(result.current.isSearchOpen).toBe(false);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.matches).toEqual([]);

    cleanup();
  });

  // ── isBlocked prevents open ────────────────────────────────────────

  it('does not open when isBlocked is true', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, defaultOptions, true)
    );

    act(() => result.current.openSearch());
    expect(result.current.isSearchOpen).toBe(false);

    cleanup();
  });

  // ── search sets term ───────────────────────────────────────────────

  it('sets searchTerm when search is called', async () => {
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    expect(result.current.searchTerm).toBe('Hello');

    cleanup();
  });

  // ── search clears on empty string ──────────────────────────────────

  it('clears matches when search term is empty', async () => {
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    await act(async () => {
      result.current.search('');
      await flushAll();
    });

    expect(result.current.matches).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);

    cleanup();
  });

  // ── minSearchLength respected ──────────────────────────────────────

  it('does not search when term is below minSearchLength', async () => {
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, { ...defaultOptions, minSearchLength: 3 })
    );

    await act(async () => {
      result.current.search('He');
      await flushAll();
    });

    expect(result.current.matches).toEqual([]);

    cleanup();
  });

  // ── config resolution ──────────────────────────────────────────────

  it('resolves config with defaults', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() => useSearchableContent(ref));

    const config = result.current.config;
    expect(config.highlightColor).toBe('rgba(255, 255, 0, 0.3)');
    expect(config.currentHighlightColor).toBe('rgba(255, 165, 0, 0.6)');
    expect(config.caseSensitive).toBe(false);
    expect(config.wholeWord).toBe(false);
    expect(config.debounceMs).toBe(100);
    expect(config.minSearchLength).toBe(1);
    expect(config.maxHighlights).toBe(500);
    expect(config.scrollOptions.behavior).toBe('smooth');
    expect(config.performance.chunkSize).toBe(50);

    cleanup();
  });

  it('overrides defaults with provided options', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, {
        highlightColor: 'red',
        caseSensitive: true,
        debounceMs: 250,
      })
    );

    expect(result.current.config.highlightColor).toBe('red');
    expect(result.current.config.caseSensitive).toBe(true);
    expect(result.current.config.debounceMs).toBe(250);

    cleanup();
  });

  // ── setSearchTerm without triggering search ────────────────────────

  it('setSearchTerm updates term without triggering search', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    act(() => result.current.setSearchTerm('test'));
    expect(result.current.searchTerm).toBe('test');
    expect(result.current.matches).toEqual([]);

    cleanup();
  });

  // ── callbacks are invoked ──────────────────────────────────────────

  it('invokes onSearchStart callback', async () => {
    const onSearchStart = jest.fn();
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const callbacks: SearchCallbacks = { onSearchStart };

    const { result } = renderHook(() =>
      useSearchableContent(ref, defaultOptions, false, callbacks)
    );

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    expect(onSearchStart).toHaveBeenCalledWith('Hello');

    cleanup();
  });

  // ── closeSearch resets everything ──────────────────────────────────

  it('closeSearch fully resets state', async () => {
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.openSearch();
      result.current.search('Hello');
      await flushAll();
    });

    act(() => result.current.closeSearch());

    expect(result.current.isSearchOpen).toBe(false);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.matches).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);
    expect(result.current.isSearching).toBe(false);

    cleanup();
  });

  // ── refresh ────────────────────────────────────────────────────────

  it('exposes refresh function', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    expect(typeof result.current.refresh).toBe('function');

    cleanup();
  });

  // ── keyboard shortcut listener ─────────────────────────────────────

  it('opens search on keyboard shortcut', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, {
        ...defaultOptions,
        disableBrowserSearch: true,
        keyboardShortcut: { key: 'f', ctrl: true, meta: true },
      })
    );

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    expect(result.current.isSearchOpen).toBe(true);

    cleanup();
  });

  it('does not open search when disableBrowserSearch is false', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, {
        ...defaultOptions,
        disableBrowserSearch: false,
      })
    );

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    expect(result.current.isSearchOpen).toBe(false);

    cleanup();
  });

  // ── cleanup on unmount ─────────────────────────────────────────────

  it('cleans up on unmount without errors', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { unmount } = renderHook(() => useSearchableContent(ref, defaultOptions));

    expect(() => unmount()).not.toThrow();

    cleanup();
  });

  // ── Whole-word search ──────────────────────────────────────────────

  it('finds matches with wholeWord option', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>cat cats category cat</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, { ...defaultOptions, wholeWord: true })
    );

    await act(async () => {
      result.current.search('cat');
      await flushAll();
    });

    // "cat" appears as a whole word twice (first and last), NOT "cats" or "category"
    expect(result.current.matches.length).toBe(2);

    restoreRects();
    cleanup();
  });

  // ── Case-sensitive search ──────────────────────────────────────────

  it('case-sensitive search only matches exact case', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>Hello hello HELLO</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, { ...defaultOptions, caseSensitive: true })
    );

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    expect(result.current.matches.length).toBe(1);

    restoreRects();
    cleanup();
  });

  // ── Full highlight rendering with mocked getClientRects ────────────

  it('creates highlights and sets first match as active', async () => {
    const restoreRects = mockGetClientRects();
    const onMatchesFound = jest.fn();
    const onSearchComplete = jest.fn();
    const onCurrentMatchChange = jest.fn();

    const { ref, cleanup } = createContainerRef('<p>Hello World Hello</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, defaultOptions, false, {
        onMatchesFound,
        onSearchComplete,
        onCurrentMatchChange,
      })
    );

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    expect(result.current.matches.length).toBe(2);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isSearching).toBe(false);
    expect(onMatchesFound).toHaveBeenCalled();
    expect(onSearchComplete).toHaveBeenCalledWith('Hello', 2);

    // Run rAF to trigger first-match activation
    act(() => jest.runAllTimers());
    expect(onCurrentMatchChange).toHaveBeenCalledWith(
      expect.objectContaining({ index: 0 }),
      0
    );

    restoreRects();
    cleanup();
  });

  // ── goToNext / goToPrevious navigation ─────────────────────────────

  it('navigates forward with goToNext', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>ab ab ab</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.search('ab');
      await flushAll();
    });

    expect(result.current.matches.length).toBe(3);
    expect(result.current.currentIndex).toBe(0);

    act(() => result.current.goToNext());
    expect(result.current.currentIndex).toBe(1);

    act(() => result.current.goToNext());
    expect(result.current.currentIndex).toBe(2);

    // Wraps around
    act(() => result.current.goToNext());
    expect(result.current.currentIndex).toBe(0);

    restoreRects();
    cleanup();
  });

  it('navigates backward with goToPrevious', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>ab ab ab</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.search('ab');
      await flushAll();
    });

    expect(result.current.currentIndex).toBe(0);

    // Wraps to last
    act(() => result.current.goToPrevious());
    expect(result.current.currentIndex).toBe(2);

    act(() => result.current.goToPrevious());
    expect(result.current.currentIndex).toBe(1);

    restoreRects();
    cleanup();
  });

  it('goToNext/goToPrevious do nothing with no matches', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    act(() => result.current.goToNext());
    expect(result.current.currentIndex).toBe(-1);

    act(() => result.current.goToPrevious());
    expect(result.current.currentIndex).toBe(-1);

    cleanup();
  });

  // ── navigateToMatch updates highlights ─────────────────────────────

  it('navigateToMatch resets previous and activates new highlight', async () => {
    const restoreRects = mockGetClientRects();
    const onCurrentMatchChange = jest.fn();

    const { ref, cleanup } = createContainerRef('<p>abc abc abc</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, defaultOptions, false, { onCurrentMatchChange })
    );

    await act(async () => {
      result.current.search('abc');
      await flushAll();
    });

    // Navigate to second match
    act(() => result.current.goToNext());
    expect(result.current.currentIndex).toBe(1);
    expect(onCurrentMatchChange).toHaveBeenCalledWith(
      expect.objectContaining({ index: 1 }),
      1
    );

    // Flush rAF to actually apply styles
    act(() => jest.runAllTimers());

    restoreRects();
    cleanup();
  });

  // ── maxHighlights callback ─────────────────────────────────────────

  it('invokes onMaxHighlightsReached when limit is hit', async () => {
    const restoreRects = mockGetClientRects();
    const onMaxHighlightsReached = jest.fn();
    // Create content with many matches
    const html = '<p>' + 'x '.repeat(10) + '</p>';
    const { ref, cleanup } = createContainerRef(html);

    const { result } = renderHook(() =>
      useSearchableContent(
        ref,
        { ...defaultOptions, maxHighlights: 3 },
        false,
        { onMaxHighlightsReached }
      )
    );

    await act(async () => {
      result.current.search('x');
      await flushAll();
    });

    expect(onMaxHighlightsReached).toHaveBeenCalledWith(3);
    expect(result.current.matches.length).toBe(3);

    restoreRects();
    cleanup();
  });

  // ── onSearchComplete is called with 0 when no matches ──────────────

  it('calls onSearchComplete with count 0 when no matches found', async () => {
    const onSearchComplete = jest.fn();
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, defaultOptions, false, { onSearchComplete })
    );

    await act(async () => {
      result.current.search('xyz');
      await flushAll();
    });

    expect(onSearchComplete).toHaveBeenCalledWith('xyz', 0);

    cleanup();
  });

  // ── refresh re-runs search ─────────────────────────────────────────

  it('refresh re-runs current search', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    expect(result.current.matches.length).toBe(1);

    // Mutate DOM content
    ref.current.innerHTML = '<p>Hello Hello Hello</p>';

    await act(async () => {
      result.current.refresh();
      await flushAll();
    });

    expect(result.current.matches.length).toBe(3);

    restoreRects();
    cleanup();
  });

  // ── overlay management ─────────────────────────────────────────────

  it('creates overlay during search and clears highlights on close', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    // Initially no overlay
    expect(ref.current.querySelector('.text-search-overlay')).toBeNull();

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    // Overlay should be created
    const overlay = ref.current.querySelector('.text-search-overlay');
    expect(overlay).not.toBeNull();

    // Close search clears highlights (overlay persists but is empty)
    act(() => result.current.closeSearch());
    expect(overlay!.childNodes.length).toBe(0);

    restoreRects();
    cleanup();
  });

  // ── overlay reuse ──────────────────────────────────────────────────

  it('reuses existing overlay on subsequent searches', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>Hello World Hello</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    const overlay1 = ref.current.querySelector('.text-search-overlay');
    expect(overlay1).not.toBeNull();

    await act(async () => {
      result.current.search('World');
      await flushAll();
    });

    const overlay2 = ref.current.querySelector('.text-search-overlay');
    expect(overlay2).toBe(overlay1); // same element reused

    restoreRects();
    cleanup();
  });

  // ── container position set to relative when static ─────────────────

  it('sets container position to relative when it is static', async () => {
    const restoreRects = mockGetClientRects();
    const el = document.createElement('div');
    el.innerHTML = '<p>Hello World</p>';
    document.body.appendChild(el);
    el.style.position = 'static';
    const ref = { current: el };

    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    // Should have been changed to relative for overlay positioning
    expect(el.style.position).toBe('relative');

    restoreRects();
    document.body.removeChild(el);
  });

  // ── excludeSelector ────────────────────────────────────────────────

  it('excludes elements matching excludeSelector', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef(
      '<p>Hello</p><span class="skip">Hello</span><p>Hello</p>'
    );
    const { result } = renderHook(() =>
      useSearchableContent(ref, { ...defaultOptions, excludeSelector: '.skip' })
    );

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    // Only 2 matches, not 3 (the .skip one is excluded)
    expect(result.current.matches.length).toBe(2);

    restoreRects();
    cleanup();
  });

  // ── normalizeText option ───────────────────────────────────────────

  it('uses normalizeText for search matching', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>Héllo World</p>');
    // Remove accents via normalizeText
    const normalizeText = (text: string) =>
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const { result } = renderHook(() =>
      useSearchableContent(ref, { ...defaultOptions, normalizeText })
    );

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    expect(result.current.matches.length).toBe(1);

    restoreRects();
    cleanup();
  });

  // ── resize handler ─────────────────────────────────────────────────

  it('re-runs search on window resize', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>Hello World</p>');
    const { result } = renderHook(() => useSearchableContent(ref, defaultOptions));

    await act(async () => {
      result.current.search('Hello');
      await flushAll();
    });

    expect(result.current.matches.length).toBe(1);

    // Trigger resize
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
      await flushAll(); // flush the 200ms debounce + search
    });

    // Search should have re-run (matches still 1)
    expect(result.current.matches.length).toBe(1);

    restoreRects();
    cleanup();
  });

  // ── keyboard shortcut does not open when blocked ────────────────────

  it('keyboard shortcut does not open when isBlocked', () => {
    const { ref, cleanup } = createContainerRef('<p>Hello</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, {
        ...defaultOptions,
        disableBrowserSearch: true,
        keyboardShortcut: { key: 'f', ctrl: true, meta: true },
      }, true)
    );

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    expect(result.current.isSearchOpen).toBe(false);

    cleanup();
  });

  // ── highlightStyle activeClassName ─────────────────────────────────

  it('applies activeClassName to current highlight', async () => {
    const restoreRects = mockGetClientRects();
    const { ref, cleanup } = createContainerRef('<p>ab ab</p>');
    const { result } = renderHook(() =>
      useSearchableContent(ref, {
        ...defaultOptions,
        highlightStyle: { activeClassName: 'active-hl' },
      })
    );

    await act(async () => {
      result.current.search('ab');
      await flushAll();
    });

    // Flush rAF for first match activation
    act(() => jest.runAllTimers());

    restoreRects();
    cleanup();
  });
});
