"use strict";
// ============================================
// Prisma Database Client
// ============================================
// Creates a single Prisma client instance that
// is reused across the entire application.
// This prevents creating too many connections.
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Create or reuse the Prisma client
const prisma = global.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn'] // Log queries in dev mode
        : ['error'], // Only log errors in production
});
// In development, save the client to global to reuse on hot reloads
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
exports.default = prisma;
//# sourceMappingURL=database.js.map