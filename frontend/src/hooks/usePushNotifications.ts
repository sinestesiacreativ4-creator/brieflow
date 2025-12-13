import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

const VAPID_PUBLIC_KEY = 'BCYxdq1SfQ80HIzkKNBPjRdy3eomYuskIuOGVKVLIXRmzGlnBH921b5vBAHndKlxbXb6buHO0BdCZFOmpA8g_W4';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
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
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            // Register SW if not already
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                    return registration.pushManager.getSubscription();
                })
                .then(sub => {
                    setSubscription(sub);
                    if (sub) {
                        // Ensure backend has it (optional: implement check)
                        sendSubscriptionToBackend(sub);
                    }
                })
                .catch(err => console.error('SW Error:', err));
        }
    }, []);

    const subscribe = async () => {
        if (!('serviceWorker' in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;

            // Ask for permission
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm === 'granted') {
                const sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });

                setSubscription(sub);
                await sendSubscriptionToBackend(sub);
                alert('¡Notificaciones activadas en este dispositivo!');
            }
        } catch (error) {
            console.error('Error subscribing to push:', error);
            alert('Error al activar notificaciones. Verifica la configuración.');
        }
    };

    const sendSubscriptionToBackend = async (sub: PushSubscription) => {
        try {
            await api.post('/notifications/subscribe', sub);
        } catch (error) {
            console.error('Failed to send subscription to backend:', error);
        }
    };

    const sendTestNotification = async () => {
        if (!user?.id) {
            alert('Error: Usuario no identificado');
            return;
        }
        try {
            console.log('Enviando test directo para:', user.id);
            await api.post('/test-push-direct', { userId: user.id });
            alert('Solicitud enviada. Espera la notificación...');
        } catch (error: any) {
            console.error('Failed to send test notification:', error);
            alert(`Error al probar: ${error.response?.status} ${error.response?.statusText || ''}`);
        }
    };

    return {
        subscribe,
        sendTestNotification,
        permission,
        isSubscribed: !!subscription
    };
}
