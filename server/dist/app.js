"use strict";
// ============================================
// PMS Server — Express App Configuration
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = __importDefault(require("./config"));
const error_middleware_1 = require("./middleware/error.middleware");
// Import modular routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const project_routes_1 = __importDefault(require("./modules/projects/project.routes"));
const task_routes_1 = __importDefault(require("./modules/tasks/task.routes"));
const sprint_routes_1 = __importDefault(require("./modules/sprints/sprint.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const shared_routes_1 = require("./modules/shared/shared.routes");
const extended_routes_1 = require("./modules/extended/extended.routes");
// New standalone modules
const organization_routes_1 = __importDefault(require("./modules/organizations/organization.routes"));
const workspace_routes_1 = __importDefault(require("./modules/workspaces/workspace.routes"));
const team_routes_1 = __importDefault(require("./modules/teams/team.routes"));
const stakeholder_routes_1 = __importDefault(require("./modules/stakeholders/stakeholder.routes"));
const webhook_routes_1 = __importDefault(require("./modules/webhooks/webhook.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboards/dashboard.routes"));
const notificationSettings_routes_1 = __importDefault(require("./modules/notification-settings/notificationSettings.routes"));
const chat_routes_1 = __importDefault(require("./modules/chat/chat.routes"));
const board_routes_1 = __importDefault(require("./modules/boards/board.routes"));
const tag_routes_1 = __importDefault(require("./modules/tags/tag.routes"));
const customField_routes_1 = __importDefault(require("./modules/custom-fields/customField.routes"));
const calendar_routes_1 = __importDefault(require("./modules/calendar/calendar.routes"));
const upload_routes_1 = __importDefault(require("./modules/uploads/upload.routes"));
const system_routes_1 = __importDefault(require("./modules/system/system.routes"));
const path_1 = __importDefault(require("path"));
// ============================================
// Create Express App
// ============================================
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// ============================================
// Socket.IO Setup
// ============================================
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: config_1.default.clientUrl,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
// Online users tracking
const onlineUsers = new Map(); // userId -> socketId
io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);
    socket.on('join', (userId) => {
        socket.join(userId);
        onlineUsers.set(userId, socket.id);
        io.emit('presence:update', { userId, status: 'online' });
        console.log(`👤 User ${userId} joined`);
    });
    socket.on('join-project', (projectId) => {
        socket.join(`project:${projectId}`);
    });
    socket.on('leave-project', (projectId) => {
        socket.leave(`project:${projectId}`);
    });
    socket.on('join-channel', (channelId) => {
        socket.join(`channel:${channelId}`);
    });
    socket.on('typing:start', (data) => {
        socket.to(`channel:${data.channelId}`).emit('typing:start', data);
    });
    socket.on('typing:stop', (data) => {
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
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [config_1.default.clientUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
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
        environment: config_1.default.nodeEnv,
        version: '2.0.0',
    });
});
// Mount original modules
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/sprints', sprint_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
// Mount new domain modules
app.use('/api/organizations', organization_routes_1.default);
app.use('/api/workspaces', workspace_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/projects/:projectId/stakeholders', stakeholder_routes_1.default);
app.use('/api/webhooks', webhook_routes_1.default);
app.use('/api/dashboards', dashboard_routes_1.default);
app.use('/api/notification-settings', notificationSettings_routes_1.default);
// Mount updated standalone modules
app.use('/api/chat', chat_routes_1.default);
app.use('/api/boards', board_routes_1.default);
// Mount shared & extended modules
app.use('/api/time-logs', shared_routes_1.timeLogRoutes);
app.use('/api/activity-logs', shared_routes_1.activityLogRoutes);
app.use('/api/notifications', shared_routes_1.notificationRoutes);
app.use('/api/search', shared_routes_1.searchRoutes);
app.use('/api/attachments', extended_routes_1.attachmentRoutes);
app.use('/api/views', extended_routes_1.viewRoutes);
app.use('/api/documents', extended_routes_1.documentRoutes);
app.use('/api/automation', extended_routes_1.automationRoutes);
app.use('/api/permissions', extended_routes_1.permissionRoutes);
app.use('/api/export', extended_routes_1.exportRoutes);
app.use('/api/approvals', extended_routes_1.approvalRoutes);
// Missing requested APIs
app.use('/api/tags', tag_routes_1.default);
app.use('/api/custom-fields', customField_routes_1.default);
app.use('/api/calendar', calendar_routes_1.default);
app.use('/api/uploads', upload_routes_1.default);
// System APIs
app.use('/api', system_routes_1.default); // Mounts /api/status, /api/metrics, /api/queues/status
// Static file serving for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Legacy dashboard endpoint (backwards compat)
app.use('/api/dashboard', analytics_routes_1.default);
// ============================================
// 404 Handler
// ============================================
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});
// ============================================
// Global Error Handler
// ============================================
app.use(error_middleware_1.errorHandler);
// ============================================
// Start Server
// ============================================
httpServer.listen(config_1.default.port, () => {
    console.log(`
  ╔═══════════════════════════════════════════╗
  ║     🚀 PMS Server v2.0                   ║
  ║     📡 Port: ${config_1.default.port}                       ║
  ║     🌍 Env: ${config_1.default.nodeEnv}              ║
  ║     🔗 http://localhost:${config_1.default.port}             ║
  ╚═══════════════════════════════════════════╝
  `);
});
//# sourceMappingURL=app.js.map