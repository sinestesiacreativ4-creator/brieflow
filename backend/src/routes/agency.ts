import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const updateAgencySchema = z.object({
    name: z.string().min(2).optional(),
    logo: z.string().optional(),
    primaryColor: z.string().optional(),
});

// Get agency info
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const agency = await prisma.agency.findUnique({
            where: { id: req.user!.agencyId },
            include: {
                _count: {
                    select: { users: true, clients: true, projects: true }
                }
            }
        });

        if (!agency) {
            res.status(404).json({ error: 'Agencia no encontrada' });
            return;
        }

        res.json(agency);
    } catch (error) {
        console.error('Get agency error:', error);
        res.status(500).json({ error: 'Error al obtener agencia' });
    }
});

// Update agency
router.patch('/', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role !== 'AGENCY_ADMIN') {
            res.status(403).json({ error: 'Solo administradores pueden modificar la agencia' });
            return;
        }

        const validatedData = updateAgencySchema.parse(req.body);

        const agency = await prisma.agency.update({
            where: { id: req.user!.agencyId },
            data: validatedData
        });

        res.json(agency);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Update agency error:', error);
        res.status(500).json({ error: 'Error al actualizar agencia' });
    }
});

export default router;
