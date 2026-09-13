/* =======================================================================
   Service Worker（オフラインでも開けるようにする）
   -----------------------------------------------------------------------
   方針：ネットワーク優先、つながらなければ保存してある内容を使う。
     ・オンラインのときは常に最新を取りに行き、取れたものを保存しておく
       → 更新した内容はすぐ反映される（古いキャッシュを見続けない）
     ・オフラインのときは最後に保存した内容で動く
   進捗そのものは localStorage にあるので、ここでは扱わない。
   ======================================================================= */

const CACHE = "linuc101-shell-v1";

// 最初にまとめて保存しておくもの（index.html が読み込むファイル一式）
const SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./auth.js", "./core.js",
  "./questions.js", "./questions-sec.js", "./commands.js", "./notes.js", "./cards.js", "./keypoints.js",
  "./notes-view.js", "./cards-view.js", "./glossary.js", "./review-view.js",
  "./help-view.js", "./sync-view.js", "./ai-view.js", "./app.js",
  "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // 同じサイトの GET だけ扱う（GitHub や CDN への通信はそのまま通す）
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined)))
  );
});
