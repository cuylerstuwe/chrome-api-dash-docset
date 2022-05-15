// Build the ChromeAPI docset for Dash.

var fs = require('fs');
var request = require('request');
var $ = require('cheerio').default;
var exec = require('child_process').exec;
var urlLib = require('url');
var path = require('path');
var sqlite3 = require('sqlite3');

var baseURL, docsetName;

switch (process.argv[2]) {
    case 'extensions':
        baseURL = 'https://developer.chrome.com/extensions/';
        docsetName = 'Chrome Extensions API';
        break;
    case 'apps':
        baseURL = 'https://developer.chrome.com/apps/';
        docsetName = 'Chrome Apps API';
        break;
    default:
        throw 'Usage: ' + process.argv[1] + ' extensions|apps';
}

var basePath = docsetName.replace(/ /g, '_');
var baseDir =  basePath + '.docset';
var docDir = baseDir + '/Contents/Resources/Documents/';
var localPages = {};
var index = {};
var images = {};

localPages[baseURL + 'api_index'] = 1;

function info(s) {
    console.log(s);
}

function getURL(url, fn) {
    var tmp = '/tmp/chromeapi_' + url.replace(/\W+/g, '_');
    if(fs.existsSync(tmp)) {
        fn(url, fs.readFileSync(tmp));
        return;
    }
    request({url:url, encoding:null}, function (error, response, body) {
        fs.writeFileSync(tmp, body);
        fn(url, fs.readFileSync(tmp));
    });
}

function getHTML(url, fn) {
    getURL(url, function(url, html) {
        var doc = $(html.toString());
        doc.find('a').each(function() {
            $(this).attr('href', urlLib.resolve(url || "", $(this).attr('href') || ""));
        });
        fn(url, doc);
    });
}

