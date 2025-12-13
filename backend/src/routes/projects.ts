import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { createNotionProject } from '../services/notion';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    type: z.enum(['BRANDING', 'WEB_DESIGN', 'ADVERTISING_CAMPAIGN', 'VIDEO_PRODUCTION', 'PACKAGING', 'SOCIAL_MEDIA', 'OTHER']),
    clientId: z.string().min(1, 'Cliente es requerido'),
    assignedToId: z.string().optional(),
});

const updateProjectSchema = z.object({
    name: z.string().min(2).optional(),
    status: z.enum(['BRIEF_PENDING', 'BRIEF_IN_REVIEW', 'BRIEF_APPROVED', 'IN_PRODUCTION', 'IN_REVIEW', 'DELIVERED', 'COMPLETED']).optional(),
    assignedToId: z.string().nullable().optional(),
});

// Get all projects for agency
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { status, type, clientId, page = '1', limit = '10' } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = { agencyId: req.user!.agencyId };

        // For clients, only show their projects
        if (req.user!.role === 'CLIENT') {
            where.client = { email: req.user!.email };
        }

        if (status) where.status = status;
        if (type) where.type = type;
        if (clientId) where.clientId = clientId;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                include: {
                    client: { select: { id: true, name: true, company: true, email: true } },
                    assignedTo: { select: { id: true, name: true, email: true } },
                    brief: { select: { id: true, completedAt: true } },
                    _count: { select: { messages: true, files: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit as string),
            }),
            prisma.project.count({ where })
        ]);

        res.json({
            projects,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
});

// Get single project
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.id,
                agencyId: req.user!.agencyId
            },
            include: {
                client: true,
                assignedTo: { select: { id: true, name: true, email: true } },
                brief: true,
                messages: {
                    include: { sender: { select: { id: true, name: true, role: true } } },
                    orderBy: { createdAt: 'asc' }
                },
                files: { orderBy: { uploadedAt: 'desc' } }
            }
        });

        if (!project) {
            res.status(404).json({ error: 'Proyecto no encontrado' });
            return;
        }

        // Check if client can access this project
        if (req.user!.role === 'CLIENT') {
            const client = await prisma.client.findFirst({
                where: { email: req.user!.email, agencyId: req.user!.agencyId }
            });
            if (!client || project.clientId !== client.id) {
                res.status(403).json({ error: 'No tienes acceso a este proyecto' });
                return;
            }
        }

        res.json(project);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Error al obtener proyecto' });
    }
});

// Create project
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Los clientes no pueden crear proyectos' });
            return;
        }

        const validatedData = createProjectSchema.parse(req.body);

        // Verify client belongs to agency
        const client = await prisma.client.findFirst({
            where: { id: validatedData.clientId, agencyId: req.user!.agencyId }
        });

        if (!client) {
            res.status(400).json({ error: 'Cliente no encontrado' });
            return;
        }

        // Create project with brief
        const project = await prisma.$transaction(async (tx) => {
            const newProject = await tx.project.create({
                data: {
                    name: validatedData.name,
                    type: validatedData.type,
                    agencyId: req.user!.agencyId,
                    clientId: validatedData.clientId,
                    assignedToId: validatedData.assignedToId || null,
                },
                include: {
                    client: { select: { id: true, name: true, company: true } },
                    assignedTo: { select: { id: true, name: true, email: true } }
                }
            });

            // Create empty brief for the project
            await tx.brief.create({
                data: {
                    projectId: newProject.id,
                    agencyId: req.user!.agencyId,
                }
            });

            // Create notification for client
            await tx.notification.create({
                data: {
                    type: 'NEW_PROJECT',
                    title: 'Nuevo proyecto asignado',
                    message: `Se te ha asignado el proyecto "${newProject.name}". Por favor completa el brief.`,
                    userId: client.id,
                    agencyId: req.user!.agencyId,
                    projectId: newProject.id,
                }
            });

            // Notion Integration
            try {
                // Call Notion service (fire and forget for now, or await if we want strict sync)
                // We'll run this AFTER transaction to not block UI, but update the record
                createNotionProject({
                    name: newProject.name,
                    status: newProject.status,
                    clientName: client.name,
                    type: newProject.type
                }).then(async (notionUrl) => {
                    if (notionUrl) {
                        await prisma.project.update({
                            where: { id: newProject.id },
                            data: { notionUrl }
                        });
                        console.log('🔗 Notion linked:', notionUrl);
                    }
                });
            } catch (err) {
                console.error('Notion sync failed', err);
            }

            return newProject;
        });

        res.status(201).json(project);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Error al crear proyecto' });
    }
});

// Update project
router.patch('/:id', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Los clientes no pueden modificar proyectos' });
            return;
        }

        const validatedData = updateProjectSchema.parse(req.body);

        const project = await prisma.project.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId }
        });

        if (!project) {
            res.status(404).json({ error: 'Proyecto no encontrado' });
            return;
        }

        const updated = await prisma.project.update({
            where: { id: req.params.id },
            data: validatedData,
            include: {
                client: { select: { id: true, name: true, company: true } },
                assignedTo: { select: { id: true, name: true, email: true } }
            }
        });

        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Error al actualizar proyecto' });
    }
});

// Delete project
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role !== 'AGENCY_ADMIN') {
            res.status(403).json({ error: 'Solo administradores pueden eliminar proyectos' });
            return;
        }

        const project = await prisma.project.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId }
        });

        if (!project) {
            res.status(404).json({ error: 'Proyecto no encontrado' });
            return;
        }

        await prisma.project.delete({ where: { id: req.params.id } });

        res.json({ message: 'Proyecto eliminado exitosamente' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Error al eliminar proyecto' });
    }
});

export default router;
