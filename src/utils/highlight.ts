import type { ResolvedSearchOptions, TextRange, Match, PerformanceOptions } from '../types';

/** Create a single positioned highlight `<div>`. */
export const createHighlight = (
  rect: DOMRect,
  index: number,
  config: ResolvedSearchOptions,
  containerRect: DOMRect,
  scrollLeft: number,
  scrollTop: number
): HTMLDivElement => {
  const highlight = document.createElement('div');
  highlight.className = `text-search-highlight${
    config.highlightStyle.className ? ` ${config.highlightStyle.className}` : ''
  }`;
  highlight.dataset.index = String(index);

  const x = rect.left - containerRect.left + scrollLeft;
  const y = rect.top - containerRect.top + scrollTop;
  const style = config.highlightStyle;

  let css = `
    position: absolute;
    transform: translate(${x}px, ${y}px);
    width: ${rect.width}px;
    height: ${rect.height}px;
    background-color: ${config.highlightColor};
    border-radius: ${style.borderRadius};
    pointer-events: none;
    will-change: background-color;
    contain: layout style paint;
  `;
  if (style.border) css += `border: ${style.border};`;
  if (style.boxShadow) css += `box-shadow: ${style.boxShadow};`;
  if (style.opacity !== undefined && style.opacity < 1) css += `opacity: ${style.opacity};`;

  highlight.style.cssText = css;
  return highlight;
};

/** Group highlight `<div>`s by their match index. */
export const buildHighlightsByIndex = (
  highlights: HTMLDivElement[]
): Record<number, HTMLDivElement[]> => {
  const highlightsByIndex: Record<number, HTMLDivElement[]> = {};
  for (const highlight of highlights) {
    const index = Number.parseInt(highlight.dataset.index || '-1');
    if (!highlightsByIndex[index]) highlightsByIndex[index] = [];
    highlightsByIndex[index].push(highlight);
  }
  return highlightsByIndex;
};

/** Build `Match[]` from grouped highlight elements + original text ranges. */
export const buildMatchObjects = (
  highlightsByIndex: Record<number, HTMLDivElement[]>,
  ranges: TextRange[]
): Match[] => {
  return Object.keys(highlightsByIndex).map((index) => ({
    index: Number.parseInt(index),
    highlights: highlightsByIndex[Number(index)],
    text: ranges[Number(index)].text,
  }));
};

/**
 * Yield control to the main thread between chunks.
 * Uses `requestIdleCallback` when enabled + available, otherwise `requestAnimationFrame`.
 */
export const yieldToMainThread = (perf: Required<PerformanceOptions>): Promise<void> => {
  return new Promise((resolve) => {
    if (perf.useIdleCallback && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => resolve(), {
        timeout: perf.idleCallbackTimeout,
      });
    } else {
      requestAnimationFrame(() => resolve());
    }
  });
};