function saveHTML(url, doc) {

    console.log({url});

    const inlineCss = `@charset "UTF-8";@keyframes rainbow{0%,to{background:violet}25%{background:orange}50%{background:#ff0}75%{background:#00f}}.align-start{align-items:start}.align-center{align-items:center}.decoration-none{text-decoration:none}.direction-column{flex-direction:column}.display-block{display:block}.display-inline-block{display:inline-block}.display-flex{display:flex}.display-inline-flex{display:inline-flex}.display-grid{display:grid}.display-none{display:none}.flow-space-100{--flow-space: 0.25rem}.flow-space-200{--flow-space: 0.5rem}.flow-space-300{--flow-space: 1rem}.flex-1{flex:1}.flex-shrink-none{flex-shrink:0}.gap-top-300{margin-top:1rem}.gap-top-500{margin-top:2rem}.gap-top-1000{margin-top:4.5rem}.gap-bottom-0{margin-bottom:0}.gap-left-100{margin-left:.25rem}.gap-left-200{margin-left:.5rem}.gap-left-400{margin-left:1.5rem}.height-700{height:3rem}.justify-content-between{justify-content:space-between}.justify-content-center{justify-content:center}.measure-long{max-width:748px}.overflow-hidden{overflow:hidden}.pad-0{padding:0}.pad-200,top-nav{padding:.5rem}.pad-top-200{padding-top:.5rem}.pad-top-300{padding-top:1rem}.pad-top-600{padding-top:2.5rem}.pad-right-200{padding-right:.5rem}.pad-right-400{padding-right:1.5rem}.pad-bottom-300{padding-bottom:1rem}.pad-bottom-600{padding-bottom:2.5rem}.pad-left-200{padding-left:.5rem}.pad-left-400{padding-left:1.5rem}.rounded-lg{border-radius:.75rem}.user-select-none{user-select:none}.weight-medium{font-weight:500}.width-300{width:1rem}.width-700{width:3rem}.width-full,side-nav navigation-tree{width:100%}@media screen and (min-width:992px){.lg\\:align-center{align-items:center}.lg\\:direction-row{flex-direction:row}.lg\\:display-flex{display:flex}.lg\\:display-none{display:none}.lg\\:flow-space-500{--flow-space: 2rem}.lg\\:gap-top-0{margin-top:0}.lg\\:gap-top-400{margin-top:1.5rem}.lg\\:gap-left-400{margin-left:1.5rem}.lg\\:gap-left-500{margin-left:2rem}.lg\\:pad-top-200{padding-top:.5rem}.lg\\:pad-right-0{padding-right:0}.lg\\:pad-right-200{padding-right:.5rem}.lg\\:pad-right-600{padding-right:2.5rem}.lg\\:pad-left-0{padding-left:0}.lg\\:pad-left-200{padding-left:.5rem}.lg\\:pad-left-600{padding-left:2.5rem}}@media screen and (min-width:1440px){.xl\\:display-block{display:block}.xl\\:display-none{display:none}}.navigation-tree__title{font-family:"Google Sans",sans-serif;font-size:1.125rem;line-height:1.5}.navigation-rail__link,.navigation-tree__link{border-radius:0 100px 100px 0;display:flex;padding:.375rem .5rem .375rem 0;text-align:left;text-decoration:none;user-select:none}.navigation-tree__link{color:var(--color-text)}.navigation-rail__link{align-items:center}.navigation-rail__link:hover,.navigation-tree__link:hover{background:var(--color-side-nav-hover)}.navigation-rail__link:focus,.navigation-tree__link:focus{z-index:1}.navigation-tree__link>:last-child{margin-left:2rem}.navigation-tree__icon{width:2rem}.navigation-rail__icon,.navigation-tree__icon{align-items:center;display:flex;justify-content:center;position:absolute}.navigation-rail__icon::before,.navigation-tree__icon::before{content:"&ZeroWidthSpace;"}.navigation-rail__icon>svg,.navigation-tree__icon>svg{min-width:24px;transition:transform .2s}[data-state=active].navigation-rail__link,[data-state=active].navigation-tree__link{background:var(--color-secondary);color:var(--color-side-nav-active)}.footer__link,.material-button,.search-box__link,.skip-link,.surface{overflow:hidden;position:relative}.footer__link::before,.material-button::before,.search-box__link::before,.skip-link::before,.surface::before{background-color:var(--overlay-background-color, currentColor);border-radius:2px;content:"";height:100%;left:0;opacity:0;position:absolute;top:0;transition:.2s opacity;width:100%}.footer__link:hover::before,.material-button:hover::before,.search-box__link:hover::before,.skip-link:hover::before,.surface:hover::before{opacity:.08}.footer__link:focus-within::before,.material-button:focus-within::before,.search-box__link:focus-within::before,.skip-link:focus-within::before,.surface:focus-within::before{opacity:.12}.button-filled:hover::before,.footer__link:active::before,.material-button:active::before,.search-box__link:active::before,.skip-link:active::before,.surface:active::before{opacity:.16}.link,a:not([class]){color:var(--link-color, var(--color-primary))}.link:not(.no-visited):visited,a:not(.no-visited):visited:not([class]){color:var(--link-visited-color, var(--color-link-default-visited))}.link:hover,a:hover:not([class]){background-color:rgba(var(--link-rgb-background, var(--rgb-primary)),.08)}.link:not(.no-visited):visited:hover,a:not(.no-visited):visited:hover:not([class]){background-color:rgba(var(--link-rgb-background, var(--rgb-link-default-visited)),.08)}.link:focus,.link:focus-within,a:focus-within:not([class]),a:focus:not([class]){background-color:rgba(var(--link-rgb-background, var(--rgb-primary)),.12)}.link:active,a:active:not([class]){background-color:rgba(var(--link-rgb-background, var(--rgb-primary)),.16)}.type h1:not([class^=type--var]),.type h2:not([class^=type--var]),.type h3:not([class^=type--var]),.type h4:not([class^=type--var]),.type--footer,.type--h2,.type--h3,.type--h6{font-family:"Google Sans",sans-serif;font-weight:400;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;text-rendering:optimizeSpeed}.type h1:not([class^=type--var]),.type--h2{font-size:2.5rem;line-height:1.2}@supports (font-size:clamp(1.75em,4.6875vw,3em)){.type h1:not([class^=type--var]),.type--h2{font-size:clamp(1.75em,4.6875vw,3em);line-height:1.1666666667}}.type h2:not([class^=type--var]),.type--h3{font-size:2rem;line-height:1.25}@supports (font-size:clamp(1.5em,3.515625vw,2.25em)){.type h2:not([class^=type--var]),.type--h3{font-size:clamp(1.5em,3.515625vw,2.25em);line-height:1.2222222222}}.type h3:not([class^=type--var]){font-size:1.75rem;line-height:1.2857142857}@supports (font-size:clamp(1.125em,2.734375vw,1.75em)){.type h3:not([class^=type--var]){font-size:clamp(1.125em,2.734375vw,1.75em);line-height:1.2857142857}}.type h4:not([class^=type--var]){font-size:1.25rem;line-height:1.4}@supports (font-size:clamp(1em,1.953125vw,1.25em)){.type h4:not([class^=type--var]){font-size:clamp(1em,1.953125vw,1.25em);line-height:1.4}}.type--h6{font-weight:500;font-size:1rem;line-height:1.75}@supports (font-size:clamp(.875em,1.5625vw,1em)){.type--h6{font-size:clamp(.875em,1.5625vw,1em);line-height:1.75}}.type--footer{font-weight:500;font-size:1rem;line-height:1.75}.banner,.material-button,.skip-link,.toc__wrapper a,.type,.type ol:not([class])>li::before,.type--caption,.type--label,.type--small,.type--xsmall,:root{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans","Helvetica Neue",sans-serif;font-weight:400;font-size:1rem;line-height:1.75;text-rendering:optimizeSpeed}.banner,.material-button,.skip-link,.toc__wrapper a,.type--small{font-size:.875rem;line-height:1.4285714286}.type ol:not([class])>li::before,.type--caption{font-size:.875rem;line-height:1.7142857143}.type--label{font-weight:500;font-size:.75rem;line-height:1.3333333333}.type--xsmall{font-size:.75rem;line-height:1.6666666667}.type ul:not([class]){list-style:none;margin-left:3rem;padding:0;position:relative}@media (min-width:992px){.type ul:not([class]){max-width:calc(100% - 6rem)}}.type ul:not([class])>li{margin-top:.5em}.type ol:not([class])>li:first-of-type,.type ul:not([class])>li:first-of-type{margin-top:0}.type ol:not([class])>li::before,.type ul:not([class])>li::before{border-radius:50%;display:inline-flex;margin-right:1rem;position:absolute}.type ul:not([class])>li::before{background:#5f6368;content:"";height:.5rem;margin-left:-1.5rem;transform:translateY(.625rem);width:.5rem}.type ol:not([class]){list-style:none;margin-left:3.5rem;padding:0;position:relative;counter-reset:ol-step-counter}@media (min-width:992px){.type ol:not([class]){max-width:calc(100% - 7rem)}}.type ol:not([class])>li{counter-increment:ol-step-counter;margin-top:.5em}.type ol:not([class])>li::before{background:#f1f3f4;content:counter(ol-step-counter);flex-shrink:0;height:1.5rem;justify-content:center;margin-left:-2.5rem;transform:translateY(.1875rem);width:1.5rem}.type code,.type pre{font-family:ui-monospace,Menlo,Consolas,Monaco,"Roboto Mono","Source Code Pro","Liberation Mono","Lucida Console",monospace;font-size:.9375em;line-height:1.7333333333}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:400;src:url(/fonts/google-sans-v2003/regular/cyrillic.woff2) format("woff2");unicode-range:U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:400;src:url(/fonts/google-sans-v2003/regular/greek.woff2) format("woff2");unicode-range:U+0370-03FF}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:400;src:url(/fonts/google-sans-v2003/regular/vietnamese.woff2) format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+1EA0-1EF9,U+20AB}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:400;src:url(/fonts/google-sans-v2003/regular/latin-ext.woff2) format("woff2");unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:400;src:url(/fonts/google-sans-v2003/regular/latin.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:500;src:url(/fonts/google-sans-v2003/medium/cyrillic.woff2) format("woff2");unicode-range:U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:500;src:url(/fonts/google-sans-v2003/medium/greek.woff2) format("woff2");unicode-range:U+0370-03FF}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:500;src:url(/fonts/google-sans-v2003/medium/vietnamese.woff2) format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+1EA0-1EF9,U+20AB}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:500;src:url(/fonts/google-sans-v2003/medium/latin-ext.woff2) format("woff2");unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-display:swap;font-family:"Google Sans";font-style:normal;font-weight:500;src:url(/fonts/google-sans-v2003/medium/latin.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}:root{--color-mode: "light";--color-bg: #fff;--color-bg-shade: #f1f3f4;--color-text: #3c4043;--color-secondary-text: #5f6368;--color-primary: #1a73e8;--rgb-primary: 26, 115, 232;--color-primary-shade: #1967d2;--color-secondary: #e8f0fe;--color-hairline: #dadce0;--color-footer-bg: #f8f9fa;--color-side-nav-hover: #f1f3f4;--color-side-nav-active: #1a73e8;--color-link-default-visited: #681da8;--rgb-link-default-visited: 103, 29, 168;--rgb-button-overlay: 60, 64, 67;--color-code-bg: #f8f9fa;--color-code-comment: #9aa0a6;--color-code-string: #174ea6;--color-code-tag: #1e8e3e;--color-code-number: #1967d2;--color-code-attr: #d01884;--color-code-highlight: #fde293;--color-code-add: #a8dab5;--color-code-remove: #f6aea9;--color-project-default: #1967d2;--color-project-handbook: #c5221f;--color-project-workbox: #fa903e;--color-blue-lightest: rgba(232, 240, 254, 0.4);--color-blue-lighter: rgba(232, 240, 254, 0.54);--color-blue-medium: #1967d2;--color-blue-darkest: #174ea6;--rgb-blue-darkest: 23, 78, 166;--color-yellow-lightest: rgba(254, 247, 224, 0.4);--color-yellow-lighter: rgba(254, 247, 224, 0.5);--color-yellow-medium: #f29900;--color-yellow-darkest: #b05a00;--rgb-yellow-darkest: 227, 117, 0;--color-red-lightest: rgba(252, 232, 230, 0.4);--color-red-lighter: rgba(252, 232, 230, 0.5);--color-red-medium: #c5221f;--color-red-darkest: #a50e0e;--rgb-red-darkest: 165, 14, 14;--color-green-lightest: rgba(230, 244, 234, 0.4);--color-green-lighter: rgba(230, 244, 234, 0.5);--color-green-medium: #188038;--color-green-darkest: #0d652d;--rgb-green-darkest: 13, 101, 45;--color-purple-lightest: rgba(243, 232, 253, 0.4);--color-purple-lighter: rgba(243, 232, 253, 0.5);--color-purple-medium: #8430ce;--color-purple-darkest: #681da8;--rgb-purple-darkest: 104, 29, 168;--color-pink-lightest: rgba(253, 231, 243, 0.4);--color-pink-lighter: rgba(253, 231, 243, 0.5);--color-pink-medium: #d01884;--color-pink-darkest: #9c166b;--rgb-pink-darkest: 156, 22, 107;--color-cyan-lightest: rgba(228, 247, 251, 0.4);--color-cyan-lighter: rgba(228, 247, 251, 0.5);--color-cyan-medium: #129eaf;--color-cyan-darkest: #007b83;--rgb-cyan-darkest: 0, 122, 131;--flow-space: 2rem;font-size:100%}*,::after,::before{box-sizing:border-box}body,h1,h2,h3,h4,p,pre{margin:0}body{min-height:100vh;background-color:var(--color-bg);color:var(--color-text);overflow-wrap:break-word;transition:background 500ms ease-in-out,color 200ms ease}ol[role=list],ul[role=list]{list-style:none}ol,ul{list-style-position:inside}a:not([class]){text-decoration-skip-ink:auto}img{display:block;height:auto;max-width:100%}li img,p img{display:inline-block;vertical-align:sub}button,input,select{font:inherit;letter-spacing:inherit;word-spacing:inherit}img:not([alt]){filter:blur(10px)}@media (prefers-reduced-motion:reduce){*{animation-duration:.01s!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01s!important}}.details>summary:focus,main:focus,navigation-tree:focus{outline:0}.details,.type{position:relative}.type pre code{font-size:inherit}.details{border:1px solid var(--color-hairline);border-width:1px 0;padding:calc(var(--flow-space)/2) 0}.details>summary{cursor:pointer;list-style:none;-webkit-tap-highlight-color:transparent}.details>summary::-webkit-details-marker,.details>summary::marker{display:none}.details .heading-link{display:none}.button,.material-button,.search-box__btn,.skip-link{background:0 0;border:0;cursor:pointer;text-decoration:none}.button svg,.material-button svg,.search-box__btn svg,.skip-link svg{vertical-align:middle}.material-button,.skip-link{font-family:"Google Sans",sans-serif;border-radius:.25rem;color:var(--button-color, inherit);padding:.5rem 1.5rem;white-space:nowrap}.button-text{margin-left:-.5rem;margin-top:-.5rem;padding:.5rem}.button-text+.button-text{margin-left:1rem}.button-filled{position:relative;transition:box-shadow .1s;z-index:1}.button-filled::before{background:rgba(var(--rgb-button-overlay),1);border-radius:inherit;bottom:0;content:"";left:0;opacity:0;position:absolute;right:0;top:0;transition:opacity .1s;z-index:-1}.button-filled:hover{box-shadow:rgba(var(--rgb-button-overlay),.3) 0 1px 2px 0,rgba(var(--rgb-button-overlay),.15) 0 1px 3px 1px}.button-filled:active{box-shadow:rgba(var(--rgb-button-overlay),.3) 0 1px 2px 0,rgba(var(--rgb-button-overlay),.15) 0 2px 6px 2px}.button-filled:focus::before{opacity:.24}.button-filled:active::before{opacity:.36}.banner{background:var(--color-bg-shade);display:flex;justify-content:center;padding:1rem}.banner--info{--button-color: var(--color-blue-medium);background-color:var(--color-blue-lighter)}.banner__inner{max-width:748px;display:flex;flex-direction:column;justify-content:space-between;width:100%}@media (min-width:992px){.banner__inner{align-items:baseline;flex-direction:row}}.banner__text{max-width:65ch}.banner__actions{display:flex;justify-content:flex-end;margin-top:1rem;white-space:nowrap}@media (min-width:992px){.banner__actions{align-items:flex-end;margin-left:1rem;margin-top:0}}.banner__action{font-weight:500}.toc__wrapper li::before,[data-banner-dismissed] .banner,announcement-banner[hidden]{display:none}.icon{fill:currentColor}like-icon{height:20px}like-icon a{color:#000;text-decoration:none}like-icon a:active,like-icon a:hover,like-icon a:visited{color:#000}like-icon [data-liked=false] svg,like-icon svg{color:#000;fill:none;height:20px;margin-top:-3px;vertical-align:middle;width:20px}like-icon [data-liked=true] svg{color:#fff;fill:red}like-icon span{display:inline-block;margin:0 .5em;width:3em}code,pre,pre[class*=language-]{background:var(--color-code-bg);border:1px solid var(--color-hairline);border-radius:3px}pre,pre[class*=language-]{color:var(--color-text);overflow:auto;padding:.5em}code{padding:.125em .25em}pre>code{background:initial;border:initial;border-radius:initial;padding:initial}.token.comment{color:var(--color-code-comment)}.token.punctuation,.token.string{color:var(--color-code-string)}.token.property,.token.tag{color:var(--color-code-tag)}.token.boolean,.token.number{color:var(--color-code-number)}.token.operator,.token.regex,.token.url{color:var(--color-code-attr)}.namespace{opacity:.7}.scaffold{display:grid;height:100vh;grid-template-columns:auto 1fr;grid-template-rows:auto 1fr auto;grid-template-areas:"header header" "sidebar main" "sidebar footer"}.scaffold>*{min-width:0}.scaffold>top-nav{grid-area:header}.scaffold>navigation-rail,.scaffold>side-nav{grid-area:sidebar}.scaffold>main{grid-area:main}.scaffold>footer{grid-area:footer}.search-box__results,.stack{display:flex;flex-direction:column;justify-content:flex-start;min-width:0}.search-box__results>*,.stack>*{margin-bottom:0;margin-top:0}.search-box__results>*+*,.stack-recursive *+*,.stack>*+*{margin-top:var(--flow-space)}.cluster{overflow:hidden}.cluster>*{display:flex;flex-wrap:wrap;margin:calc(var(--flow-space)/2*-1)}.cluster>*>*{margin:calc(var(--flow-space)/2)}.breadcrumbs{align-items:center;display:flex;flex-flow:row wrap;justify-content:center}.breadcrumbs>a,.breadcrumbs>svg{fill:var(--color-secondary-text);margin:0 var(--flow-space)}@media (min-width:992px){top-nav{padding:.625rem 1.5rem}}top-nav nav{gap:1rem;grid-template-columns:min-content auto min-content;position:relative}@media (min-width:992px){top-nav nav{gap:3.5rem;grid-template-columns:1fr 2fr 1fr}}@media (max-width:991px){top-nav[data-search-active] nav{grid-template-columns:1fr;padding:0 1.5rem}top-nav[data-search-active] .top-nav__hamburger,top-nav[data-search-active] .top-nav__logo{display:none}}top-nav[data-search-active] nav::before{z-index:20;margin-left:calc(50% - 50vw);width:100vw;background-color:var(--color-hairline);content:"";display:block;height:1px;position:absolute;top:calc(2.75rem + .625rem)}top-nav[data-search-active] nav::after{z-index:10;margin-left:calc(50% - 50vw);width:100vw;background:var(--color-bg);content:"";height:100vh;left:0;position:absolute;top:0}navigation-rail{display:none;outline:0}@media (min-width:992px){navigation-rail{border-right:1px solid var(--color-hairline);display:block}}.navigation-rail__link{font-size:.875rem;line-height:2;color:var(--color-secondary-text);padding-bottom:.75rem;padding-top:.75rem}@media (min-width:992px){.navigation-rail__link{flex-direction:column;padding:0;position:relative}.navigation-rail__link .navigation-rail__icon{position:static}.navigation-rail__link+.navigation-rail__link{--flow-space: 1.5rem;margin-top:var(--flow-space)}.navigation-rail__link:hover{background:0 0;z-index:0}.navigation-rail__link:hover::before{background:var(--color-side-nav-hover);border-radius:50%;content:"";height:40px;position:absolute;top:-6px;width:40px;z-index:-1}}.navigation-rail__link[data-state=active]{color:var(--color-side-nav-active)}@media (min-width:992px){.navigation-rail__link[data-state=active]{background:0 0}}.navigation-rail__link>:last-child{margin-left:4rem}@media (min-width:992px){.navigation-rail__link>:last-child{margin-left:0}}.navigation-rail__icon{width:4rem}navigation-tree{display:none;width:15.625rem}@media (min-width:992px){navigation-tree{display:block}}.navigation-tree__link{font-size:.8125rem;line-height:1.6923076923;align-items:flex-start;padding-left:.75rem}.navigation-tree__link[aria-expanded=true] .navigation-tree__icon>svg{transform:rotate(90deg)}.navigation-tree__link[aria-expanded=true]+.navigation-tree__nested{display:flex}.navigation-tree__nested{display:none;flex-direction:column}.navigation-tree__nested>.navigation-tree__link{padding-left:1.5rem}.navigation-tree__nested>.navigation-tree__nested>.navigation-tree__link{padding-left:3rem}side-nav,side-nav::before{height:100%;left:0;top:0;width:100%}side-nav{z-index:40;pointer-events:none;position:fixed;visibility:hidden}@media (min-width:992px){side-nav{display:none}}side-nav::before{background:rgba(0,0,0,.4);content:"";display:block;opacity:0;position:absolute;transition:opacity .2s cubic-bezier(.4,0,.2,1)}@media (min-width:992px){side-nav::before{display:none}}side-nav navigation-rail,side-nav navigation-tree{display:block;height:100%}side-nav[expanded]{pointer-events:auto;visibility:visible}side-nav[expanded]::before{opacity:1}side-nav[expanded] .side-nav__container{transform:translate(0,0)}.side-nav__container{box-shadow:0 1px 2px 0 rgba(60,64,67,.3),0 2px 6px 2px rgba(60,64,67,.15);background:var(--color-bg);height:100%;max-width:22.5rem;overflow:hidden;transform:translate(-102%,0);transition:none;width:85vw}.side-nav__container>*{transition:none}side-nav[animating]{visibility:visible}side-nav[animating] .side-nav__container{transition:transform .2s cubic-bezier(.4,0,.2,1)}side-nav[animating] .side-nav__container>*{transition:transform .2s cubic-bezier(.4,0,.2,1),opacity .2s cubic-bezier(.4,0,.2,1);visibility:visible}side-nav[view=project] navigation-rail{opacity:0;transform:translate(100%,0);visibility:hidden}side-nav[view=project] navigation-tree{opacity:1;transform:translate(0,-100%)}side-nav[view=site] navigation-rail{opacity:1;transform:translate(0,0)}side-nav[view=site] navigation-tree{opacity:0;transform:translate(-100%,-100%);visibility:hidden}.reference{border-radius:4px}.code-sections ul{padding-left:0}.code-sections .code-sections{border:1px solid var(--color-hairline);padding:calc(1rem - 1px)}.code-sections .code-sections ul>li:first-child,.code-sections--summary>li:first-child{border-top:0;padding-top:0}.code-sections .type--small{font-size:.875em;line-height:2em}.code-sections__label{font-size:.875rem;line-height:2}.code-sections__icon::before{background:url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuNzc2MzkgMS41NTI3OUM3LjkxNzE2IDEuNDgyNCA4LjA4Mjg0IDEuNDgyNCA4LjIyMzYxIDEuNTUyNzlMMTQuMjIzNiA0LjU1Mjc5QzE0LjM5MyA0LjYzNzQ4IDE0LjUgNC44MTA2MSAxNC41IDVWMTFDMTQuNSAxMS4xODk0IDE0LjM5MyAxMS4zNjI1IDE0LjIyMzYgMTEuNDQ3Mkw4LjIyMzYxIDE0LjQ0NzJDOC4wODI4NCAxNC41MTc2IDcuOTE3MTYgMTQuNTE3NiA3Ljc3NjM5IDE0LjQ0NzJMMS43NzYzOSAxMS40NDcyQzEuNjA3IDExLjM2MjUgMS41IDExLjE4OTQgMS41IDExVjVDMS41IDQuODEwNjEgMS42MDcgNC42Mzc0OCAxLjc3NjM5IDQuNTUyNzlMNy43NzYzOSAxLjU1Mjc5Wk0yLjUgNS44MDkwMlYxMC42OTFMNy41IDEzLjE5MVY4LjMwOTAyTDIuNSA1LjgwOTAyWk04LjUgOC4zMDkwMlYxMy4xOTFMMTMuNSAxMC42OTFWNS44MDkwMkw4LjUgOC4zMDkwMlpNMTIuODgyIDVMOCA3LjQ0MDk4TDMuMTE4MDMgNUw4IDIuNTU5MDJMMTIuODgyIDVaIiBmaWxsPSIjNUY2MzY4Ii8+Cjwvc3ZnPgo=) center/contain no-repeat;content:"";display:inline-block;height:1.25em;margin-right:.5ch;vertical-align:middle;width:1.25em}.code-sections__icon.code-sections__icon--number::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNiAyLjVINFY0LjVINlYyLjVaIiBmaWxsPSIjNUY2MzY4Ii8+CjxwYXRoIGQ9Ik02IDUuNUg0VjcuNUg2VjUuNVoiIGZpbGw9IiM1RjYzNjgiLz4KPHBhdGggZD0iTTQgOC41SDZWMTAuNUg0VjguNVoiIGZpbGw9IiM1RjYzNjgiLz4KPHBhdGggZD0iTTkgMi41SDdWNC41SDlWMi41WiIgZmlsbD0iIzVGNjM2OCIvPgo8cGF0aCBkPSJNNyA1LjVIOVY3LjVIN1Y1LjVaIiBmaWxsPSIjNUY2MzY4Ii8+CjxwYXRoIGQ9Ik05IDguNUg3VjEwLjVIOVY4LjVaIiBmaWxsPSIjNUY2MzY4Ii8+CjxwYXRoIGQ9Ik03IDExLjVIOVYxMy41SDdWMTEuNVoiIGZpbGw9IiM1RjYzNjgiLz4KPHBhdGggZD0iTTEyIDIuNUgxMFY0LjVIMTJWMi41WiIgZmlsbD0iIzVGNjM2OCIvPgo8cGF0aCBkPSJNMTAgNS41SDEyVjcuNUgxMFY1LjVaIiBmaWxsPSIjNUY2MzY4Ii8+CjxwYXRoIGQ9Ik0xMiA4LjVIMTBWMTAuNUgxMlY4LjVaIiBmaWxsPSIjNUY2MzY4Ii8+Cjwvc3ZnPgo=)}.code-sections__icon.code-sections__icon--string::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNC43MTQyOSAxMkg1Ljg1NzE0TDcuMjg1NzEgOC4yODU3MVY0LjVDNy4yODU3MSA0LjIyMzg2IDcuMDYxODYgNCA2Ljc4NTcxIDRIMy41QzMuMjIzODYgNCAzIDQuMjIzODYgMyA0LjVWNy43ODU3MUMzIDguMDYxODYgMy4yMjM4NiA4LjI4NTcxIDMuNSA4LjI4NTcxSDYuMTQyODZMNC43MTQyOSAxMlpNMTAuNDI4NiAxMkgxMS41NzE0TDEzIDguMjg1NzFWNC41QzEzIDQuMjIzODYgMTIuNzc2MSA0IDEyLjUgNEg5LjIxNDI5QzguOTM4MTQgNCA4LjcxNDI5IDQuMjIzODYgOC43MTQyOSA0LjVWNy43ODU3MUM4LjcxNDI5IDguMDYxODYgOC45MzgxNCA4LjI4NTcxIDkuMjE0MjkgOC4yODU3MUgxMS44NTcxTDEwLjQyODYgMTJaIiBmaWxsPSIjNUY2MzY4Ii8+Cjwvc3ZnPgo=)}.code-sections__icon.code-sections__icon--function::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMuNSA0QzMuNSAyLjYxOTI5IDQuNjE5MjkgMS41IDYgMS41SDYuNVYyLjVINkM1LjE3MTU3IDIuNSA0LjUgMy4xNzE1NyA0LjUgNFY1Ljc2MzkzQzQuNSA2LjcxMDg2IDMuOTY0OTkgNy41NzY1MiAzLjExODAzIDhDMy45NjQ5OSA4LjQyMzQ4IDQuNSA5LjI4OTE0IDQuNSAxMC4yMzYxVjEyQzQuNSAxMi44Mjg0IDUuMTcxNTcgMTMuNSA2IDEzLjVINi41VjE0LjVINkM0LjYxOTI5IDE0LjUgMy41IDEzLjM4MDcgMy41IDEyVjEwLjIzNjFDMy41IDkuNjY3OTEgMy4xNzkgOS4xNDg1MiAyLjY3MDgyIDguODk0NDNMMS43NzYzOSA4LjQ0NzIxQzEuNjA3IDguMzYyNTIgMS41IDguMTg5MzkgMS41IDhDMS41IDcuODEwNjEgMS42MDcgNy42Mzc0OCAxLjc3NjM5IDcuNTUyNzlMMi42NzA4MiA3LjEwNTU3QzMuMTc5IDYuODUxNDggMy41IDYuMzMyMDkgMy41IDUuNzYzOTNWNFpNMTAgMi41SDkuNVYxLjVIMTBDMTEuMzgwNyAxLjUgMTIuNSAyLjYxOTI5IDEyLjUgNFY1Ljc2MzkzQzEyLjUgNi4zMzIwOSAxMi44MjEgNi44NTE0OCAxMy4zMjkyIDcuMTA1NTdMMTQuMjIzNiA3LjU1Mjc5QzE0LjM5MyA3LjYzNzQ4IDE0LjUgNy44MTA2MSAxNC41IDhDMTQuNSA4LjE4OTM5IDE0LjM5MyA4LjM2MjUyIDE0LjIyMzYgOC40NDcyMUwxMy4zMjkyIDguODk0NDNDMTIuODIxIDkuMTQ4NTIgMTIuNSA5LjY2NzkxIDEyLjUgMTAuMjM2MVYxMkMxMi41IDEzLjM4MDcgMTEuMzgwNyAxNC41IDEwIDE0LjVIOS41VjEzLjVIMTBDMTAuODI4NCAxMy41IDExLjUgMTIuODI4NCAxMS41IDEyVjEwLjIzNjFDMTEuNSA5LjI4OTE0IDEyLjAzNSA4LjQyMzQ4IDEyLjg4MiA4QzEyLjAzNSA3LjU3NjUyIDExLjUgNi43MTA4NiAxMS41IDUuNzYzOTNWNEMxMS41IDMuMTcxNTcgMTAuODI4NCAyLjUgMTAgMi41WiIgZmlsbD0iIzVGNjM2OCIvPgo8L3N2Zz4K)}.code-sections__optional{color:var(--color-pink-medium)}.code-sections__callback{background:#f8f9fa;border:1px solid var(--color-hairline);display:block;padding:.5em}.code-sections__callback>code{background:0 0;border:0;border-radius:0;padding:0}p>.code-sections__callback{margin-top:.5em}.code-sections li,.code-sections__overline{border-top:1px solid var(--color-hairline);padding-top:1rem}.code-sections__overline{margin:1em 0}.code-sections__mode{color:var(--color-code-comment);text-transform:uppercase}.code-sections li{display:flex;flex-direction:column;position:relative}.code-sections li>:first-child{font-weight:500;flex:0 0 auto;flex-shrink:1;min-width:9rem;padding-right:1rem}.code-sections li>:not(:first-child){flex-grow:1}.code-sections--summary{padding-left:0}@media (min-width:992px){.code-sections--summary>li{flex-direction:row}}.code-sections--summary>li>:first-child{min-width:6.5rem}.aside--default{--link-color: var(--color-blue-darkest);--link-visited-color: var(--color-blue-darkest);--link-rgb-background: var(--rgb-blue-darkest);background-color:var(--color-blue-lightest);color:var(--color-blue-darkest)}.aside--caution{--link-color: var(--color-yellow-darkest);--link-visited-color: var(--color-yellow-darkest);--link-rgb-background: var(--rgb-yellow-darkest);background-color:var(--color-yellow-lightest);color:var(--color-yellow-darkest)}.aside--warning{--link-color: var(--color-red-darkest);--link-visited-color: var(--color-red-darkest);--link-rgb-background: var(--rgb-red-darkest);background-color:var(--color-red-lightest);color:var(--color-red-darkest)}.aside--success{--link-color: var(--color-green-darkest);--link-visited-color: var(--color-green-darkest);--link-rgb-background: var(--rgb-green-darkest);background-color:var(--color-green-lightest);color:var(--color-green-darkest)}.tag-pill{padding:.25rem .75rem}.tag-pill[title]{cursor:help}footer{--flow-space: 0.75rem;background-color:var(--color-footer-bg)}.footer__stack+.footer__stack{margin-top:2rem}@media (min-width:992px){.footer__stack+.footer__stack{margin-top:0}}.footer__link{color:var(--color-secondary-text)}.toc-container{max-width:100%;width:20rem}.toc>summary{list-style:none}.toc>summary::-webkit-details-marker{display:none}.toc__icon{display:inline-flex;margin-left:.5rem}.toc__icon>svg{display:flex;transform:rotate(90deg)}.toc[open] .toc__icon>svg{transform:rotate(270deg)}toc-active{max-height:calc(100vh - .5rem*2);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;position:sticky;top:.5rem}toc-active [toc--active]{font-weight:600;letter-spacing:-.35px}.toc__wrapper a{text-decoration:none}.toc__wrapper li{line-height:1.2}.toc__wrapper li+li{margin-top:.5rem}.toc__wrapper ol,.toc__wrapper ul{list-style-type:none;margin:.5rem 0;padding:0}.toc__wrapper ol ol,.toc__wrapper ol ul,.toc__wrapper ul ol,.toc__wrapper ul ul{border-left:1px solid var(--color-hairline);padding-left:1rem}search-box{min-height:2.75rem;position:relative}search-box[active]{z-index:20;background-color:var(--color-bg)}announcement-banner,search-box[active] .search-box__input,toc-active{display:block}.search-box__inner{align-items:center;display:grid;height:100%}.search-box__inner>*{grid-column:1;grid-row:1}.search-box__btn{z-index:10;align-items:center;display:flex;height:100%;justify-content:center;width:3rem}.search-box__btn>svg{fill:currentColor}.search-box__input{background:var(--color-bg-shade);border:0;border-radius:6.25rem;display:none;font:inherit;margin:0;padding:.5rem 1rem .5rem 3rem}@media (min-width:992px){.search-box__input{display:block;width:100%}}.search-box__input::placeholder{color:var(--color-secondary-text)}.search-box__results{--flow-space: 1.5rem;height:calc(100vh - 2.75rem);max-width:100%;overflow-x:hidden;padding-bottom:4.5rem;position:absolute;top:calc(2.75rem + .625rem + 1.5rem);word-break:break-word}.search-box__results strong{color:var(--color-primary)}.search-box__result-heading{color:var(--color-secondary-text)}.search-box__result-heading~.search-box__result-heading{border-top:1px solid var(--color-hairline);padding-top:1.5rem}.search-box__link{--overlay-background-color: var(--color-primary);align-items:center;display:inline-flex;text-decoration:none}.search-box__link[aria-selected=true]::before{opacity:.1}.search-box__title{color:var(--color-text)}.heading-link::after,.search-box__snippet{color:var(--color-secondary-text)}.search-box__thumbnail{margin-left:.5rem}@media (min-width:592px){.search-box__thumbnail{margin-left:1rem}}.youtube{padding-top:56.25%;position:relative;width:100%}.heading-link{color:transparent;float:left;margin-left:-1.5rem;opacity:.4;position:relative;text-align:center;text-decoration:none;width:1.5rem}.heading-link:hover{opacity:1}.heading-link::after{bottom:0;content:"#";left:0;position:absolute;right:0;top:0;transform:scale(.666);transform-origin:75% 50%}@media (min-width:992px){.heading-link::after{transform-origin:25% 50%}}announcement-banner [data-banner-close-btn]{opacity:0;pointer-events:none}announcement-banner[active] [data-banner-close-btn]{opacity:1;pointer-events:auto}[data-cookies-accepted] .cookie-banner{display:none}.cookie-banner{z-index:40;background-color:var(--color-bg);bottom:0;display:flex;flex-direction:column;padding:1.5rem;position:fixed;width:100%}@media (min-width:592px){.cookie-banner{align-items:center;flex-direction:row}}.cookie-banner__controls{margin-top:1rem}@media (min-width:592px){.cookie-banner__controls{margin-left:1.5rem;margin-top:0}}.cookie-banner__controls>:last-child{margin-left:1rem}.skip-link{background-color:var(--color-bg)}.skip-link:focus{clip:auto;padding:inherit;width:auto;z-index:1}.screenshot,select{border:1px solid var(--color-hairline)}.screenshot{box-sizing:content-box;padding:.25rem}share-button{border-radius:50%;display:block;height:32px;margin:-12px 0;width:32px}share-button:hover{background:var(--color-bg-shade)}share-button svg{vertical-align:middle}web-tabs{display:block;margin-top:var(--flow-space) 0;width:100%}web-tabs [role=tablist]{align-items:flex-end;border-bottom:1px solid var(--color-hairline);display:flex;min-height:50px;overflow-x:auto;scroll-behavior:smooth;width:100%}web-tabs [role=tab]{background:0 0;border:0;flex:1 0 auto;height:3rem;margin:0;min-width:fit-content;opacity:.6;position:relative;transition:background .2s,opacity .2s,color .2s}web-tabs [aria-selected=true]{color:var(--color-primary);opacity:1}web-tabs [role=tab]::after{background:0 0;bottom:0;content:"";display:block;height:2px;left:0;opacity:1;position:absolute;right:0;transition:background .2s}web-tabs [aria-selected=true]::after{background:var(--color-primary)}select{-webkit-appearance:none;appearance:none;background-color:#fff;background-image:url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10L12 15L17 10H7Z' fill='%235F6368'/%3E%3C/svg%3E%0A");background-position:right .5em top 50%;background-repeat:no-repeat;background-size:1.5em;border-radius:1px;box-sizing:border-box;display:block;font-size:1em;line-height:1.5;margin:0;max-width:100%;padding:.6em 3em .5em .8em}select::-ms-expand{display:none}select:hover{border-color:var(--color-text)}.logo__text{display:inline-flex;margin-left:12px;overflow:hidden}@media (max-width:591px){.logo__text>svg{margin-left:-82px}}.logo__text.logo__text-small>svg{margin-left:-82px}select-loader:not(:defined){visibility:hidden}.hairline-top{border-top:1px solid var(--color-hairline)}.hairline-bottom{border-bottom:1px solid var(--color-hairline)}.color-blue-medium{color:var(--color-blue-medium)}.color-cyan-medium{color:var(--color-cyan-medium)}.color-bg{color:var(--color-bg)}.color-secondary-text{color:var(--color-secondary-text)}.color-primary{color:var(--color-primary)}.bg-primary{background-color:var(--color-primary)}.scrollbar{scrollbar-color:#9aa0a6 transparent;scrollbar-width:thin}.scrollbar::-webkit-scrollbar{height:10px;width:10px}.scrollbar::-webkit-scrollbar-thumb{background:#9aa0a6;background-clip:padding-box;border:2.5px solid transparent;border-radius:5px}.scrollbar::-webkit-scrollbar-thumb:hover{background-color:#798189}.scrollbar::-webkit-scrollbar-thumb:active{background-color:#61686e}.scrollbar::-webkit-scrollbar-track{background:0 0}.footer__link,.surface{text-decoration:none}.footer__link:focus,.footer__link:hover,.surface:focus,.surface:hover{text-decoration:underline}.visually-hidden{border:0;clip:rect(0 0 0 0);height:auto;margin:0;overflow:hidden;padding:0;position:absolute;white-space:nowrap;width:1px}`;

    doc.find('nav').remove();
    doc.find('navigation-tree').remove();
    doc.find('announcement-banner').remove();
    doc.find('a').each(function() {
        var h = localLink($(this).attr('href'), url);
        $(this).attr('href', h);
    });
    doc.find('.video-container').replaceWith(function() {
        var src = 'http:' + $(this).find('iframe').attr("src");
        return $("<a href='" + src + "'>" + src + '</a>');
    });
    doc.find('img').each(function() {
        const whichApi = url?.match(/([^/]+)\/?$/)?.[0] || "";
        const apiImageRoute = `https://developer.chrome.com/extensions/reference/${whichApi}/${$(this).attr('src')}`;
        var h = apiImageRoute;
        images[h] = 1;
        $(this).attr('src', 'assets/' + path.basename(h));
    });

    var h = [
        '<!DOCTYPE html>',
        `<html><!-- Online page at ${url} --><head>`,
        '<link href="assets/site.css" rel="stylesheet" type="text/css">',
        '<meta charset="utf-8" />',
        `<style>${inlineCss}</style>`,
        '</head><body><div>',
        '<main id="gc-pagecontent" role="main">',
        doc,
        '</main></div></body></html>'
    ].join('\n');

    fs.writeFileSync(docDir + '/' + localFile(url), h);
}

