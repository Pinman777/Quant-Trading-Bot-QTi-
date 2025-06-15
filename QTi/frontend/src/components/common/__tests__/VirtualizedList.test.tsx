import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualizedList } from '../VirtualizedList';

describe('VirtualizedList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `Item ${i}`,
  }));

  const mockRenderItem = (item: typeof mockItems[0]) => (
    <div data-testid={`item-${item.id}`}>{item.text}</div>
  );

  it('should render visible items', () => {
    render(
      <VirtualizedList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={mockRenderItem}
      />
    );

    // Should render only visible items (400px height / 50px item height = 8 items)
    // Plus overscan (5 items)
    const visibleItems = screen.getAllByTestId(/^item-\d+$/);
    expect(visibleItems.length).toBeLessThanOrEqual(13);
  });

  it('should show loading indicator', () => {
    render(
      <VirtualizedList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={mockRenderItem}
        loading={true}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should call onEndReached when scrolling near bottom', () => {
    const onEndReached = jest.fn();
    render(
      <VirtualizedList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={mockRenderItem}
        onEndReached={onEndReached}
        endReachedThreshold={0.8}
      />
    );

    const container = screen.getByRole('list');
    fireEvent.scroll(container, {
      target: {
        scrollTop: 8000, // Scroll near bottom
        scrollHeight: 10000,
        clientHeight: 400,
      },
    });

    expect(onEndReached).toHaveBeenCalled();
  });

  it('should not call onEndReached when scrolling not near bottom', () => {
    const onEndReached = jest.fn();
    render(
      <VirtualizedList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={mockRenderItem}
        onEndReached={onEndReached}
        endReachedThreshold={0.8}
      />
    );

    const container = screen.getByRole('list');
    fireEvent.scroll(container, {
      target: {
        scrollTop: 1000, // Scroll not near bottom
        scrollHeight: 10000,
        clientHeight: 400,
      },
    });

    expect(onEndReached).not.toHaveBeenCalled();
  });

  it('should render empty state when no items', () => {
    render(
      <VirtualizedList
        items={[]}
        height={400}
        itemHeight={50}
        renderItem={mockRenderItem}
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should maintain scroll position after items update', () => {
    const { rerender } = render(
      <VirtualizedList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={mockRenderItem}
      />
    );

    const container = screen.getByRole('list');
    fireEvent.scroll(container, {
      target: {
        scrollTop: 1000,
        scrollHeight: 10000,
        clientHeight: 400,
      },
    });

    const scrollPosition = container.scrollTop;

    // Update items
    rerender(
      <VirtualizedList
        items={[...mockItems, { id: 100, text: 'New Item' }]}
        height={400}
        itemHeight={50}
        renderItem={mockRenderItem}
      />
    );

    expect(container.scrollTop).toBe(scrollPosition);
  });
}); 