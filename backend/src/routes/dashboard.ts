import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard metrics
router.get('/metrics', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            // Client metrics
            const client = await prisma.client.findFirst({
                where: { email: req.user!.email, agencyId: req.user!.agencyId }
            });

            if (!client) {
                res.status(404).json({ error: 'Cliente no encontrado' });
                return;
            }

            const [activeProjects, pendingBriefs, completedProjects] = await Promise.all([
                prisma.project.count({
                    where: {
                        clientId: client.id,
                        status: { in: ['IN_PRODUCTION', 'IN_REVIEW', 'BRIEF_IN_REVIEW'] }
                    }
                }),
                prisma.project.count({
                    where: {
                        clientId: client.id,
                        status: 'BRIEF_PENDING'
                    }
                }),
                prisma.project.count({
                    where: {
                        clientId: client.id,
                        status: 'COMPLETED'
                    }
                })
            ]);

            res.json({
                activeProjects,
                pendingBriefs,
                completedProjects,
                isClient: true
            });
            return;
        }

        // Agency metrics
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [activeProjects, pendingBriefs, totalClients, completedThisMonth, recentProjects] = await Promise.all([
            prisma.project.count({
                where: {
                    agencyId: req.user!.agencyId,
                    status: { in: ['IN_PRODUCTION', 'IN_REVIEW'] }
                }
            }),
            prisma.project.count({
                where: {
                    agencyId: req.user!.agencyId,
                    status: 'BRIEF_PENDING'
                }
            }),
            prisma.client.count({
                where: { agencyId: req.user!.agencyId }
            }),
            prisma.project.count({
                where: {
                    agencyId: req.user!.agencyId,
                    status: 'COMPLETED',
                    updatedAt: { gte: startOfMonth }
                }
            }),
            prisma.project.findMany({
                where: { agencyId: req.user!.agencyId },
                include: {
                    client: { select: { id: true, name: true, company: true } },
                    assignedTo: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);

        res.json({
            activeProjects,
            pendingBriefs,
            totalClients,
            completedThisMonth,
            recentProjects,
            isClient: false
        });
    } catch (error) {
        console.error('Get metrics error:', error);
        res.status(500).json({ error: 'Error al obtener métricas' });
    }
});

// Get project status distribution
router.get('/status-distribution', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Acceso denegado' });
            return;
        }

        const statuses = ['BRIEF_PENDING', 'BRIEF_IN_REVIEW', 'BRIEF_APPROVED', 'IN_PRODUCTION', 'IN_REVIEW', 'DELIVERED', 'COMPLETED'];

        const distribution = await Promise.all(
            statuses.map(async (status) => ({
                status,
                count: await prisma.project.count({
                    where: { agencyId: req.user!.agencyId, status }
                })
            }))
        );

        res.json(distribution);
    } catch (error) {
        console.error('Get status distribution error:', error);
        res.status(500).json({ error: 'Error al obtener distribución' });
    }
});

export default router;
