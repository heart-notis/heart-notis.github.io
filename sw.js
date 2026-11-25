/* 🔔 하트 사이트 알림 담당 (스포일러 공개 알림) + ⚡ 다시 올 때 빨리 열리게 */
const CACHE = "heart-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
// 사진·글꼴: 저장해둔 걸 바로 보여주고 뒤에서 새로 받아둬요 · 화면(html)·글(data.js): 항상 새로 받고, 인터넷이 안 될 때만 저장본
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === location.origin, font = /cdn\.jsdelivr\.net$/.test(url.hostname) && /pretendard/.test(url.pathname);
  if (!same && !font) return;
  if (same && (/\/admin\.html$/.test(url.pathname) || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/c/") || /\/sw\.js$/.test(url.pathname))) return;
  const isAsset = font || /\.(webp|jpg|jpeg|png|svg|woff2?)$/i.test(url.pathname);
  if (isAsset) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (req.mode === "navigate" || /\/data\.js$/.test(url.pathname)) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "/" : req, cp)); } return r; })
      .catch(async () => (await caches.match(req.mode === "navigate" ? "/" : req)) || Response.error()));
  }
});
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: "하트", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "하트", {
    body: d.body || "",
    icon: d.icon || "apple-touch-icon.png",
    badge: "notify-badge.png",
    image: d.image,
    tag: d.tag,
    data: { url: d.url || "./" },
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    const want = new URL(url, self.location.origin), adminUrl = /admin\.html/.test(want.pathname);
    // 제작자 알림은 제작자 페이지 창으로, 홈페이지 알림은 홈페이지 창으로
    const same = ws.find(w => /admin\.html/.test(new URL(w.url).pathname) === adminUrl);
    if (same && "focus" in same) { same.navigate(want.href); return same.focus(); }
    return self.clients.openWindow(url);
  }));
});
