import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
    user?: {
        id: string;
        email: string;
        role: string;
        agencyId: string;
        name: string;
    };
}

export function setupSocketHandlers(io: Server) {
    // Authentication middleware
    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthenticatedSocket['user'];
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.user?.name} (${socket.user?.id})`);

        // Join agency room and user private room
        if (socket.user) {
            socket.join(`agency:${socket.user.agencyId}`);
            socket.join(`user:${socket.user.id}`);
        }

        // Join a project room
        socket.on('join-project', async (projectId: string) => {
            try {
                const project = await prisma.project.findFirst({
                    where: { id: projectId, agencyId: socket.user?.agencyId }
                });

                if (!project) {
                    socket.emit('error', { message: 'Proyecto no encontrado' });
                    return;
                }

                socket.join(`project:${projectId}`);
                console.log(`${socket.user?.name} joined project: ${projectId}`);
            } catch (error) {
                console.error('Join project error:', error);
                socket.emit('error', { message: 'Error al unirse al proyecto' });
            }
        });

        // Leave a project room
        socket.on('leave-project', (projectId: string) => {
            socket.leave(`project:${projectId}`);
            console.log(`${socket.user?.name} left project: ${projectId}`);
        });

        // Send message
        socket.on('send-message', async (data: { projectId: string; content: string }) => {
            try {
                const { projectId, content } = data;

                if (!socket.user?.id) return;
                if (!content || !content.trim()) return;

                const project = await prisma.project.findFirst({
                    where: { id: projectId, agencyId: socket.user?.agencyId },
                    include: { client: true }
                });

                if (!project) return;

                const isClient = socket.user.role === 'CLIENT';

                // Create message
                const messageData: any = {
                    content: content.trim(),
                    projectId,
                    senderName: socket.user.name,
                    senderType: isClient ? 'CLIENT' : 'USER',
                    senderId: !isClient ? socket.user.id : undefined
                };

                if (isClient) {
                    messageData.clientId = project.clientId;
                }

                const message = await prisma.message.create({
                    data: messageData,
                    include: {
                        sender: { select: { id: true, name: true, role: true } },
                        client: { select: { id: true, name: true } }
                    }
                });

                // Broadcast
                io.to(`project:${projectId}`).emit('receive-message', message);

                // Notification Logic
                let targetUserId = null;
                if (isClient) {
                    if (project.assignedToId) targetUserId = project.assignedToId;
                } else {
                    // Try to find user account for client
                    const clientUser = await prisma.user.findFirst({
                        where: { email: project.client.email }
                    });
                    if (clientUser) targetUserId = clientUser.id;
                }

                if (targetUserId) {
                    io.to(`user:${targetUserId}`).emit('notification', {
                        title: `Nuevo mensaje de ${socket.user.name}`,
                        body: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                        url: `/projects/${projectId}`,
                        projectId
                    });
                }

                // Save notification to DB
                await prisma.notification.create({
                    data: {
                        type: 'NEW_MESSAGE',
                        title: 'Nuevo mensaje',
                        message: `${socket.user.name} envió un mensaje en el proyecto "${project.name}"`,
                        userId: socket.user.id,
                        agencyId: socket.user.agencyId,
                        projectId
                    }
                });

            } catch (error) {
                console.error('Send message error:', error);
            }
        });

        // Typing
        socket.on('typing', (data: { projectId: string; isTyping: boolean }) => {
            socket.to(`project:${data.projectId}`).emit('user-typing', {
                userId: socket.user?.id,
                userName: socket.user?.name,
                isTyping: data.isTyping
            });
        });

        // Update Status
        socket.on('update-project-status', async (data: { projectId: string; status: string }) => {
            try {
                const { projectId, status } = data;
                const project = await prisma.project.findFirst({
                    where: { id: projectId, agencyId: socket.user?.agencyId }
                });

                if (!project) return;

                await prisma.project.update({
                    where: { id: projectId },
                    data: { status }
                });

                io.to(`project:${projectId}`).emit('project-updated', {
                    projectId,
                    status,
                    updatedBy: socket.user?.name
                });

                // Notify status change
                await prisma.notification.create({
                    data: {
                        type: 'STATUS_CHANGE',
                        title: 'Status Actualizado',
                        message: `Estado cambiado a ${status}`,
                        userId: socket.user?.id!,
                        agencyId: socket.user?.agencyId!,
                        projectId
                    }
                });

            } catch (error) {
                console.error('Update status error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user?.name}`);
        });
    });
}
