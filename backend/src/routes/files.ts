import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'video/mp4', 'video/mpeg'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});

// Get files for a project
router.get('/project/:projectId', async (req: AuthRequest, res: Response) => {
    try {
        const project = await prisma.project.findFirst({
            where: { id: req.params.projectId, agencyId: req.user!.agencyId }
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
                res.status(403).json({ error: 'No tienes acceso a estos archivos' });
                return;
            }
        }

        const files = await prisma.projectFile.findMany({
            where: { projectId: req.params.projectId },
            orderBy: { uploadedAt: 'desc' }
        });

        res.json(files);
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ error: 'Error al obtener archivos' });
    }
});

// Upload file to project
router.post('/project/:projectId', upload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        const project = await prisma.project.findFirst({
            where: { id: req.params.projectId, agencyId: req.user!.agencyId }
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
                res.status(403).json({ error: 'No tienes acceso a este proyecto' });
                return;
            }
        }

        if (!req.file) {
            res.status(400).json({ error: 'No se proporcionó ningún archivo' });
            return;
        }

        const file = await prisma.projectFile.create({
            data: {
                name: req.file.originalname,
                url: `/uploads/${req.file.filename}`,
                size: req.file.size,
                mimeType: req.file.mimetype,
                projectId: req.params.projectId
            }
        });

        // Create notification
        await prisma.notification.create({
            data: {
                type: 'FILE_UPLOADED',
                title: 'Nuevo archivo',
                message: `Se ha subido "${req.file.originalname}" al proyecto "${project.name}"`,
                userId: req.user!.id,
                agencyId: req.user!.agencyId,
                projectId: req.params.projectId,
            }
        });

        res.status(201).json(file);
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({ error: 'Error al subir archivo' });
    }
});

// Delete file
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const file = await prisma.projectFile.findFirst({
            where: { id: req.params.id },
            include: { project: true }
        });

        if (!file) {
            res.status(404).json({ error: 'Archivo no encontrado' });
            return;
        }

        if (file.project.agencyId !== req.user!.agencyId) {
            res.status(403).json({ error: 'No tienes acceso a este archivo' });
            return;
        }

        // Delete physical file
        const filePath = path.join(process.cwd(), file.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.projectFile.delete({ where: { id: req.params.id } });

        res.json({ message: 'Archivo eliminado exitosamente' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Error al eliminar archivo' });
    }
});

export default router;
