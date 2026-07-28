import Script from 'next/script';

export function AnalyticsScripts() {
  const tagManagerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID?.trim();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  if (tagManagerId) {
    return (
      <>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${tagManagerId}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${tagManagerId}`}
            height="0"
            width="0"
            className="invisible hidden"
            title="Google Tag Manager"
          />
        </noscript>
      </>
    );
  }

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${measurementId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
