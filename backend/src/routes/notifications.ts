import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { pushService } from '../services/pushNotification';

const router = express.Router();

// Get all notifications with unread count
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        const unreadCount = await prisma.notification.count({
            where: { userId: req.user.id, read: false }
        });

        res.json({
            notifications,
            unreadCount,
            total: notifications.length
        });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Get unread count only
router.get('/unread-count', authenticateToken, async (req: any, res) => {
    try {
        const unreadCount = await prisma.notification.count({
            where: { userId: req.user.id, read: false }
        });
        res.json({ unreadCount });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching unread count' });
    }
});

// Mark single notification as read (PATCH)
router.patch('/:id/read', authenticateToken, async (req: any, res) => {
    try {
        await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error marking notification as read' });
    }
});

// Mark single notification as read (PUT - legacy support)
router.put('/:id/read', authenticateToken, async (req: any, res) => {
    try {
        await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error marking notification as read' });
    }
});

// Mark ALL notifications as read
router.post('/mark-all-read', authenticateToken, async (req: any, res) => {
    try {
        const result = await prisma.notification.updateMany({
            where: { userId: req.user.id, read: false },
            data: { read: true },
        });
        res.json({ success: true, markedCount: result.count });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Error marking all as read' });
    }
});

// --- PUSH NOTIFICATION ROUTES ---

// Get VAPID Public Key
router.get('/vapid-key', (req, res) => {
    res.json({ publicKey: pushService.getPublicKey() });
});

// Subscribe to Push Notifications
router.post('/subscribe', authenticateToken, async (req: any, res) => {
    try {
        const subscription = req.body;
        await pushService.saveSubscription(req.user.id, subscription);
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ error: 'Error saving subscription' });
    }
});

// Test Push Notification (Self)
router.post('/test', authenticateToken, async (req: any, res) => {
    try {
        await pushService.sendNotification(req.user.id, {
            title: 'Prueba de Notificación 🔔',
            body: '¡El sistema de notificaciones funciona correctamente! 🚀',
            url: '/dashboard'
        });
        res.json({ success: true, message: 'Notificación enviada' });
    } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({ error: 'Error enviando prueba' });
    }
});

export default router;
