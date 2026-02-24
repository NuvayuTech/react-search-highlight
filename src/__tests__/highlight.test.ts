import {
  createHighlight,
  buildHighlightsByIndex,
  buildMatchObjects,
  yieldToMainThread,
} from '../utils/highlight';
import type { ResolvedSearchOptions, TextRange } from '../types';

// ─── Shared test config ──────────────────────────────────────────────────────

const makeConfig = (overrides: Partial<ResolvedSearchOptions> = {}): ResolvedSearchOptions => ({
  disableBrowserSearch: true,
  highlightColor: 'rgba(255, 255, 0, 0.3)',
  currentHighlightColor: 'rgba(255, 165, 0, 0.6)',
  caseSensitive: false,
  wholeWord: false,
  debounceMs: 100,
  minSearchLength: 1,
  maxHighlights: 500,
  keyboardShortcut: { key: 'f', ctrl: true, meta: true },
  scrollOptions: { behavior: 'smooth' as ScrollBehavior, block: 'center' as ScrollLogicalPosition, inline: 'nearest' as ScrollLogicalPosition },
  highlightStyle: {
    borderRadius: '2px',
    border: '',
    boxShadow: '',
    opacity: 1,
    zIndex: 999,
    className: '',
    activeClassName: '',
  },
  performance: { chunkSize: 50, useIdleCallback: true, idleCallbackTimeout: 100 },
  excludeSelector: '',
  normalizeText: (t: string) => t,
  ...overrides,
});

const makeDOMRect = (x = 10, y = 20, w = 100, h = 18): DOMRect =>
  ({ left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, x, y, toJSON: () => ({}) } as DOMRect);

// ─────────────────────────────────────────────────────────────────────────────
// createHighlight
// ─────────────────────────────────────────────────────────────────────────────

