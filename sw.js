/* 🔔 하트 사이트 알림 담당 (스포일러 공개 알림) */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: "하트", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "하트", {
    body: d.body || "",
    icon: "apple-touch-icon.png",
    badge: "favicon-64.png",
    image: d.image,
    tag: d.tag,
    data: { url: d.url || "./" },
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ("focus" in w) { w.navigate(url); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
