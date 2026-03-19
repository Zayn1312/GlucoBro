const CACHE_NAME = 'glucobro-v5';
const APP_SHELL = [
  'GlucoBro.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4'
];

// Install: cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for app shell, network-first for rest
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Skip caching for API calls
  if (url.pathname.startsWith('/api/')) return;
  const isAppShell = APP_SHELL.some(item => url.href.includes(item) || url.pathname.endsWith(item));

  if (isAppShell) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return resp;
      }))
    );
  } else {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match(e.request))
    );
  }
});

// Web Push: incoming push notification from server
self.addEventListener('push', e => {
  let data = { title: 'GlucoBro', body: 'Neuer Blutzucker-Alert' };
  try { data = e.data.json(); } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title || 'GlucoBro', {
      body: data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: 'glucobro-cgm-alert',
      vibrate: [200, 100, 200, 100, 200],
      data: { url: data.url || '/GlucoBro.html' },
      requireInteraction: true
    })
  );
});

// Notification click: open/focus app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || 'GlucoBro.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes('GlucoBro') && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// Message handler: scheduled notifications via SW timers
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body, tag } = e.data;
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(title || 'GlucoBro', {
          body: body || 'Zeit zum Messen! Trag deinen Blutzucker ein.',
          icon: 'icon-192.png',
          badge: 'icon-192.png',
          tag: tag || 'glucobro-reminder',
          vibrate: [100, 50, 100],
          data: { url: 'GlucoBro.html#add' }
        });
      }, delay);
    }
  }
});
