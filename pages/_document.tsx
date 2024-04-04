import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body style={{ backgroundColor: "#fff5cc" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
