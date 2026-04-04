import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#0D0D0D" />
        <meta name="description" content="Create beautiful forms in minutes, generate a QR code, and start collecting responses. No clutter, no complexity." />
        <meta property="og:title" content="Formr — Simple forms, real responses" />
        <meta property="og:description" content="Create beautiful forms in minutes, generate a QR code, and start collecting responses." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Formr" />
        <meta name="twitter:description" content="Create beautiful forms in minutes, generate a QR code, and start collecting responses." />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}