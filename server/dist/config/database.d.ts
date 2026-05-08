import { PrismaClient } from '@prisma/client';
/**
 * Global Prisma client instance.
 *
 * In development, we store the client on the global object
 * to prevent creating new connections on every hot reload.
 * In production, we create a single instance.
 */
declare global {
    var prisma: PrismaClient | undefined;
}
declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=database.d.ts.map