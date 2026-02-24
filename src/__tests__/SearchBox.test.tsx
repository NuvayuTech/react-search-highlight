import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBox } from '../SearchBox';
import type { SearchBoxProps, Match } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const defaultProps: SearchBoxProps = {
  searchTerm: '',
  isSearchOpen: true,
  matches: [],
  currentIndex: -1,
  isSearching: false,
  searchInputRef: createRef<HTMLInputElement>(),
  onSearch: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  onClose: jest.fn(),
};

const renderSearchBox = (overrides: Partial<SearchBoxProps> = {}) =>
  render(<SearchBox {...defaultProps} {...overrides} />);

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('SearchBox', () => {
  // ── Visibility ─────────────────────────────────────────────────────

  it('renders nothing when isSearchOpen is false', () => {
    const { container } = renderSearchBox({ isSearchOpen: false });
    expect(container.innerHTML).toBe('');
  });

  it('renders when isSearchOpen is true', () => {
    renderSearchBox({ isSearchOpen: true });
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  // ── Input ──────────────────────────────────────────────────────────

  it('displays the current search term in the input', () => {
    renderSearchBox({ searchTerm: 'hello' });
    const input = screen.getByRole('searchbox') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });

  it('calls onSearch when input value changes', () => {
    const onSearch = jest.fn();
    renderSearchBox({ onSearch });

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('uses custom placeholder', () => {
    renderSearchBox({ placeholder: 'Find here...' });
    expect(screen.getByPlaceholderText('Find here...')).toBeInTheDocument();
  });

  // ── Counter ────────────────────────────────────────────────────────

  it('shows 0/0 when no matches', () => {
    renderSearchBox({ matches: [], currentIndex: -1 });
    expect(screen.getByRole('status')).toHaveTextContent('0/0');
  });

  it('shows correct counter with matches', () => {
    const matches = [
      { index: 0, highlights: [], text: 'a' },
      { index: 1, highlights: [], text: 'b' },
      { index: 2, highlights: [], text: 'c' },
    ] as Match[];
    renderSearchBox({ matches, currentIndex: 1 });
    expect(screen.getByRole('status')).toHaveTextContent('2/3');
  });

  // ── Navigation buttons ─────────────────────────────────────────────

  it('disables prev/next when no matches', () => {
    renderSearchBox({ matches: [] });
    const prevBtn = screen.getByLabelText('Previous match');
    const nextBtn = screen.getByLabelText('Next match');
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });

  it('enables prev/next when matches exist', () => {
    const matches = [{ index: 0, highlights: [], text: 'a' }] as Match[];
    renderSearchBox({ matches, currentIndex: 0 });
    const prevBtn = screen.getByLabelText('Previous match');
    const nextBtn = screen.getByLabelText('Next match');
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });

  it('disables prev/next when isSearching is true', () => {
    const matches = [{ index: 0, highlights: [], text: 'a' }] as Match[];
    renderSearchBox({ matches, currentIndex: 0, isSearching: true });
    const prevBtn = screen.getByLabelText('Previous match');
    const nextBtn = screen.getByLabelText('Next match');
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });

  it('calls onPrevious when prev button is clicked', () => {
    const onPrevious = jest.fn();
    const matches = [{ index: 0, highlights: [], text: 'a' }] as Match[];
    renderSearchBox({ matches, currentIndex: 0, onPrevious });

    fireEvent.click(screen.getByLabelText('Previous match'));
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button is clicked', () => {
    const onNext = jest.fn();
    const matches = [{ index: 0, highlights: [], text: 'a' }] as Match[];
    renderSearchBox({ matches, currentIndex: 0, onNext });

    fireEvent.click(screen.getByLabelText('Next match'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  // ── Close button ───────────────────────────────────────────────────

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    renderSearchBox({ onClose });

    fireEvent.click(screen.getByLabelText('Close search'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Keyboard ───────────────────────────────────────────────────────

  it('calls onNext on Enter key with matches', () => {
    const onNext = jest.fn();
    const matches = [{ index: 0, highlights: [], text: 'a' }] as Match[];
    renderSearchBox({ matches, currentIndex: 0, onNext });

    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious on Shift+Enter with matches', () => {
    const onPrevious = jest.fn();
    const matches = [{ index: 0, highlights: [], text: 'a' }] as Match[];
    renderSearchBox({ matches, currentIndex: 0, onPrevious });

    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('does not call onNext on Enter without matches', () => {
    const onNext = jest.fn();
    renderSearchBox({ matches: [], onNext });

    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key', () => {
    const onClose = jest.fn();
    renderSearchBox({ onClose });

    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── ARIA ───────────────────────────────────────────────────────────

  it('has correct ARIA attributes', () => {
    const matches = [
      { index: 0, highlights: [], text: 'a' },
      { index: 1, highlights: [], text: 'b' },
    ] as Match[];
    renderSearchBox({ matches, currentIndex: 0 });

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Search text');

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', '1 of 2 matches');
  });

  it('uses custom ARIA labels', () => {
    renderSearchBox({
      ariaLabels: {
        searchInput: 'Buscar texto',
        closeButton: 'Cerrar búsqueda',
      },
    });

    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Buscar texto');
    expect(screen.getByLabelText('Cerrar búsqueda')).toBeInTheDocument();
  });

  // ── Custom class names ─────────────────────────────────────────────

  it('applies custom class names', () => {
    const { container } = renderSearchBox({
      classNames: { container: 'my-search', input: 'my-input' },
    });

    expect(container.querySelector('.my-search')).toBeInTheDocument();
    expect(container.querySelector('.my-input')).toBeInTheDocument();
  });

  // ── Position styles ────────────────────────────────────────────────

  it('applies position styles for top-right', () => {
    renderSearchBox({ position: 'top-right' });
    const searchBox = screen.getByRole('search');
    expect(searchBox.style.position).toBe('absolute');
  });

  it('uses containerStyle for custom position', () => {
    renderSearchBox({
      position: 'custom',
      containerStyle: { position: 'fixed', bottom: 20 },
    });
    const searchBox = screen.getByRole('search');
    expect(searchBox.style.position).toBe('fixed');
  });

  // ── renderSearchBox prop ───────────────────────────────────────────

  it('uses renderSearchBox when provided', () => {
    renderSearchBox({
      renderSearchBox: (props) => (
        <div data-testid="custom-search">
          Custom: {props.statusText}
        </div>
      ),
    });

    expect(screen.getByTestId('custom-search')).toBeInTheDocument();
    expect(screen.getByTestId('custom-search')).toHaveTextContent('Custom: 0/0');
  });

  it('passes correct props to renderSearchBox', () => {
    const matches = [{ index: 0, highlights: [], text: 'a' }] as Match[];
    const renderFn = jest.fn().mockReturnValue(<div>Custom</div>);

    renderSearchBox({
      searchTerm: 'test',
      matches,
      currentIndex: 0,
      isSearching: false,
      renderSearchBox: renderFn,
    });

    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerm: 'test',
        totalMatches: 1,
        currentIndex: 0,
        isSearching: false,
        statusText: '1/1',
        isPreviousDisabled: false,
        isNextDisabled: false,
      })
    );
  });
});