describe('createHighlight', () => {
  const containerRect = makeDOMRect(0, 0, 800, 600);

  it('creates a div with correct class and data-index', () => {
    const config = makeConfig();
    const rect = makeDOMRect(50, 100, 80, 16);
    const el = createHighlight(rect, 3, config, containerRect, 0, 0);

    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('text-search-highlight');
    expect(el.dataset.index).toBe('3');
  });

  it('positions highlight relative to container with scroll offsets', () => {
    const config = makeConfig();
    const rect = makeDOMRect(50, 100, 80, 16);
    const el = createHighlight(rect, 0, config, containerRect, 10, 20);

    // x = 50 - 0 + 10 = 60, y = 100 - 0 + 20 = 120
    expect(el.style.cssText).toContain('translate(60px, 120px)');
    expect(el.style.cssText).toContain('width: 80px');
    expect(el.style.cssText).toContain('height: 16px');
  });

  it('applies highlight color from config', () => {
    const config = makeConfig({ highlightColor: 'rgba(0, 255, 0, 0.5)' });
    const el = createHighlight(makeDOMRect(), 0, config, containerRect, 0, 0);

    expect(el.style.cssText).toContain('background-color: rgba(0, 255, 0, 0.5)');
  });

  it('appends custom className from highlightStyle', () => {
    const config = makeConfig({
      highlightStyle: {
        borderRadius: '2px',
        border: '',
        boxShadow: '',
        opacity: 1,
        zIndex: 999,
        className: 'custom-hl',
        activeClassName: '',
      },
    });
    const el = createHighlight(makeDOMRect(), 0, config, containerRect, 0, 0);

    expect(el.className).toBe('text-search-highlight custom-hl');
  });

  it('applies optional border and boxShadow', () => {
    const config = makeConfig({
      highlightStyle: {
        borderRadius: '4px',
        border: '1px solid red',
        boxShadow: '0 0 4px blue',
        opacity: 1,
        zIndex: 999,
        className: '',
        activeClassName: '',
      },
    });
    const el = createHighlight(makeDOMRect(), 0, config, containerRect, 0, 0);

    expect(el.style.cssText).toContain('border: 1px solid red');
    expect(el.style.cssText).toContain('box-shadow: 0 0 4px blue');
  });

  it('applies opacity when less than 1', () => {
    const config = makeConfig({
      highlightStyle: {
        borderRadius: '2px',
        border: '',
        boxShadow: '',
        opacity: 0.7,
        zIndex: 999,
        className: '',
        activeClassName: '',
      },
    });
    const el = createHighlight(makeDOMRect(), 0, config, containerRect, 0, 0);

    expect(el.style.cssText).toContain('opacity: 0.7');
  });

  it('does not apply opacity when equal to 1', () => {
    const config = makeConfig();
    const el = createHighlight(makeDOMRect(), 0, config, containerRect, 0, 0);

    // The opacity property should not appear in cssText
    expect(el.style.cssText).not.toContain('opacity');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// buildHighlightsByIndex
// ─────────────────────────────────────────────────────────────────────────────

describe('buildHighlightsByIndex', () => {
  const makeEl = (index: number): HTMLDivElement => {
    const el = document.createElement('div');
    el.dataset.index = String(index);
    return el;
  };

  it('groups highlights by their data-index', () => {
    const highlights = [makeEl(0), makeEl(0), makeEl(1), makeEl(2), makeEl(2), makeEl(2)];
    const result = buildHighlightsByIndex(highlights);

    expect(Object.keys(result)).toHaveLength(3);
    expect(result[0]).toHaveLength(2);
    expect(result[1]).toHaveLength(1);
    expect(result[2]).toHaveLength(3);
  });

  it('returns empty object for empty array', () => {
    const result = buildHighlightsByIndex([]);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('handles missing data-index (defaults to -1)', () => {
    const el = document.createElement('div');
    // No dataset.index set
    const result = buildHighlightsByIndex([el]);

    expect(result[-1]).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// buildMatchObjects
// ─────────────────────────────────────────────────────────────────────────────

describe('buildMatchObjects', () => {
  it('builds Match[] from grouped highlights and ranges', () => {
    const el0a = document.createElement('div');
    el0a.dataset.index = '0';
    const el0b = document.createElement('div');
    el0b.dataset.index = '0';
    const el1 = document.createElement('div');
    el1.dataset.index = '1';

    const highlightsByIndex: Record<number, HTMLDivElement[]> = {
      0: [el0a, el0b],
      1: [el1],
    };

    const ranges: TextRange[] = [
      { start: 0, end: 5, text: 'Hello' },
      { start: 6, end: 11, text: 'World' },
    ];

    const matches = buildMatchObjects(highlightsByIndex, ranges);

    expect(matches).toHaveLength(2);
    expect(matches[0].index).toBe(0);
    expect(matches[0].text).toBe('Hello');
    expect(matches[0].highlights).toHaveLength(2);
    expect(matches[1].index).toBe(1);
    expect(matches[1].text).toBe('World');
    expect(matches[1].highlights).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// yieldToMainThread
// ─────────────────────────────────────────────────────────────────────────────

describe('yieldToMainThread', () => {
  it('resolves via requestAnimationFrame when idle callback is disabled', async () => {
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    const perf = { chunkSize: 50, useIdleCallback: false, idleCallbackTimeout: 100 };
    await yieldToMainThread(perf);

    expect(rafSpy).toHaveBeenCalled();
    rafSpy.mockRestore();
  });

  it('resolves via requestAnimationFrame when requestIdleCallback is not available', async () => {
    const originalRIC = (window as unknown as Record<string, unknown>).requestIdleCallback;
    delete (window as unknown as Record<string, unknown>).requestIdleCallback;

    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    const perf = { chunkSize: 50, useIdleCallback: true, idleCallbackTimeout: 100 };
    await yieldToMainThread(perf);

    expect(rafSpy).toHaveBeenCalled();
    rafSpy.mockRestore();
    (window as unknown as Record<string, unknown>).requestIdleCallback = originalRIC;
  });
});
