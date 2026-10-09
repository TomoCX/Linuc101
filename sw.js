/* =======================================================================
   Service Worker（オフラインでも開けるようにする）
   -----------------------------------------------------------------------
   方針：ネットワーク優先、つながらなければ保存してある内容を使う。
     ・オンラインのときは常に最新を取りに行き、取れたものを保存しておく
       → 更新した内容はすぐ反映される（古いキャッシュを見続けない）
     ・オフラインのときは最後に保存した内容で動く
   進捗そのものは localStorage にあるので、ここでは扱わない。
   ======================================================================= */

const CACHE = "linuc101-shell-v4";

// 最初にまとめて保存しておくもの。スクリプトは index.html から読み取るので、
// 試験やファイルを増やしてもこのファイルを直す必要はない
const SHELL = ["./", "./index.html", "./style.css", "./manifest.json", "./icon-192.png", "./icon-512.png"];

async function shellFiles() {
  const html = await (await fetch("./index.html", { cache: "no-store" })).text();
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => "./" + m[1]);
  return SHELL.concat(scripts);
}

self.addEventListener("install", (e) => {
  e.waitUntil(
    Promise.all([caches.open(CACHE), shellFiles()])
      .then(([c, files]) => c.addAll(files))
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
