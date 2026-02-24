import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchableContent } from '../SearchableContent';

/* -------------------------------------------------------------------------- */
/*  Mock the heavy hook — we test it separately in useSearchableContent.test   */
/* -------------------------------------------------------------------------- */

const mockHookReturn = {
  searchTerm: '',
  isSearchOpen: false,
  isSearching: false,
  matches: [],
  currentIndex: -1,
  searchInputRef: { current: null },
  search: jest.fn(),
  goToNext: jest.fn(),
  goToPrevious: jest.fn(),
  closeSearch: jest.fn(),
  openSearch: jest.fn(),
  setSearchTerm: jest.fn(),
  refreshHighlights: jest.fn(),
};

jest.mock('../useSearchableContent', () => ({
  useSearchableContent: jest.fn(() => mockHookReturn),
}));

/* We also mock SearchBox to isolate SearchableContent logic */
jest.mock('../SearchBox', () => ({
  SearchBox: (props: Record<string, unknown>) => (
    <div
      data-testid="search-box"
      data-is-open={String(props.isSearchOpen)}
      data-search-term={String(props.searchTerm)}
    />
  ),
}));

/* -------------------------------------------------------------------------- */

describe('SearchableContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children inside a container div', () => {
    render(
      <SearchableContent>
        <p>Hello world</p>
      </SearchableContent>
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('applies containerClassName to the wrapper', () => {
    const { container } = render(
      <SearchableContent containerClassName="my-container">
        <p>Content</p>
      </SearchableContent>
    );

    expect(container.querySelector('.my-container')).toBeInTheDocument();
  });

  it('applies containerStyle to the wrapper', () => {
    const { container } = render(
      <SearchableContent containerStyle={{ backgroundColor: 'red' }}>
        <p>Content</p>
      </SearchableContent>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('red');
  });

  it('renders the SearchBox mock', () => {
    render(
      <SearchableContent>
        <p>Content</p>
      </SearchableContent>
    );

    expect(screen.getByTestId('search-box')).toBeInTheDocument();
  });

  it('passes hook values to SearchBox', () => {
    mockHookReturn.searchTerm = 'test';
    mockHookReturn.isSearchOpen = true;

    render(
      <SearchableContent>
        <p>Content</p>
      </SearchableContent>
    );

    const box = screen.getByTestId('search-box');
    expect(box.getAttribute('data-search-term')).toBe('test');
    expect(box.getAttribute('data-is-open')).toBe('true');

    // reset
    mockHookReturn.searchTerm = '';
    mockHookReturn.isSearchOpen = false;
  });

  it('calls onSearchOpenChange when isSearchOpen changes', () => {
    const onSearchOpenChange = jest.fn();
    mockHookReturn.isSearchOpen = true;

    render(
      <SearchableContent onSearchOpenChange={onSearchOpenChange}>
        <p>Content</p>
      </SearchableContent>
    );

    expect(onSearchOpenChange).toHaveBeenCalledWith(true);

    mockHookReturn.isSearchOpen = false;
  });

  it('passes isSearchBlocked to the hook', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useSearchableContent } = require('../useSearchableContent');

    render(
      <SearchableContent isSearchBlocked={true}>
        <p>Content</p>
      </SearchableContent>
    );

    expect(useSearchableContent).toHaveBeenCalledWith(
      expect.anything(), // containerRef
      undefined, // searchOptions
      true, // isSearchBlocked
      undefined // searchCallbacks
    );
  });

  it('passes searchOptions and searchCallbacks to the hook', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useSearchableContent } = require('../useSearchableContent');

    const opts = { highlightColor: 'red' };
    const cbs = { onSearchStart: jest.fn() };

    render(
      <SearchableContent searchOptions={opts} searchCallbacks={cbs}>
        <p>Content</p>
      </SearchableContent>
    );

    expect(useSearchableContent).toHaveBeenCalledWith(
      expect.anything(),
      opts,
      false,
      cbs
    );
  });
});
