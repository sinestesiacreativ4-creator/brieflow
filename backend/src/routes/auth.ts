import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const signupSchema = z.object({
    agencyName: z.string().min(2, 'El nombre de la agencia debe tener al menos 2 caracteres'),
    subdomain: z.string().min(3, 'El subdominio debe tener al menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

const clientLoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    agencySubdomain: z.string().optional(),
});

// Sign up - Create new agency
router.post('/signup', async (req, res: Response) => {
    try {
        const validatedData = signupSchema.parse(req.body);

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            res.status(400).json({ error: 'Este email ya está registrado' });
            return;
        }

        // Check if subdomain already exists
        const existingAgency = await prisma.agency.findUnique({
            where: { subdomain: validatedData.subdomain }
        });

        if (existingAgency) {
            res.status(400).json({ error: 'Este subdominio ya está en uso' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create agency and admin user in transaction
        const result = await prisma.$transaction(async (tx) => {
            const agency = await tx.agency.create({
                data: {
                    name: validatedData.agencyName,
                    subdomain: validatedData.subdomain,
                }
            });

            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    password: hashedPassword,
                    name: validatedData.name,
                    role: 'AGENCY_ADMIN',
                    agencyId: agency.id,
                }
            });

            return { agency, user };
        });

        // Generate JWT
        const token = jwt.sign(
            {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                agencyId: result.agency.id,
                name: result.user.name,
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Agencia creada exitosamente',
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
            },
            agency: {
                id: result.agency.id,
                name: result.agency.name,
                subdomain: result.agency.subdomain,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Error al crear la cuenta' });
    }
});

// Login for agency users
router.post('/login', async (req, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            include: { agency: true }
        });

        if (!user) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        const validPassword = await bcrypt.compare(validatedData.password, user.password);

        if (!validPassword) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                agencyId: user.agencyId,
                name: user.name,
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        if (!user.agency) {
            res.status(500).json({ error: 'Error de integridad de datos: Usuario sin agencia' });
            return;
        }

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            agency: {
                id: user.agency.id,
                name: user.agency.name,
                subdomain: user.agency.subdomain,
                logo: user.agency.logo,
                primaryColor: user.agency.primaryColor,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Login for clients
router.post('/client/login', async (req, res: Response) => {
    try {
        const validatedData = clientLoginSchema.parse(req.body);

        const client = await prisma.client.findFirst({
            where: {
                email: validatedData.email,
                password: { not: null }
            },
            include: { agency: true }
        });

        if (!client || !client.password) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        const validPassword = await bcrypt.compare(validatedData.password, client.password);

        if (!validPassword) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        const token = jwt.sign(
            {
                id: client.id,
                email: client.email,
                role: 'CLIENT',
                agencyId: client.agencyId,
                name: client.name,
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        if (!client.agency) {
            res.status(500).json({ error: 'Error de integridad: Cliente sin agencia asociada' });
            return;
        }

        res.json({
            token,
            user: {
                id: client.id,
                email: client.email,
                name: client.name,
                role: 'CLIENT',
                company: client.company,
            },
            agency: {
                id: client.agency.id,
                name: client.agency.name,
                subdomain: client.agency.subdomain,
                logo: client.agency.logo,
                primaryColor: client.agency.primaryColor,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
            return;
        }
        console.error('Client login error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Verify token
router.get('/verify', async (req, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ valid: false });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
            id: string;
            email: string;
            role: string;
            agencyId: string;
            name: string;
        };

        // Get agency info
        const agency = await prisma.agency.findUnique({
            where: { id: decoded.agencyId }
        });

        if (!agency) {
            res.status(401).json({ valid: false });
            return;
        }

        res.json({
            valid: true,
            user: {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
            },
            agency: {
                id: agency.id,
                name: agency.name,
                subdomain: agency.subdomain,
                logo: agency.logo,
                primaryColor: agency.primaryColor,
            }
        });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

export default router;
