/* scripts/postexport.cjs */
const fs = require("fs");
const path = require("path");

// dist 경로 확인
const dist = path.join(__dirname, "..", "dist");
if (!fs.existsSync(dist)) {
  console.error("❌ postexport: dist/ 폴더가 없습니다. 먼저 `npx expo export -p web`을 실행하세요.");
  process.exit(1);
}

const htmlFile = path.join(dist, "index.html");
if (!fs.existsSync(htmlFile)) {
  console.error("❌ postexport: dist/index.html이 없습니다.");
  process.exit(1);
}

// package.json의 homepage에서 basePath 추출 (예: https://user.github.io/skytracker/ -> /skytracker/)
let basePath = "/";
try {
  const pkg = require(path.join(__dirname, "..", "package.json"));
  if (pkg.homepage) {
    const u = new URL(pkg.homepage);
    // pathname이 "/"로 끝나면 그대로 사용, 아니면 끝에 "/" 추가
    basePath = u.pathname.endsWith("/") ? u.pathname : `${u.pathname}/`;
  }
} catch (e) {
  // homepage 없으면 root로 처리
}

// pwa 폴더 복사 (manifest, sw 등)
const pwaSrc = path.join(__dirname, "..", "pwa");
if (fs.existsSync(pwaSrc)) {
  fs.cpSync(pwaSrc, dist, { recursive: true });
  console.log("📦 PWA assets copied to dist/");
} else {
  console.warn("⚠️ pwa 폴더가 없어 복사를 건너뜀 (필수는 아님)");
}

// index.html 로드
let html = fs.readFileSync(htmlFile, "utf8");

// <head> 닫히기 전에 manifest 링크 삽입 (이미 있으면 건너뜀)
if (!html.includes('rel="manifest"')) {
  const manifestTag = `  <link rel="manifest" href="${basePath}manifest.webmanifest">\n`;
  html = html.replace("</head>", `${manifestTag}</head>`);
}

// Service Worker 등록 스니펫 (이미 있으면 건너뜀)
// - scope를 basePath로 설정하여 /skytracker/ 하위에서만 동작하도록
if (!html.includes("navigator.serviceWorker.register(")) {
  const swSnippet = `
<script>
(function() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      var basePath = ${JSON.stringify(basePath)};
      navigator.serviceWorker.register(basePath + 'sw.js', { scope: basePath })
        .catch(function(err){ console.error('SW registration failed:', err); });
    });
  }
})();
</script>
`;
  html = html.replace("</body>", `${swSnippet}\n</body>`);
}

// 변경 저장
fs.writeFileSync(htmlFile, html, "utf8");
console.log("✅ Manifest + Service Worker injected into index.html");

// SPA 라우팅용 404.html 생성 (GitHub Pages)
const notFound = path.join(dist, "404.html");
try {
  fs.copyFileSync(htmlFile, notFound);
  console.log("✅ 404.html created for SPA routing on GitHub Pages");
} catch (e) {
  console.warn("⚠️ 404.html 생성 실패:", e?.message || e);
}

console.log("🎉 postexport 완료!");
