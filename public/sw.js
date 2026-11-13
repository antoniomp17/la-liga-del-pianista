// Service Worker para Notificaciones Push Nativas en La Liga del Pianista
self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "🎹 La Liga del Pianista";
    const options = {
      body: data.body || "¡Nuevas notas publicadas! Entra a ver tu clasificación.",
      icon: data.icon || "/favicon.ico",
      badge: data.badge || "/favicon.ico",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("🎹 La Liga del Pianista", {
        body: text,
        icon: "/favicon.ico",
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
