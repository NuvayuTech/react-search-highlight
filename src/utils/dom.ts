import type { TextNodeInfo } from '../types';

/**
 * Collect all text nodes under `root` with pre-computed character offsets.
 *
 * Uses **TreeWalker** with `FILTER_REJECT` so excluded-subtrees and the
 * highlight overlay are skipped entirely (O(1) per skipped subtree instead
 * of O(n) per child node).
 */
export const getTextNodesWithOffsets = (
  root: HTMLElement,
  excludeSelector: string
): TextNodeInfo[] => {
  const nodes: TextNodeInfo[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
    acceptNode: (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip the highlight overlay subtree
        if ((node as Element).classList?.contains('text-search-overlay')) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip excluded elements and their entire subtree
        if (excludeSelector) {
          try {
            if ((node as Element).matches(excludeSelector)) {
              return NodeFilter.FILTER_REJECT;
            }
          } catch {
            /* invalid selector — don't skip */
          }
        }
        // Process children of this element but don't include the element itself
        return NodeFilter.FILTER_SKIP;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    },
  });

  let offset = 0;
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const textNode = current as Text;
    const len = textNode.length;
    nodes.push({ node: textNode, start: offset, end: offset + len });
    offset += len;
  }

  return nodes;
};

/**
 * Binary-search the pre-computed text-node array for the node at `offset`.
 *
 * @param isEnd — when `true`, allows `offset === node.end` (valid for
 *                `Range.setEnd` which accepts the boundary *after* the
 *                last character).
 *
 * Complexity: O(log m) where m = number of text nodes.
 * (Previous approach: linear scan via NodeIterator → O(m) **per range**.)
 */
export const findNodeAtOffset = (
  nodes: TextNodeInfo[],
  offset: number,
  isEnd = false
): { node: Text; localOffset: number } | null => {
  let lo = 0;
  let hi = nodes.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const { start, end } = nodes[mid];

    if (offset < start) {
      hi = mid - 1;
    } else if (isEnd ? offset > end : offset >= end) {
      lo = mid + 1;
    } else {
      return { node: nodes[mid].node, localOffset: offset - start };
    }
  }
  return null;
};

/** Extract plain text from pre-computed text nodes (consistent with node offsets). */
export const getTextFromNodes = (nodes: TextNodeInfo[]): string => {
  let text = '';
  for (const n of nodes) {
    text += n.node.textContent ?? '';
  }
  return text;
};
