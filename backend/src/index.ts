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
import { setupSocketHandlers } from './socket/handlers';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (origin.startsWith('http://localhost:')) return callback(null, true);
            if (origin === process.env.FRONTEND_URL) return callback(null, true);
            callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.startsWith('http://localhost:')) return callback(null, true);
        if (origin === process.env.FRONTEND_URL) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // <--- Serve static files
app.use('/uploads', express.static('uploads'));

// Make io available in routes
app.set('io', io);

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/agency', authenticateToken, agencyRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/briefs', authenticateToken, briefRoutes);
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/team', authenticateToken, teamRoutes);
app.use('/api/files', authenticateToken, fileRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

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
