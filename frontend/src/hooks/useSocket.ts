import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const SOCKET_URL = isProduction ? 'https://brieflow.onrender.com' : 'http://localhost:3001';

interface Message {
    id: string;
    content: string;
    projectId: string;
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        role: string;
    };
}

interface TypingUser {
    userId: string;
    userName: string;
    isTyping: boolean;
}

export function useSocket(projectId?: string) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

    // Initialize socket connection
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('🔌 Socket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setIsConnected(false);
        });

        // Message handlers
        socket.on('receive-message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        // Typing indicator
        socket.on('user-typing', (data: TypingUser) => {
            setTypingUsers(prev => {
                if (data.isTyping) {
                    // Add user if not already in list
                    if (!prev.find(u => u.userId === data.userId)) {
                        return [...prev, data];
                    }
                    return prev;
                } else {
                    // Remove user from typing list
                    return prev.filter(u => u.userId !== data.userId);
                }
            });
        });

        // Error handler
        socket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error.message);
        });

        // Notification handler
        socket.on('notification', (notification: any) => {
            console.log('New notification:', notification);
            // Can trigger a toast or update notification count here
        });

        // Project updates handler
        socket.on('project-updated', (data: any) => {
            console.log('Project updated:', data);
            setLastProjectUpdate(Date.now());
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const [lastProjectUpdate, setLastProjectUpdate] = useState<number>(0);

    // Join/leave project room
    useEffect(() => {
        const socket = socketRef.current;

        if (!socket || !isConnected || !projectId) return;

        socket.emit('join-project', projectId);

        return () => {
            socket.emit('leave-project', projectId);
        };
    }, [projectId, isConnected]);

    // Send message function
    const sendMessage = useCallback((content: string) => {
        const socket = socketRef.current;

        if (!socket || !isConnected || !projectId) {
            console.error('Cannot send message: not connected');
            return false;
        }

        socket.emit('send-message', { projectId, content });
        return true;
    }, [projectId, isConnected]);

    // Update project status
    const updateStatus = useCallback((status: string) => {
        const socket = socketRef.current;
        if (socket && isConnected && projectId) {
            socket.emit('update-project-status', { projectId, status });
        }
    }, [projectId, isConnected]);

    // Typing indicator function
    const setTyping = useCallback((isTyping: boolean) => {
        const socket = socketRef.current;

        if (!socket || !isConnected || !projectId) return;

        socket.emit('typing', { projectId, isTyping });
    }, [projectId, isConnected]);

    // Clear messages (when switching projects)
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        isConnected,
        messages,
        typingUsers,
        sendMessage,
        setTyping,
        clearMessages,
        setMessages,
        updateStatus,
        lastProjectUpdate
    };
}

export default useSocket;