function localFile(url) {
    if(url.indexOf(baseURL) == 0)
        url = url.substr(baseURL.length);
    var s = url.split('#');
    if(s[0] == 'api_index')
        s[0] = 'index';
    return s[0].replace(/\W/g, '_') + '.html';
}

function localLink(url, context) {
    var s = url.split('#');
    if(s[0] == context && s[1])
        return '#' + s[1];
    if(localPages.hasOwnProperty(s[0])) {
        var f = localFile(s[0]);
        if(s[1]) f += '#' + s[1];
        return f;
    }
    return url;
}

function addPage(url) {
    var s = url.split('#');
    if(!localPages.hasOwnProperty(s[0]))
        localPages[s[0]] = 1;
}

function extractIndex(url, doc) {

    var htype = {
        'Types': 'Type',
        'Properties': 'Property',
        'Methods': 'Method',
        'Events': 'Event'
    };

    var mod = doc.find('h1').text();
    index[url] = [mod, 'Module', url];

    ["type", "method", "event", "property"].forEach(typeOfDocumentedEntity => {
        const capitalizedTypeOfDocumentedEntity = typeOfDocumentedEntity[0].toUpperCase() + typeOfDocumentedEntity.substring(1);
        let linkElementsForTypeOfDocumentedEntity;
        try {
            linkElementsForTypeOfDocumentedEntity = doc.find(`.toc-container [href$=${typeOfDocumentedEntity}] + ul a`);
            linkElementsForTypeOfDocumentedEntity.each(function() {
                const href = $(this).attr('href');
                index[href] = [mod + "." + $(this).text(), capitalizedTypeOfDocumentedEntity, href];
            });
        } catch(err) {}
    });
}

