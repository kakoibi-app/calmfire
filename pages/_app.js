import "../styles.css";
import Script from "next/script";

export default function App({ Component, pageProps }) {
  return (
    <>
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