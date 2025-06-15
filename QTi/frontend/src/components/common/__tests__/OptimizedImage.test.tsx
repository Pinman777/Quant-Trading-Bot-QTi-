import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OptimizedImage } from '../OptimizedImage';

describe('OptimizedImage', () => {
  const mockSrc = 'test-image.jpg';
  const mockAlt = 'Test image';

  beforeEach(() => {
    // Mock Image constructor
    global.Image = class {
      src: string;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        this.src = '';
      }
    } as any;
  });

  it('should show loading state initially', () => {
    render(
      <OptimizedImage
        src={mockSrc}
        alt={mockAlt}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show image when loaded successfully', async () => {
    const { container } = render(
      <OptimizedImage
        src={mockSrc}
        alt={mockAlt}
      />
    );

    // Simulate image load
    const img = new Image();
    img.onload?.();

    await waitFor(() => {
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockSrc);
      expect(image).toHaveAttribute('alt', mockAlt);
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  it('should show error state when image fails to load', async () => {
    render(
      <OptimizedImage
        src={mockSrc}
        alt={mockAlt}
      />
    );

    // Simulate image load error
    const img = new Image();
    img.onerror?.();

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });

  it('should use custom placeholder when provided', () => {
    const customPlaceholder = <div data-testid="custom-placeholder">Loading...</div>;
    
    render(
      <OptimizedImage
        src={mockSrc}
        alt={mockAlt}
        placeholder={customPlaceholder}
      />
    );

    expect(screen.getByTestId('custom-placeholder')).toBeInTheDocument();
  });

  it('should call onLoad callback when image loads', async () => {
    const onLoad = jest.fn();
    
    render(
      <OptimizedImage
        src={mockSrc}
        alt={mockAlt}
        onLoad={onLoad}
      />
    );

    // Simulate image load
    const img = new Image();
    img.onload?.();

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('should call onError callback when image fails to load', async () => {
    const onError = jest.fn();
    
    render(
      <OptimizedImage
        src={mockSrc}
        alt={mockAlt}
        onError={onError}
      />
    );

    // Simulate image load error
    const img = new Image();
    img.onerror?.();

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should apply custom styles', () => {
    const { container } = render(
      <OptimizedImage
        src={mockSrc}
        alt={mockAlt}
        width={200}
        height={150}
        objectFit="contain"
      />
    );

    const image = container.querySelector('img');
    expect(image).toHaveStyle({
      width: '200px',
      height: '150px',
      objectFit: 'contain',
    });
  });
}); 