function firstKey(obj) {
    var k = null;
    Object.keys(obj).some(function(x) {
        return obj[x] ? k = x : false;
    });
    return k;
}

function next() {
    queue.shift();
    if(queue.length) {
        go();
    }
}

function go() {
    queue[0]();
}

var queue = [

    function() {
        info('Creating build dir');
        exec('rm -rf ' + baseDir, function() {
            exec('rm -f ' + basePath + '.tgz', function() {
                exec('mkdir -p ' + docDir + '/assets', next);
            });
        });

    },

    function () {
        info('Getting css');
        getURL('https://developer.chrome.com/static/css/out/site.css', function(url, text) {


            var override = [
                '',
                '#gc-container { margin: 0 }',
                '.article-content [itemprop="articleBody"] { margin:0 }',
                'body { padding: 0 5em }',
                '* { font-family: "Lucida Grande",sans-serif }',
                '.code, code, pre { font-family: Monaco,monospace; color:black }'
            ].join('\n');
            fs.writeFileSync(docDir + '/assets/site.css', text + override);
            next();
        });
    },

    function () {
        var p = firstKey(localPages);
        if(!p) {
            next();
            return;
        }
        info('Fetching page ' + p);
        getHTML(p, function(url, doc) {
            var body = doc.find('main');
            var version = 0;

            if(url.match(/api_index$/)) {
                body.find('td:first-child a').each(function() {
                    var h = $(this).attr('href');
                    addPage(h);
                });
                body.find('td:nth-child(3)').each(function() {
                    var v = parseInt($(this).text());
                    if(v)
                        version = Math.max(version, v);
                });
                console.log('API version: ' + version);
            } else {
                extractIndex(url, body);
            }

            saveHTML(url, body);
            localPages[url] = 0;
            go();
        });
    },

    function () {
        var p = firstKey(images);
        if(!p) {
            next();
            return;
        }
        info('Fetching image ' + p);
        getURL(p, function(url, text) {
            fs.writeFileSync(docDir + '/assets/' + path.basename(url), text, {encoding:'binary'});
            images[url] = 0;
            go();
        });
    },

    function() {
        info('Writing index');

        var db = new sqlite3.Database(baseDir + '/Contents/Resources/docSet.dsidx');

        db.serialize(function() {
            db.run("CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT)");

            var stmt = db.prepare("INSERT INTO searchIndex(name, type, path) VALUES (?, ?, ?)");
            Object.keys(index).forEach(function(x) {
                var s = index[x];
                stmt.run(s[0], s[1], localLink(s[2]));
            });
            stmt.finalize();
        });

        db.close(next);
    },

    function() {
        info('Writing plist');

        var plist = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
            '<plist version="1.0">',
            '<dict>',
            '	<key>CFBundleIdentifier</key>',
            '	<string>chrome</string>',
            '	<key>CFBundleName</key>',
            '	<string>' + docsetName + '</string>',
            '	<key>DashDocSetFamily</key>',
            '	<string>javascript</string>',
            '	<key>DocSetPlatformFamily</key>',
            '	<string>chrome</string>',
            '	<key>dashIndexFilePath</key>',
            '	<string>index.html</string>',
            '	<key>isDashDocset</key>',
            '	<true/>',
            '</dict>',
            '</plist>',
            ''
        ].join('\n');
        fs.writeFileSync(baseDir + '/Contents/Info.plist', plist);
        next();
    },

    function() {
        info('Compressing');
        exec('tar czf ' + basePath + '.tgz ' + baseDir, next);
    },


    function() {
        info('Done');
    }
];

go();

