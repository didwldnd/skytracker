// scripts/postexport.cjs  (CommonJS)
const fs = require("fs");
const path = require("path");

const dist = path.join(process.cwd(), "dist");
const indexHtml = path.join(dist, "index.html");

if (!fs.existsSync(indexHtml)) {
  console.error("❌ dist/index.html not found. Run `npx expo export -p web` first.");
  process.exit(1);
}

// 0) .nojekyll 생성 (언더스코어 폴더 이슈 회피)
fs.writeFileSync(path.join(dist, ".nojekyll"), "", "utf8");

// 1) index.html 읽기
let html = fs.readFileSync(indexHtml, "utf8");

// 2) 프리픽스 보정 (/ → /skytracker/). 이미 붙은 건 건드리지 않음
html = html.replace(/src="\/(?!skytracker\/)/g, 'src="/skytracker/');
html = html.replace(/href="\/(?!skytracker\/)/g, 'href="/skytracker/');

// 3) manifest 링크 없으면 추가
if (!html.includes('rel="manifest"')) {
  html = html.replace(
    "</head>",
    '  <link rel="manifest" href="/skytracker/manifest.webmanifest">\n</head>'
  );
}

// 4) 메인 번들 파일명 추출해서 dist 루트로 복사(언더스코어 이슈 회피)
const match = html.match(/src="\/skytracker\/_expo\/static\/js\/web\/([^"]+\.js)"/);
if (match) {
  const bundleFileName = match[1];
  const bundleSrcPath = path.join(dist, "_expo", "static", "js", "web", bundleFileName);
  const bundleDstPath = path.join(dist, bundleFileName);
  if (fs.existsSync(bundleSrcPath)) {
    fs.copyFileSync(bundleSrcPath, bundleDstPath);
    const mapSrc = bundleSrcPath + ".map";
    const mapDst = bundleDstPath + ".map";
    if (fs.existsSync(mapSrc)) fs.copyFileSync(mapSrc, mapDst);
    // index.html에서 참조 변경
    html = html.replace(
      /src="\/skytracker\/_expo\/static\/js\/web\/[^"]+\.js"/,
      `src="/skytracker/${bundleFileName}"`
    );
  }
}

// 5) 404.html → index.html SPA 리다이렉트(깃헙페이지 라우팅용)
const spa404 = `
<!doctype html><html><head><meta http-equiv="refresh" content="0; url=/skytracker/">
<script>sessionStorage.redirect=location.href;</script></head><body></body></html>`;
fs.writeFileSync(path.join(dist, "404.html"), spa404, "utf8");

// 6) Service Worker 등록 스니펫 주입(중복 방지)
if (!html.includes("navigator.serviceWorker.register")) {
  html = html.replace(
    "</body>",
    `
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/skytracker/sw.js", { scope: "/skytracker/" })
      .catch(e => console.log("SW reg failed", e));
  });
}
</script>
</body>`
  );
}
// --- add: copy helper & copy public files to dist root ---
const copyToDist = (filename) => {
  const src = path.join(process.cwd(), "public", filename);
  const dst = path.join(dist, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log("copied:", filename);
    return true;
  } else {
    console.warn("missing in public/:", filename);
    return false;
  }
};

// 복사 실행 (dist 루트로!)
const COPIES = [
  "pwa-192.png",
  "pwa-512.png",
  "mobile.png", // 모바일 스크린샷
  "wide.png",          
  "manifest.webmanifest",        // public에 따로 있으면 dist로 강제 복사
  "favicon.icon"                  // 있으면 캐시 프리캐시용
];
COPIES.forEach(copyToDist);
// 7) manifest 생성/보강
const manifestPath = path.join(dist, "manifest.webmanifest");
let manifest = {
  name: "skytracker",
  short_name: "skytracker",
  start_url: "/skytracker/",
  scope: "/skytracker/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#6ea1d4",
  icons: []
};

if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); } catch {}
}

const icons = manifest.icons || [];
const need192 = !icons.some(i => (i.sizes||"") === "192x192");
const need512 = !icons.some(i => (i.sizes||"") === "512x512");

// dist 루트 기준으로 존재 확인
if (fs.existsSync(path.join(dist, "pwa-192.png")) && need192) {
  icons.push({ src: "/skytracker/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" });
}
if (fs.existsSync(path.join(dist, "pwa-512.png")) && need512) {
  icons.push({ src: "/skytracker/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" });
}
manifest.icons = icons;

// --- add: screenshots 등록 (모바일 1장은 필수) ---
const screenshots = manifest.screenshots || [];
const hasMobileShot = screenshots.some(s => s.src?.endsWith("mobile.png"));
if (fs.existsSync(path.join(dist, "mobile.png")) && !hasMobileShot) {
  screenshots.push({
    src: "/skytracker/mobile.png",
    sizes: "1080x1920",
    type: "image/png"
    // form_factor 생략 → 모바일로 인정
  });
}
// wide가 있으면 선택적으로 추가
if (fs.existsSync(path.join(dist, "screen-wide.png")) &&
    !screenshots.some(s => s.src?.endsWith("screen-wide.png"))) {
  screenshots.push({
    src: "/skytracker/screen-wide.png",
    sizes: "1280x720",
    type: "image/png",
    form_factor: "wide"
  });
}

manifest.screenshots = screenshots;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");


// 8) sw.js 생성(네트워크 우선 + 정적 프리캐시 + SPA fallback)
const swJs = `
const CACHE_NAME = "skytracker-cache-v1";
const SCOPE = "/skytracker/";
const PRECACHE = [
  SCOPE,
  SCOPE + "index.html",
  SCOPE + "manifest.webmanifest",
  SCOPE + "favicon.icon"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 스코프 바깥은 무시
  if (!url.pathname.startsWith(SCOPE)) return;

  // HTML은 네트워크 우선(오프라인 시 캐시 fallback)
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match(SCOPE + "index.html"))
    );
    return;
  }

  // 나머지는 캐시 우선(없으면 네트워크)
  e.respondWith(
    caches.match(req).then(c => c || fetch(req).then(res => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
      return res;
    }))
  );
});
`;
fs.writeFileSync(path.join(dist, "sw.js"), swJs, "utf8");

// 9) index.html 저장
fs.writeFileSync(indexHtml, html, "utf8");

console.log("✅ PWA assets injected (manifest, sw.js, 404.html, registration)");
console.log("🎉 postexport done");
