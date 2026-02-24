import { getTextNodesWithOffsets, findNodeAtOffset, getTextFromNodes } from '../utils/dom';
import type { TextNodeInfo } from '../types';

// ─── Helper: build a DOM tree for testing ────────────────────────────────────

const createContainer = (html: string): HTMLDivElement => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

// ─────────────────────────────────────────────────────────────────────────────
// getTextNodesWithOffsets
// ─────────────────────────────────────────────────────────────────────────────

describe('getTextNodesWithOffsets', () => {
  it('collects text nodes from a simple element', () => {
    const container = createContainer('<p>Hello World</p>');
    const nodes = getTextNodesWithOffsets(container, '');

    expect(nodes).toHaveLength(1);
    expect(nodes[0].node.textContent).toBe('Hello World');
    expect(nodes[0].start).toBe(0);
    expect(nodes[0].end).toBe(11);
  });

  it('collects text nodes from nested elements with accumulated offsets', () => {
    const container = createContainer('<p>Hello</p><p> World</p>');
    const nodes = getTextNodesWithOffsets(container, '');

    expect(nodes).toHaveLength(2);
    expect(nodes[0].start).toBe(0);
    expect(nodes[0].end).toBe(5); // "Hello"
    expect(nodes[1].start).toBe(5);
    expect(nodes[1].end).toBe(11); // " World"
  });

  it('handles deeply nested elements', () => {
    const container = createContainer('<div><span><strong>Deep</strong></span> text</div>');
    const nodes = getTextNodesWithOffsets(container, '');

    expect(nodes).toHaveLength(2);
    expect(nodes[0].node.textContent).toBe('Deep');
    expect(nodes[1].node.textContent).toBe(' text');
    expect(nodes[0].start).toBe(0);
    expect(nodes[0].end).toBe(4);
    expect(nodes[1].start).toBe(4);
    expect(nodes[1].end).toBe(9);
  });

  it('skips elements matching excludeSelector', () => {
    const container = createContainer(
      '<p>Visible</p><div class="no-search">Hidden</div><p>Also visible</p>'
    );
    const nodes = getTextNodesWithOffsets(container, '.no-search');

    expect(nodes).toHaveLength(2);
    expect(nodes[0].node.textContent).toBe('Visible');
    expect(nodes[1].node.textContent).toBe('Also visible');
    // Offsets should be contiguous (hidden text excluded)
    expect(nodes[0].start).toBe(0);
    expect(nodes[0].end).toBe(7);
    expect(nodes[1].start).toBe(7);
    expect(nodes[1].end).toBe(19);
  });

  it('skips elements with text-search-overlay class', () => {
    const container = createContainer(
      '<p>Content</p><div class="text-search-overlay">Overlay text</div>'
    );
    const nodes = getTextNodesWithOffsets(container, '');

    expect(nodes).toHaveLength(1);
    expect(nodes[0].node.textContent).toBe('Content');
  });

  it('handles empty container', () => {
    const container = createContainer('');
    const nodes = getTextNodesWithOffsets(container, '');

    expect(nodes).toHaveLength(0);
  });

  it('handles invalid excludeSelector gracefully', () => {
    const container = createContainer('<p>Hello</p>');
    // Invalid CSS selector should not throw
    const nodes = getTextNodesWithOffsets(container, '[[[invalid');

    expect(nodes).toHaveLength(1);
    expect(nodes[0].node.textContent).toBe('Hello');
  });

  it('handles empty excludeSelector', () => {
    const container = createContainer('<p>Test</p>');
    const nodes = getTextNodesWithOffsets(container, '');

    expect(nodes).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// findNodeAtOffset
// ─────────────────────────────────────────────────────────────────────────────

describe('findNodeAtOffset', () => {
  const createTextNodes = (): TextNodeInfo[] => {
    const t1 = document.createTextNode('Hello');
    const t2 = document.createTextNode(' ');
    const t3 = document.createTextNode('World');
    return [
      { node: t1, start: 0, end: 5 },
      { node: t2, start: 5, end: 6 },
      { node: t3, start: 6, end: 11 },
    ];
  };

  it('finds the correct node for an offset in the first node', () => {
    const nodes = createTextNodes();
    const result = findNodeAtOffset(nodes, 2);

    expect(result).not.toBeNull();
    expect(result!.node.textContent).toBe('Hello');
    expect(result!.localOffset).toBe(2);
  });

  it('finds the correct node for an offset in the last node', () => {
    const nodes = createTextNodes();
    const result = findNodeAtOffset(nodes, 8);

    expect(result).not.toBeNull();
    expect(result!.node.textContent).toBe('World');
    expect(result!.localOffset).toBe(2);
  });

  it('finds the correct node at the start boundary', () => {
    const nodes = createTextNodes();
    const result = findNodeAtOffset(nodes, 0);

    expect(result).not.toBeNull();
    expect(result!.node.textContent).toBe('Hello');
    expect(result!.localOffset).toBe(0);
  });

  it('handles isEnd=true (allows offset === node.end)', () => {
    const nodes = createTextNodes();
    // offset 11 (end of last node) with isEnd=true should match the last node
    const result = findNodeAtOffset(nodes, 11, true);

    expect(result).not.toBeNull();
    expect(result!.node.textContent).toBe('World');
    expect(result!.localOffset).toBe(5);
  });

  it('without isEnd, offset at boundary goes to next node', () => {
    const nodes = createTextNodes();
    // offset 5 without isEnd should go to second node
    const result = findNodeAtOffset(nodes, 5, false);

    expect(result).not.toBeNull();
    expect(result!.node.textContent).toBe(' ');
    expect(result!.localOffset).toBe(0);
  });

  it('returns null for offset beyond all nodes', () => {
    const nodes = createTextNodes();
    const result = findNodeAtOffset(nodes, 100);

    expect(result).toBeNull();
  });

  it('returns null for negative offset', () => {
    const nodes = createTextNodes();
    const result = findNodeAtOffset(nodes, -1);

    expect(result).toBeNull();
  });

  it('returns null for empty node array', () => {
    const result = findNodeAtOffset([], 0);
    expect(result).toBeNull();
  });

  it('handles single-node array correctly', () => {
    const t1 = document.createTextNode('Only');
    const nodes: TextNodeInfo[] = [{ node: t1, start: 0, end: 4 }];

    expect(findNodeAtOffset(nodes, 0)?.localOffset).toBe(0);
    expect(findNodeAtOffset(nodes, 3)?.localOffset).toBe(3);
    expect(findNodeAtOffset(nodes, 4, true)?.localOffset).toBe(4);
    expect(findNodeAtOffset(nodes, 4, false)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getTextFromNodes
// ─────────────────────────────────────────────────────────────────────────────

describe('getTextFromNodes', () => {
  it('concatenates text from multiple nodes', () => {
    const t1 = document.createTextNode('Hello');
    const t2 = document.createTextNode(' ');
    const t3 = document.createTextNode('World');
    const nodes: TextNodeInfo[] = [
      { node: t1, start: 0, end: 5 },
      { node: t2, start: 5, end: 6 },
      { node: t3, start: 6, end: 11 },
    ];

    expect(getTextFromNodes(nodes)).toBe('Hello World');
  });

  it('returns empty string for empty array', () => {
    expect(getTextFromNodes([])).toBe('');
  });

  it('handles single node', () => {
    const t1 = document.createTextNode('Single');
    const nodes: TextNodeInfo[] = [{ node: t1, start: 0, end: 6 }];

    expect(getTextFromNodes(nodes)).toBe('Single');
  });
});
