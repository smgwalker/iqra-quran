// Post-process single-output web export: inject iOS home-screen + manifest meta.
const fs=require("fs"),p=(process.argv[2]||"dist-web")+"/index.html";
let h=fs.readFileSync(p,"utf8");
const m=`<link rel="manifest" href="/manifest.json"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Axs Iqra"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="theme-color" content="#F7F4EC">`;
if(!h.includes('rel="manifest"'))h=h.replace("</head>",m+"</head>");
h=h.replace(/<title>.*?<\/title>/,"<title>Axs Iqra</title>");
fs.writeFileSync(p,h);
// Vercel drops any path containing node_modules from uploads; mirror those assets
// to assets/nm (vercel.json rewrites /assets/node_modules/* -> /assets/nm/*).
const nm=(process.argv[2]||"dist-web")+"/assets/node_modules";
if(fs.existsSync(nm))fs.cpSync(nm,(process.argv[2]||"dist-web")+"/assets/nm",{recursive:true});

// Optional (--split): split oversized JS bundles into <=4MB parts loaded via a Blob
// script. Only needed when deploying through an uploader with a per-file size cap.
if (process.argv.includes("--split")) {
  const dir = process.argv[2] || "dist-web", LIMIT = 4 * 1024 * 1024;
  let html = fs.readFileSync(p, "utf8");
  html = html.replace(/<script src="(\/_expo\/[^"]+\.js)" defer><\/script>/g, (tag, src) => {
    const file = dir + src, js = fs.readFileSync(file, "utf8");
    if (js.length <= LIMIT) return tag;
    const parts = [];
    for (let i = 0; i * LIMIT < js.length; i++) {
      const name = src.replace(/\.js$/, `.part${i}.txt`);
      fs.writeFileSync(dir + name, js.slice(i * LIMIT, (i + 1) * LIMIT));
      parts.push(name);
    }
    fs.unlinkSync(file);
    return `<script>Promise.all(${JSON.stringify(parts)}.map(function(u){return fetch(u).then(function(r){return r.text()})})).then(function(t){var s=document.createElement("script");s.src=URL.createObjectURL(new Blob(t,{type:"text/javascript"}));document.body.appendChild(s)})</script>`;
  });
  fs.writeFileSync(p, html);
}
