// ============================================
// Auth Module — Service
// ============================================

import prisma from '../../config/database';
import { Role } from '@prisma/client';
import {
  hashPassword, comparePassword,
  generateAccessToken, generateRefreshToken, verifyRefreshToken,
  createSlug, generateUniqueSlug,
} from '../../utils/helpers';
import { AppError, UnauthorizedError, ConflictError, NotFoundError } from '../../errors/AppError';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  phone?: string;
  designation?: string;
  department?: string;
  uiPermissions?: string[];
  organizationId: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
  permissions: string[];
}

export const DEFAULT_PERMISSIONS: Record<Role, string[]> = {
  FOUNDER: ['*'],
  ADMIN: ['*'],
  MANAGER: ['dashboard.view', 'projects.view', 'projects.create', 'tasks.view', 'tasks.update', 'analytics.view', 'reports.view', 'chat.access', 'teams.manage'],
  DEVELOPER: ['dashboard.view', 'projects.view', 'tasks.view', 'tasks.update', 'chat.access'],
  STAKEHOLDER: ['dashboard.view', 'projects.view', 'reports.view']
};

const getMergedPermissions = (role: Role, uiPermissions: string[]) => {
  if (role === 'FOUNDER' || role === 'ADMIN') return ['*'];
  const defaults = DEFAULT_PERMISSIONS[role] || [];
  const merged = new Set([...defaults, ...(uiPermissions || [])]);
  return Array.from(merged);
};

const USER_SELECT = {
  id: true, email: true, firstName: true, lastName: true,
  role: true, avatar: true, phone: true, designation: true,
  department: true, isActive: true, organizationId: true,
  uiPermissions: true, weeklyCapacity: true, createdAt: true, lastLoginAt: true,
};

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('A user with this email already exists');

  const hashedPassword = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role || 'DEVELOPER',
      phone: input.phone,
      designation: input.designation,
      department: input.department,
      uiPermissions: input.uiPermissions || [],
      organizationId: input.organizationId,
    },
    select: USER_SELECT,
  });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: { select: { id: true, name: true, slug: true } } },
  });

  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (!user.isActive) throw new UnauthorizedError('Your account has been deactivated');

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const permissions = getMergedPermissions(user.role, user.uiPermissions);

  const payload: JwtPayload = {
    userId: user.id, email: user.email,
    role: user.role, organizationId: user.organizationId,
    permissions,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken, lastLoginAt: new Date() },
  });

  const { password: _, refreshToken: __, ...userData } = user;
  return { user: { ...userData, permissions }, accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string) => {
  const decoded = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!user || user.refreshToken !== token) throw new UnauthorizedError('Invalid refresh token');
  if (!user.isActive) throw new UnauthorizedError('Account is deactivated');

  const permissions = getMergedPermissions(user.role, user.uiPermissions);

  const payload: JwtPayload = {
    userId: user.id, email: user.email,
    role: user.role, organizationId: user.organizationId,
    permissions,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
};

export const logoutUser = async (userId: string) => {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
};

export const setupOrganization = async (
  orgName: string,
  userData: { email: string; password: string; firstName: string; lastName: string }
) => {
  const existingOrg = await prisma.organization.findFirst();
  if (existingOrg) throw new ConflictError('Organization already exists');

  let slug = createSlug(orgName);
  const existingSlug = await prisma.organization.findUnique({ where: { slug } });
  if (existingSlug) slug = generateUniqueSlug(slug);

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({ data: { name: orgName, slug } });
    const hashedPassword = await hashPassword(userData.password);
    const founder = await tx.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'FOUNDER',
        organizationId: org.id,
      },
      select: USER_SELECT,
    });

    // Create a default #general channel
    await tx.chatChannel.create({
      data: {
        name: 'General',
        description: 'Organization-wide channel',
        type: 'GENERAL',
        organizationId: org.id,
        members: { create: { userId: founder.id } },
      },
    });

    return { organization: org, founder };
  });

  const permissions = getMergedPermissions(result.founder.role, []);
  
  const payload: JwtPayload = {
    userId: result.founder.id,
    email: result.founder.email,
    role: result.founder.role,
    organizationId: result.founder.organizationId,
    permissions,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.user.update({
    where: { id: result.founder.id },
    data: { refreshToken, lastLoginAt: new Date() },
  });

  return { organization: result.organization, user: { ...result.founder, permissions }, accessToken, refreshToken };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...USER_SELECT, organization: { select: { id: true, name: true, slug: true, logo: true } } },
  });
  if (!user) throw new NotFoundError('User');
  const permissions = getMergedPermissions(user.role, user.uiPermissions);
  return { ...user, permissions };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: 'If the email exists, a reset token has been generated' };

  // Invalidate existing tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Create new token (UUID-based)
  const { v4: uuidv4 } = await import('uuid');
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  // In production, send email here. For now, return the token.
  return { resetToken: token, expiresAt };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken) throw new UnauthorizedError('Invalid reset token');
  if (resetToken.used) throw new UnauthorizedError('Token has already been used');
  if (resetToken.expiresAt < new Date()) throw new UnauthorizedError('Token has expired');

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword, refreshToken: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);
};

