import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="PDF to JPG High Resolution Converter with premium design" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-dark text-white min-h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 