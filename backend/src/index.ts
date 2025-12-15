import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth';
import agencyRoutes from './routes/agency';
import projectRoutes from './routes/projects';
import clientRoutes from './routes/clients';
import briefRoutes from './routes/briefs';
import teamRoutes from './routes/team';
import fileRoutes from './routes/files';
import dashboardRoutes from './routes/dashboard';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';
import contractRoutes from './routes/contracts';
import publicContractRoutes from './routes/contractsPublic';
import { setupSocketHandlers } from './socket/handlers';
import { authenticateToken } from './middleware/auth';
import { pushService } from './services/pushNotification';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for sockets
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
// Middleware
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // <--- Serve static files
app.use('/uploads', express.static('uploads'));

// Make io available in routes
app.set('io', io);

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts/public', publicContractRoutes); // Public contract routes (signing)

// Protected routes
app.use('/api/agency', authenticateToken, agencyRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/briefs', authenticateToken, briefRoutes);
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/team', authenticateToken, teamRoutes);
app.use('/api/files', authenticateToken, fileRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/contracts', authenticateToken, contractRoutes); // Protected contract routes
app.use('/api/notifications', notificationRoutes);

console.log('✅ Notification routes loaded (V2)');

// Emergency Direct Test Route
app.post('/api/test-push-direct', async (req: any, res) => {
    try {
        const { userId } = req.body;
        console.log('🚨 Direct Push Test requested for:', userId);

        await pushService.sendNotification(userId, {
            title: 'Test Directo Exitoso 🚀',
            body: '¡El sistema funciona! El problema estaba en las rutas.',
            url: '/dashboard'
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Direct push error:', error);
        res.status(500).json({ error: 'Fallo al enviar push directo' });
    }
});

// Setup socket handlers
setupSocketHandlers(io);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🚀 Brief Flow API running on port ${PORT}`);
});

export { io };
