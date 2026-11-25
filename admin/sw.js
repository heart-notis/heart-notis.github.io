/* 🔔 제작자 페이지 전용 알림 담당 (/admin/ 안에서만)
   홈페이지 알림 담당(/sw.js)과 따로 있어서, 안드로이드에서 "하트 관리" 앱 이름으로 알림이 와요.
   화면 저장(캐시)은 안 해요 — 제작자 페이지는 항상 최신으로 열려야 하니까요. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: "하트 관리", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "하트 관리", {
    body: d.body || "",
    icon: "/admin-touch-icon.png",
    badge: "/notify-badge.png",
    tag: d.tag,
    data: { url: "/admin/#messages" },
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/admin/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    const w = ws.find(w => new URL(w.url).pathname.startsWith("/admin"));
    if (w && "focus" in w) { w.navigate(url); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
