import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth';

const SOCKET_URL = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function useGlobalNotifications() {
    const { token, user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!token || !user) return;

        // Request permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        const socket = socketRef.current;

        socket.on('notification', (data: { title: string; body: string; url?: string }) => {
            console.log('🔔 Notification received:', data);

            // Show system notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
                const notif = new Notification(data.title, {
                    body: data.body,
                    icon: '/logo.png', // Uses PWA logo
                    badge: '/logo.png'
                });

                notif.onclick = () => {
                    window.focus();
                    if (data.url) {
                        window.location.href = data.url;
                    }
                    notif.close();
                };
            }

            // Optionally play a sound
            // const audio = new Audio('/notification.mp3');
            // audio.play().catch(e => console.log('Audio play failed', e));
        });

        return () => {
            socket.disconnect();
        };
    }, [token, user]);
}
