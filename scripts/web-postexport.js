// Post-process single-output web export: inject iOS home-screen + manifest meta.
const fs=require("fs"),p=(process.argv[2]||"dist-web")+"/index.html";
let h=fs.readFileSync(p,"utf8");
const m=`<link rel="manifest" href="/manifest.json"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Axs Iqra"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="theme-color" content="#F7F4EC">`;
if(!h.includes('rel="manifest"'))h=h.replace("</head>",m+"</head>");
h=h.replace(/<title>.*?<\/title>/,"<title>Axs Iqra</title>");
fs.writeFileSync(p,h);
