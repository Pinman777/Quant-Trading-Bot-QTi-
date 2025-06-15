import React, { useRef, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  loading = false,
  onEndReached,
  endReachedThreshold = 0.8,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isEndReached, setIsEndReached] = useState(false);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  useEffect(() => {
    if (!onEndReached || !parentRef.current) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current!;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= endReachedThreshold && !isEndReached) {
        setIsEndReached(true);
        onEndReached();
      } else if (scrollPercentage < endReachedThreshold) {
        setIsEndReached(false);
      }
    };

    parentRef.current.addEventListener('scroll', handleScroll);
    return () => {
      parentRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [onEndReached, endReachedThreshold, isEndReached]);

  return (
    <Box
      ref={parentRef}
      sx={{
        height,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <Box
            key={virtualRow.index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${itemHeight}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </Box>
        ))}
      </Box>

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            padding: 1,
            background: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
} 