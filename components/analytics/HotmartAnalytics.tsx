import Script from 'next/script';

const HOTMART_LAUNCHER = `(function(l,a,u,n,c,h,e,r){l['HotmartLauncherObject']=c;l[c]=l[c]||function(){
(l[c].q=l[c].q||[]).push(arguments)},l[c].l=1*new Date();h=a.createElement(u),
e=a.getElementsByTagName(u)[0];h.async=1;h.src=n;e.parentNode.insertBefore(h,e)
})(window,document,'script','//launcher.hotmart.com/launcher.js','hot');

hot('account','ca466c8d-ad85-30c6-ad61-62464a24e7e1');`;

export function HotmartAnalytics() {
  return (
    <Script id="hotmart_launcher_script" strategy="afterInteractive">
      {HOTMART_LAUNCHER}
    </Script>
  );
}
