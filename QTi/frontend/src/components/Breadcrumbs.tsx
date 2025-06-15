import React from 'react';
import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  useTheme
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const theme = useTheme();
  const router = useRouter();

  const handleClick = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => handleClick('/')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast) {
            return (
              <Typography
                key={item.label}
                color="text.primary"
                variant="body1"
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={item.label}
              component="button"
              variant="body1"
              onClick={() => handleClick(item.href)}
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs; 