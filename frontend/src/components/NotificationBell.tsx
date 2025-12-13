import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    projectId?: string;
    createdAt: string;
}

const SOCKET_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://brieflow.onrender.com';

function formatTimeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
}

function getNotificationIcon(type: string) {
    switch (type) {
        case 'BRIEF_COMPLETED': return '✅';
        case 'NEW_MESSAGE': return '💬';
        case 'BRIEF_APPROVED': return '🎉';
        case 'CHANGES_REQUESTED': return '🔄';
        case 'STATUS_CHANGED': return '📊';
        default: return '🔔';
    }
}

export function NotificationBell() {
    const { user, token } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Setup socket connection
    useEffect(() => {
        if (!token || !user?.id) return;

        const socket = io(SOCKET_URL, {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log('🔔 Notification socket connected');
            socket.emit('join', `user_${user.id}`);
        });

        socket.on('new_notification', (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Browser notification if permitted
            if (Notification.permission === 'granted') {
                new window.Notification(notification.title, {
                    body: notification.message,
                    icon: '/logo.png'
                });
            }
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [token, user?.id]);

    // Fetch on mount
    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [user?.id]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.projectId) {
            window.location.href = `/projects/${notification.projectId}`;
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[500px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
                        <h3 className="font-bold text-gray-900">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" />
                                Marcar todas
                            </button>
                        )}
                    </div>

                    {/* Lista */}
                    <div className="overflow-y-auto flex-1 max-h-[350px]">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No tienes notificaciones</p>
                                <p className="text-sm mt-1">Te avisaremos cuando haya novedades</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <span className="text-xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    window.location.href = '/notifications';
                                    setIsOpen(false);
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-800 block text-center w-full font-medium"
                            >
                                Ver todas las notificaciones →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
