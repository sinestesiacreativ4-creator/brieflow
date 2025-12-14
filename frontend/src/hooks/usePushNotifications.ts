import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

const VAPID_PUBLIC_KEY = 'BCYxdq1SfQ80HIzkKNBPjRdy3eomYuskIuOGVKVLIXRmzGlnBH921b5vBAHndKlxbXb6buHO0BdCZFOmpA8g_W4';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const { user } = useAuthStore();
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    // Initialize service worker and check existing subscription
    useEffect(() => {
        const init = async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('[Push] Service Worker or PushManager not supported');
                return;
            }

            // Check current permission
            if ('Notification' in window) {
                setPermission(Notification.permission);
            }

            try {
                // Unregister old SW and register fresh one
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                    if (reg.active?.scriptURL.includes('sw.js')) {
                        await reg.update();
                    }
                }

                // Register service worker
                const reg = await navigator.serviceWorker.register('/sw.js', {
                    updateViaCache: 'none'
                });
                console.log('[Push] Service Worker registered:', reg.scope);
                setRegistration(reg);

                // Wait for SW to be ready
                await navigator.serviceWorker.ready;

                // Check for existing subscription
                const existingSub = await reg.pushManager.getSubscription();
                if (existingSub) {
                    console.log('[Push] Existing subscription found');
                    setSubscription(existingSub);
                    // Re-sync with backend
                    await sendSubscriptionToBackend(existingSub);
                }
            } catch (error) {
                console.error('[Push] Initialization error:', error);
            }
        };

        init();
    }, []);

    const sendSubscriptionToBackend = async (sub: PushSubscription) => {
        try {
            const subJson = sub.toJSON();
            console.log('[Push] Sending subscription to backend:', subJson.endpoint?.slice(0, 50));
            await api.post('/notifications/subscribe', {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: subJson.keys?.p256dh,
                    auth: subJson.keys?.auth
                }
            });
            console.log('[Push] Subscription saved successfully');
        } catch (error) {
            console.error('[Push] Failed to send subscription to backend:', error);
            throw error;
        }
    };

    const subscribe = useCallback(async () => {
        if (!('serviceWorker' in navigator)) {
            console.error('[Push] Service Worker not supported');
            return false;
        }

        try {
            // Request permission first
            console.log('[Push] Requesting notification permission...');
            const perm = await Notification.requestPermission();
            setPermission(perm);
            console.log('[Push] Permission result:', perm);

            if (perm !== 'granted') {
                console.warn('[Push] Permission denied');
                return false;
            }

            // Get or wait for registration
            const reg = registration || await navigator.serviceWorker.ready;

            // Unsubscribe from old subscription if exists
            const oldSub = await reg.pushManager.getSubscription();
            if (oldSub) {
                console.log('[Push] Unsubscribing from old subscription');
                await oldSub.unsubscribe();
            }

            // Create new subscription
            console.log('[Push] Creating new subscription...');
            const newSub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log('[Push] New subscription created:', newSub.endpoint.slice(0, 50));
            setSubscription(newSub);

            // Send to backend
            await sendSubscriptionToBackend(newSub);

            return true;
        } catch (error) {
            console.error('[Push] Subscribe error:', error);
            throw error;
        }
    }, [registration]);

    const sendTestNotification = useCallback(async () => {
        if (!user?.id) {
            throw new Error('Usuario no identificado');
        }

        console.log('[Push] Sending test notification for user:', user.id);

        try {
            // Use the authenticated test route
            const response = await api.post('/notifications/test');
            console.log('[Push] Test notification response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('[Push] Test notification error:', error);
            throw error;
        }
    }, [user?.id]);

    return {
        subscribe,
        sendTestNotification,
        permission,
        isSubscribed: !!subscription,
        isSupported: 'serviceWorker' in navigator && 'PushManager' in window
    };
}
