import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles/index.js';
import { StyledEngineProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../styles/theme';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Создаем кэш для стилей
const clientSideEmotionCache = createCache({
  key: 'css',
  prepend: true
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={clientSideEmotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
} 