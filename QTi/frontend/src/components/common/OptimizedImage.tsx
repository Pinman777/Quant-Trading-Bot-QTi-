import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill';
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  placeholder,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      onLoad?.();
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
      onError?.();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  if (error) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          color: 'grey.500',
        }}
      >
        Failed to load image
      </Box>
    );
  }

  if (isLoading) {
    return placeholder || (
      <Skeleton
        variant="rectangular"
        width={width}
        height={height}
        animation="wave"
      />
    );
  }

  return (
    <Box
      component="img"
      src={imageSrc || ''}
      alt={alt}
      sx={{
        width,
        height,
        objectFit,
        display: 'block',
      }}
      loading="lazy"
    />
  );
}; 