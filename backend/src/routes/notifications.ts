import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get notifications
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { unreadOnly = 'false', limit = '20' } = req.query;

        const where: any = { agencyId: req.user!.agencyId };

        if (unreadOnly === 'true') {
            where.read = false;
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string)
        });

        const unreadCount = await prisma.notification.count({
            where: { agencyId: req.user!.agencyId, read: false }
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
});

// Mark notification as read
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
    try {
        const notification = await prisma.notification.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId }
        });

        if (!notification) {
            res.status(404).json({ error: 'Notificación no encontrada' });
            return;
        }

        await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true }
        });

        res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Error al actualizar notificación' });
    }
});

// Mark all as read
router.post('/read-all', async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { agencyId: req.user!.agencyId, read: false },
            data: { read: true }
        });

        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Error al actualizar notificaciones' });
    }
});

export default router;
