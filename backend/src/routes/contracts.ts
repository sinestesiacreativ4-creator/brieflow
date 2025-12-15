import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Default contract terms template
const DEFAULT_TERMS = `
TÉRMINOS Y CONDICIONES DEL SERVICIO

1. OBJETO DEL CONTRATO
El presente contrato tiene por objeto establecer los términos y condiciones bajo los cuales se prestarán los servicios creativos detallados en este documento.

2. ENTREGABLES
Los entregables específicos se detallan en la sección correspondiente de este contrato. Cualquier trabajo adicional requerirá un acuerdo por escrito.

3. PAGOS
El cliente se compromete a realizar los pagos según el presupuesto acordado. El 50% se pagará al inicio del proyecto y el 50% restante al momento de la entrega final.

4. PLAZOS
Los plazos de entrega son estimados y pueden variar según la complejidad del proyecto y la disponibilidad de retroalimentación del cliente.

5. REVISIONES
Se incluyen hasta 3 rondas de revisiones. Revisiones adicionales tendrán un costo extra que será acordado previamente.

6. PROPIEDAD INTELECTUAL
Una vez completado el pago total, todos los derechos de propiedad intelectual de los entregables finales serán transferidos al cliente.

7. CONFIDENCIALIDAD
Ambas partes se comprometen a mantener la confidencialidad de la información compartida durante el proyecto.

8. CANCELACIÓN
En caso de cancelación por parte del cliente, se facturará el trabajo realizado hasta la fecha de cancelación.
`;

// Generate contract for a project
router.post('/:projectId/generate', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Solo administradores pueden generar contratos' });
            return;
        }

        const { projectId } = req.params;
        const { terms, agencySignature } = req.body;

        // Get project with all related data
        const project = await prisma.project.findFirst({
            where: { id: projectId, agencyId: req.user!.agencyId },
            include: {
                client: true,
                brief: true,
                agency: true
            }
        });

        if (!project) {
            res.status(404).json({ error: 'Proyecto no encontrado' });
            return;
        }

        // Check if contract already exists
        const existingContract = await prisma.contract.findUnique({
            where: { projectId }
        });

        if (existingContract) {
            res.status(400).json({ error: 'Ya existe un contrato para este proyecto' });
            return;
        }

        // Create contract
        const contract = await prisma.contract.create({
            data: {
                projectId,
                agencyId: req.user!.agencyId,
                clientName: project.client.name,
                clientCompany: project.client.company,
                clientEmail: project.client.email,
                projectName: project.name,
                projectType: project.type,
                deliverables: project.brief?.deliverables || '',
                budget: project.brief?.budget || '',
                timeline: project.brief?.timeline || '',
                terms: terms || DEFAULT_TERMS,
                agencySignature: agencySignature || null,
                status: 'PENDING'
            }
        });

        res.status(201).json(contract);
    } catch (error) {
        console.error('Generate contract error:', error);
        res.status(500).json({ error: 'Error al generar contrato' });
    }
});

// Send contract to client (creates in-app notification)
router.post('/:contractId/send', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Solo administradores pueden enviar contratos' });
            return;
        }

        const { contractId } = req.params;

        const contract = await prisma.contract.findFirst({
            where: { id: contractId, agencyId: req.user!.agencyId }
        });

        if (!contract) {
            res.status(404).json({ error: 'Contrato no encontrado' });
            return;
        }

        // Get the project with client to find userId
        const project = await prisma.project.findUnique({
            where: { id: contract.projectId },
            include: { client: true }
        });

        // Get client user if exists
        let clientUserId = '';
        if (project?.client?.email) {
            const clientUser = await prisma.user.findFirst({
                where: { email: project.client.email, role: 'CLIENT' }
            });
            if (clientUser) {
                clientUserId = clientUser.id;
            }
        }

        // Create notification for the client
        await prisma.notification.create({
            data: {
                type: 'CONTRACT_PENDING',
                title: '📝 Contrato pendiente de firma',
                message: `Tienes un contrato pendiente para el proyecto "${contract.projectName}". Haz clic para revisar y firmar.`,
                userId: clientUserId,
                agencyId: contract.agencyId,
                projectId: contract.projectId,
                actionUrl: `/sign-contract/${contract.id}`
            }
        });

        res.json({ success: true, message: 'Contrato enviado al cliente' });
    } catch (error) {
        console.error('Send contract error:', error);
        res.status(500).json({ error: 'Error al enviar contrato' });
    }
});

