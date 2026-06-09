import "../styles.css";
import Script from "next/script";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* ✅ PWA / ホーム画面用設定 */}
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        {/* iOS向け設定 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="CalmFire" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </Head>

      {/* ✅ Google AdSense */}
      <Script
        async
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6308667358686884"
        crossOrigin="anonymous"
      />

      <Component {...pageProps} />
    </>
  );
}