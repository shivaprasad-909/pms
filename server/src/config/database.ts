// ============================================
// Prisma Database Client
// ============================================
// Creates a single Prisma client instance that
// is reused across the entire application.
// This prevents creating too many connections.
// ============================================

import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance.
 * 
 * In development, we store the client on the global object
 * to prevent creating new connections on every hot reload.
 * In production, we create a single instance.
 */

// Extend the global type to include our Prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

// Create or reuse the Prisma client
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] // Log queries in dev mode
    : ['error'],                  // Only log errors in production
});

// In development, save the client to global to reuse on hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
