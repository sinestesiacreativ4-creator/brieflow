import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { pushService } from '../services/pushNotification';

const router = express.Router();

// Get notification history (existing functionality placeholder)
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Mark as read
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

export default router;
