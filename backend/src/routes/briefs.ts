import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schema for brief updates
const updateBriefSchema = z.object({
    projectName: z.string().optional(),
    projectGoals: z.string().optional(),
    targetAudience: z.string().optional(),
    audienceAge: z.string().optional(),
    audienceGender: z.string().optional(),
    audienceLocation: z.string().optional(),
    keyMessage: z.string().optional(),
    communicationTone: z.string().optional(),
    competitors: z.string().optional(),
    brandGuidelines: z.string().optional(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    deliverables: z.string().optional(),
    additionalNotes: z.string().optional(),
});

// Get brief by project ID
router.get('/project/:projectId', async (req: AuthRequest, res: Response) => {
    try {
        const project = await prisma.project.findFirst({
            where: { id: req.params.projectId, agencyId: req.user!.agencyId },
            include: { brief: true, client: true }
        });

        if (!project) {
            res.status(404).json({ error: 'Proyecto no encontrado' });
            return;
        }

        // Check access for clients
        if (req.user!.role === 'CLIENT') {
            const client = await prisma.client.findFirst({
                where: { email: req.user!.email, agencyId: req.user!.agencyId }
            });
            if (!client || project.clientId !== client.id) {
                res.status(403).json({ error: 'No tienes acceso a este brief' });
                return;
            }
        }

        if (!project.brief) {
            res.status(404).json({ error: 'Brief no encontrado' });
            return;
        }

        res.json(project.brief);
    } catch (error) {
        console.error('Get brief error:', error);
        res.status(500).json({ error: 'Error al obtener brief' });
    }
});

// Update brief (client completing the brief)
router.patch('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = updateBriefSchema.parse(req.body);

        const brief = await prisma.brief.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId },
            include: { project: true }
        });

        if (!brief) {
            res.status(404).json({ error: 'Brief no encontrado' });
            return;
        }

        // Check access for clients
        if (req.user!.role === 'CLIENT') {
            const client = await prisma.client.findFirst({
                where: { email: req.user!.email, agencyId: req.user!.agencyId }
            });
            if (!client || brief.project.clientId !== client.id) {
                res.status(403).json({ error: 'No tienes acceso a este brief' });
                return;
            }
        }

        const updated = await prisma.brief.update({
            where: { id: req.params.id },
            data: validatedData
        });

        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Update brief error:', error);
        res.status(500).json({ error: 'Error al actualizar brief' });
    }
});

// Submit brief (mark as completed)
router.post('/:id/submit', async (req: AuthRequest, res: Response) => {
    try {
        const brief = await prisma.brief.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId },
            include: { project: { include: { client: true } } }
        });

        if (!brief) {
            res.status(404).json({ error: 'Brief no encontrado' });
            return;
        }

        // Check access for clients
        if (req.user!.role === 'CLIENT') {
            const client = await prisma.client.findFirst({
                where: { email: req.user!.email, agencyId: req.user!.agencyId }
            });
            if (!client || brief.project.clientId !== client.id) {
                res.status(403).json({ error: 'No tienes acceso a este brief' });
                return;
            }
        }

        // Update brief and project status
        const [updatedBrief] = await prisma.$transaction([
            prisma.brief.update({
                where: { id: req.params.id },
                data: { completedAt: new Date() }
            }),
            prisma.project.update({
                where: { id: brief.projectId },
                data: { status: 'BRIEF_IN_REVIEW' }
            }),
            // Create notification for agency
            prisma.notification.create({
                data: {
                    type: 'BRIEF_COMPLETED',
                    title: 'Brief completado',
                    message: `${brief.project.client.name} ha completado el brief para "${brief.project.name}"`,
                    userId: req.user!.id,
                    agencyId: req.user!.agencyId,
                    projectId: brief.projectId,
                }
            })
        ]);

        res.json({
            message: 'Brief enviado exitosamente',
            brief: updatedBrief
        });
    } catch (error) {
        console.error('Submit brief error:', error);
        res.status(500).json({ error: 'Error al enviar brief' });
    }
});

// Approve brief (agency action)
router.post('/:id/approve', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Solo la agencia puede aprobar briefs' });
            return;
        }

        const brief = await prisma.brief.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId },
            include: { project: { include: { client: true } } }
        });

        if (!brief) {
            res.status(404).json({ error: 'Brief no encontrado' });
            return;
        }

        // Update project status
        await prisma.project.update({
            where: { id: brief.projectId },
            data: { status: 'BRIEF_APPROVED' }
        });

        // Notify client
        await prisma.notification.create({
            data: {
                type: 'BRIEF_APPROVED',
                title: 'Brief aprobado',
                message: `Tu brief para "${brief.project.name}" ha sido aprobado. El proyecto está ahora en producción.`,
                userId: brief.project.client.id,
                agencyId: req.user!.agencyId,
                projectId: brief.projectId,
            }
        });

        res.json({ message: 'Brief aprobado exitosamente' });
    } catch (error) {
        console.error('Approve brief error:', error);
        res.status(500).json({ error: 'Error al aprobar brief' });
    }
});

// Request changes (agency action)
router.post('/:id/request-changes', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Solo la agencia puede solicitar cambios' });
            return;
        }

        const { message } = req.body;

        const brief = await prisma.brief.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId },
            include: { project: { include: { client: true } } }
        });

        if (!brief) {
            res.status(404).json({ error: 'Brief no encontrado' });
            return;
        }

        // Update project status
        await prisma.$transaction([
            prisma.project.update({
                where: { id: brief.projectId },
                data: { status: 'BRIEF_PENDING' }
            }),
            prisma.brief.update({
                where: { id: req.params.id },
                data: { completedAt: null }
            }),
            prisma.notification.create({
                data: {
                    type: 'CHANGES_REQUESTED',
                    title: 'Cambios solicitados',
                    message: message || `Se han solicitado cambios en el brief para "${brief.project.name}"`,
                    userId: brief.project.client.id,
                    agencyId: req.user!.agencyId,
                    projectId: brief.projectId,
                }
            })
        ]);

        res.json({ message: 'Se han solicitado cambios en el brief' });
    } catch (error) {
        console.error('Request changes error:', error);
        res.status(500).json({ error: 'Error al solicitar cambios' });
    }
});

export default router;
