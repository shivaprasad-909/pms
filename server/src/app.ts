// ============================================
// PMS Server — Express App Configuration
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './config';
import { errorHandler } from './middleware/error.middleware';

// Import modular routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import sprintRoutes from './modules/sprints/sprint.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import {
  timeLogRoutes,
  activityLogRoutes,
  notificationRoutes,
  searchRoutes,
} from './modules/shared/shared.routes';
import {
  attachmentRoutes,
  viewRoutes,
  documentRoutes,
  automationRoutes,
  permissionRoutes,
  exportRoutes,
  approvalRoutes,
} from './modules/extended/extended.routes';

// New standalone modules
import organizationRoutes from './modules/organizations/organization.routes';
import workspaceRoutes from './modules/workspaces/workspace.routes';
import teamRoutes from './modules/teams/team.routes';
import stakeholderRoutes from './modules/stakeholders/stakeholder.routes';
import webhookRoutes from './modules/webhooks/webhook.routes';
import dashboardRoutes from './modules/dashboards/dashboard.routes';
import notificationSettingsRoutes from './modules/notification-settings/notificationSettings.routes';
import chatRoutes from './modules/chat/chat.routes';
import boardRoutes from './modules/boards/board.routes';
import tagRoutes from './modules/tags/tag.routes';
import customFieldRoutes from './modules/custom-fields/customField.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import systemRoutes from './modules/system/system.routes';
import path from 'path';

// ============================================
// Create Express App
// ============================================
const app = express();
const httpServer = createServer(app);

// ============================================
// Socket.IO Setup
// ============================================
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Online users tracking
const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  socket.on('join', (userId: string) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    io.emit('presence:update', { userId, status: 'online' });
    console.log(`👤 User ${userId} joined`);
  });

  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('join-channel', (channelId: string) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on('typing:start', (data: { channelId: string; userId: string; userName: string }) => {
    socket.to(`channel:${data.channelId}`).emit('typing:start', data);
  });

  socket.on('typing:stop', (data: { channelId: string; userId: string }) => {
    socket.to(`channel:${data.channelId}`).emit('typing:stop', data);
  });

  socket.on('disconnect', () => {
    // Find and remove the user
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        io.emit('presence:update', { userId, status: 'offline' });
        break;
      }
    }
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// Make io + onlineUsers accessible to route handlers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ============================================
// Global Middleware
// ============================================
app.use(helmet());
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PMS API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '2.0.0',
  });
});

// Mount original modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/analytics', analyticsRoutes);

// Mount new domain modules
app.use('/api/organizations', organizationRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects/:projectId/stakeholders', stakeholderRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/notification-settings', notificationSettingsRoutes);

// Mount updated standalone modules
app.use('/api/chat', chatRoutes);
app.use('/api/boards', boardRoutes);

// Mount shared & extended modules
app.use('/api/time-logs', timeLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/approvals', approvalRoutes);

// Missing requested APIs
app.use('/api/tags', tagRoutes);
app.use('/api/custom-fields', customFieldRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/uploads', uploadRoutes);

// System APIs
app.use('/api', systemRoutes); // Mounts /api/status, /api/metrics, /api/queues/status

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Legacy dashboard endpoint (backwards compat)
app.use('/api/dashboard', analyticsRoutes);

// ============================================
// 404 Handler
// ============================================
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ============================================
// Global Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
httpServer.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     🚀 PMS Server v2.0                   ║
  ║     📡 Port: ${config.port}                       ║
  ║     🌍 Env: ${config.nodeEnv}              ║
  ║     🔗 http://localhost:${config.port}             ║
  ╚═══════════════════════════════════════════╝
  `);
});

export { app, io, httpServer };
