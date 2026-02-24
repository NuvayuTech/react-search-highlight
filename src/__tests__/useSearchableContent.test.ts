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

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
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
});