// Get contract for a project
router.get('/:projectId', async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findFirst({
            where: { id: projectId, agencyId: req.user!.agencyId }
        });

        if (!project) {
            res.status(404).json({ error: 'Proyecto no encontrado' });
            return;
        }

        const contract = await prisma.contract.findUnique({
            where: { projectId }
        });

        if (!contract) {
            res.status(404).json({ error: 'Contrato no encontrado' });
            return;
        }

        res.json(contract);
    } catch (error) {
        console.error('Get contract error:', error);
        res.status(500).json({ error: 'Error al obtener contrato' });
    }
});

// PUBLIC: Get contract by ID (for client signing - no auth required)
router.get('/public/:contractId', async (req, res) => {
    try {
        const { contractId } = req.params;

        const contract = await prisma.contract.findUnique({
            where: { id: contractId }
        });

        if (!contract) {
            res.status(404).json({ error: 'Contrato no encontrado' });
            return;
        }

        res.json(contract);
    } catch (error) {
        console.error('Get public contract error:', error);
        res.status(500).json({ error: 'Error al obtener contrato' });
    }
});

// PUBLIC: Sign contract (for clients - no auth required)
router.post('/public/:contractId/sign', async (req, res) => {
    try {
        const { contractId } = req.params;
        const { signature } = req.body;

        if (!signature) {
            res.status(400).json({ error: 'Firma requerida' });
            return;
        }

        const contract = await prisma.contract.findUnique({
            where: { id: contractId }
        });

        if (!contract) {
            res.status(404).json({ error: 'Contrato no encontrado' });
            return;
        }

        if (contract.status === 'SIGNED') {
            res.status(400).json({ error: 'El contrato ya fue firmado' });
            return;
        }

        // Get client IP for audit
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        const updatedContract = await prisma.contract.update({
            where: { id: contractId },
            data: {
                clientSignature: signature,
                status: 'SIGNED',
                signedAt: new Date(),
                signedByIp: Array.isArray(clientIp) ? clientIp[0] : clientIp
            }
        });

        // Get agency admin to notify
        const agencyAdmin = await prisma.user.findFirst({
            where: {
                agencyId: contract.agencyId,
                role: { in: ['ADMIN', 'OWNER'] }
            }
        });

        // Notify the agency admin that contract was signed
        await prisma.notification.create({
            data: {
                type: 'CONTRACT_SIGNED',
                title: '✅ Contrato firmado',
                message: `El cliente "${contract.clientName}" ha firmado el contrato del proyecto "${contract.projectName}".`,
                userId: agencyAdmin?.id || '',
                agencyId: contract.agencyId,
                projectId: contract.projectId,
                actionUrl: `/projects/${contract.projectId}`
            }
        });

        res.json(updatedContract);
    } catch (error) {
        console.error('Sign contract error:', error);
        res.status(500).json({ error: 'Error al firmar contrato' });
    }
});

// Sign contract (for clients)
router.post('/:contractId/sign', async (req: AuthRequest, res: Response) => {
    try {
        const { contractId } = req.params;
        const { signature } = req.body;

        if (!signature) {
            res.status(400).json({ error: 'Firma requerida' });
            return;
        }

        const contract = await prisma.contract.findUnique({
            where: { id: contractId }
        });

        if (!contract) {
            res.status(404).json({ error: 'Contrato no encontrado' });
            return;
        }

        if (contract.status === 'SIGNED') {
            res.status(400).json({ error: 'El contrato ya fue firmado' });
            return;
        }

        // Get client IP for audit
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        const updatedContract = await prisma.contract.update({
            where: { id: contractId },
            data: {
                clientSignature: signature,
                status: 'SIGNED',
                signedAt: new Date(),
                signedByIp: Array.isArray(clientIp) ? clientIp[0] : clientIp
            }
        });

        res.json(updatedContract);
    } catch (error) {
        console.error('Sign contract error:', error);
        res.status(500).json({ error: 'Error al firmar contrato' });
    }
});

// Update contract (add agency signature, update terms)
router.patch('/:contractId', async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role === 'CLIENT') {
            res.status(403).json({ error: 'Solo administradores pueden modificar contratos' });
            return;
        }

        const { contractId } = req.params;
        const { terms, agencySignature } = req.body;

        const contract = await prisma.contract.findFirst({
            where: { id: contractId, agencyId: req.user!.agencyId }
        });

        if (!contract) {
            res.status(404).json({ error: 'Contrato no encontrado' });
            return;
        }

        const updatedContract = await prisma.contract.update({
            where: { id: contractId },
            data: {
                ...(terms && { terms }),
                ...(agencySignature && { agencySignature })
            }
        });

        res.json(updatedContract);
    } catch (error) {
        console.error('Update contract error:', error);
        res.status(500).json({ error: 'Error al actualizar contrato' });
    }
});

export default router;
