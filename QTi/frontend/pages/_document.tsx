import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://yastatic.net" />
        <link rel="preconnect" href="https://code.jquery.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 