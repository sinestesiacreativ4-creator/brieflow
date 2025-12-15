import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET contract by ID (for client signing - no auth required)
router.get('/:contractId', async (req: Request, res: Response) => {
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

// Sign contract (for clients - no auth required)
router.post('/:contractId/sign', async (req: Request, res: Response) => {
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

export default router;
