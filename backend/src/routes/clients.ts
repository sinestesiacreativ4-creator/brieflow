import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createClientSchema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    company: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});

const updateClientSchema = z.object({
    name: z.string().min(2).optional(),
    company: z.string().optional(),
    phone: z.string().optional(),
});

// Get all clients
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Acceso denegado' });
            return;
        }

        const { search, page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = { agencyId: req.user!.agencyId };

        if (search) {
            where.OR = [
                { name: { contains: search as string } },
                { email: { contains: search as string } },
                { company: { contains: search as string } },
            ];
        }

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                include: {
                    _count: { select: { projects: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit as string),
            }),
            prisma.client.count({ where })
        ]);

        res.json({
            clients,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// Get single client
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Acceso denegado' });
            return;
        }

        const client = await prisma.client.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId },
            include: {
                projects: {
                    include: { brief: { select: { id: true, completedAt: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!client) {
            res.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }

        res.json(client);
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
});

// Create/Invite client
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Los clientes no pueden invitar a otros clientes' });
            return;
        }

        const validatedData = createClientSchema.parse(req.body);

        // Check if client already exists for this agency
        const existingClient = await prisma.client.findFirst({
            where: { email: validatedData.email, agencyId: req.user!.agencyId }
        });

        if (existingClient) {
            res.status(400).json({ error: 'Ya existe un cliente con este email' });
            return;
        }

        // Hash password if provided
        let hashedPassword = null;
        if (validatedData.password) {
            hashedPassword = await bcrypt.hash(validatedData.password, 10);
        }

        const client = await prisma.client.create({
            data: {
                email: validatedData.email,
                name: validatedData.name,
                company: validatedData.company,
                phone: validatedData.phone,
                password: hashedPassword,
                agencyId: req.user!.agencyId,
            }
        });

        res.status(201).json({
            ...client,
            password: undefined
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Create client error:', error);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});

// Update client
router.patch('/:id', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Acceso denegado' });
            return;
        }

        const validatedData = updateClientSchema.parse(req.body);

        const client = await prisma.client.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId }
        });

        if (!client) {
            res.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }

        const updated = await prisma.client.update({
            where: { id: req.params.id },
            data: validatedData
        });

        res.json({
            ...updated,
            password: undefined
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Update client error:', error);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});

// Delete client
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role !== 'AGENCY_ADMIN') {
            res.status(403).json({ error: 'Solo administradores pueden eliminar clientes' });
            return;
        }

        const client = await prisma.client.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId }
        });

        if (!client) {
            res.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }

        await prisma.client.delete({ where: { id: req.params.id } });

        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

export default router;
