// BriefFlow Service Worker - Push Notifications
const CACHE_NAME = 'briefflow-v1';

// Handle Push Events
self.addEventListener('push', function (event) {
    console.log('[SW] Push received:', event);

    let data = {
        title: 'BriefFlow',
        body: 'Nueva notificación',
        icon: '/logo.png',
        badge: '/logo.png',
        url: '/dashboard'
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            console.error('[SW] Error parsing push data:', e);
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/logo.png',
        badge: data.badge || '/logo.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: data.tag || 'briefflow-notification',
        renotify: true,
        requireInteraction: true,
        data: {
            url: data.url || '/dashboard',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Ver ahora',
                icon: '/logo.png'
            },
            {
                action: 'dismiss',
                title: 'Cerrar'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle Notification Click
self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification clicked:', event.action);
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // Try to focus an existing window
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        client.navigate(urlToOpen);
                        return;
                    }
                }
                // Open a new window if none found
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle Notification Close
self.addEventListener('notificationclose', function (event) {
    console.log('[SW] Notification closed');
});

// Install event
self.addEventListener('install', function (event) {
    console.log('[SW] Installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function (event) {
    console.log('[SW] Activating...');
    event.waitUntil(clients.claim());
});

// Message handler for debugging
self.addEventListener('message', function (event) {
    console.log('[SW] Message received:', event.data);
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
