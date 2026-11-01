// Runs in <head> before body parsing. The HTML already contains the black layer.
// Only this deliberate root attribute differs between SSR and hydration.
export const introBootstrap = `(function(){
  var root=document.documentElement;
  var skip=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { skip=skip||sessionStorage.getItem('clj-intro')==='seen'; } catch(e) {}
  root.dataset.cljIntro=skip?'skip':'pending';
  root.dataset.cljIntroInstant=skip?'true':'false';
  if(!skip){
    window.__cljIntroStart=performance.now();
    try { sessionStorage.setItem('clj-intro','seen'); } catch(e) {}
    window.setTimeout(function(){
      if((root.dataset.cljIntro==='pending'||root.dataset.cljIntro==='exiting')){
        root.dataset.cljIntro='skip';
        root.dataset.cljFallback='true';
        var shell=document.getElementById('site-content');
        if(shell) shell.inert=false;
        window.dispatchEvent(new Event('clj:intro-timeout'));
      }
    },3000);
  }
})();`;
export const introCriticalStyles = `
.intro{position:fixed;inset:0;z-index:10000;background:#000;}
html[data-clj-intro="skip"] .intro{display:none!important;}
html[data-clj-intro-instant="true"] .hero-line{transform:none!important;}
html[data-clj-intro="pending"],html[data-clj-intro="pending"] body,html[data-clj-intro="exiting"],html[data-clj-intro="exiting"] body{overflow:hidden!important;overscroll-behavior:none;}
html[data-clj-fallback="true"] .reveal{opacity:1!important;transform:none!important;}
html[data-clj-fallback="true"] .hero-line,html[data-clj-fallback="true"] .hero-image-frame{transform:none!important;}
@media(prefers-reduced-motion:reduce){.intro{display:none!important;}}
`;
