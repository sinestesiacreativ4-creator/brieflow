import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const inviteMemberSchema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    role: z.enum(['AGENCY_ADMIN', 'AGENCY_MEMBER']),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const updateMemberSchema = z.object({
    name: z.string().min(2).optional(),
    role: z.enum(['AGENCY_ADMIN', 'AGENCY_MEMBER']).optional(),
});

// Get team members
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Acceso denegado' });
            return;
        }

        const members = await prisma.user.findMany({
            where: { agencyId: req.user!.agencyId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                _count: { select: { projects: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(members);
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ error: 'Error al obtener equipo' });
    }
});

// Invite team member
router.post('/invite', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role !== 'AGENCY_ADMIN') {
            res.status(403).json({ error: 'Solo administradores pueden invitar miembros' });
            return;
        }

        const validatedData = inviteMemberSchema.parse(req.body);

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            res.status(400).json({ error: 'Este email ya está registrado' });
            return;
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const member = await prisma.user.create({
            data: {
                email: validatedData.email,
                name: validatedData.name,
                password: hashedPassword,
                role: validatedData.role,
                agencyId: req.user!.agencyId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        res.status(201).json(member);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Invite member error:', error);
        res.status(500).json({ error: 'Error al invitar miembro' });
    }
});

// Update team member
router.patch('/:id', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role !== 'AGENCY_ADMIN') {
            res.status(403).json({ error: 'Solo administradores pueden modificar miembros' });
            return;
        }

        const validatedData = updateMemberSchema.parse(req.body);

        const member = await prisma.user.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId }
        });

        if (!member) {
            res.status(404).json({ error: 'Miembro no encontrado' });
            return;
        }

        // Cannot change your own role
        if (member.id === req.user!.id && validatedData.role) {
            res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
            return;
        }

        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: validatedData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Update member error:', error);
        res.status(500).json({ error: 'Error al actualizar miembro' });
    }
});

// Remove team member
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role !== 'AGENCY_ADMIN') {
            res.status(403).json({ error: 'Solo administradores pueden eliminar miembros' });
            return;
        }

        const member = await prisma.user.findFirst({
            where: { id: req.params.id, agencyId: req.user!.agencyId }
        });

        if (!member) {
            res.status(404).json({ error: 'Miembro no encontrado' });
            return;
        }

        // Cannot delete yourself
        if (member.id === req.user!.id) {
            res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
            return;
        }

        await prisma.user.delete({ where: { id: req.params.id } });

        res.json({ message: 'Miembro eliminado exitosamente' });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ error: 'Error al eliminar miembro' });
    }
});

export default router;
