import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf',
        'video/mp4', 'video/quicktime', 'video/webm'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo imágenes, videos y PDF.'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    },
    fileFilter: fileFilter
});

// Upload endpoint
router.post('/:projectId', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No se subió ningún archivo' });
            return;
        }

        const { projectId } = req.params;
        const agencyId = req.user!.agencyId;

        // Security Check: Verify project belongs to user's agency
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                agencyId: agencyId // <--- CRITICAL SECURITY CHECK
            }
        });

        if (!project) {
            // Delete the uploaded file if project validation fails
            fs.unlinkSync(req.file.path);
            res.status(404).json({ error: 'Proyecto no encontrado o sin acceso' });
            return;
        }

        // Save file reference to database
        const fileUrl = `/uploads/${req.file.filename}`;

        const projectFile = await prisma.projectFile.create({
            data: {
                name: req.file.originalname,
                url: fileUrl,
                size: req.file.size,
                mimeType: req.file.mimetype,
                projectId: projectId
            }
        });

        res.json(projectFile);
    } catch (error) {
        console.error('Upload error:', error);
        // Clean up file if error occurs
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Error al subir archivo' });
    }
});

export default router;
