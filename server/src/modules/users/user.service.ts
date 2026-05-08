// ============================================
// Users Module — Service
// ============================================

import prisma from '../../config/database';
import { Role } from '@prisma/client';
import { NotFoundError, ForbiddenError, ConflictError } from '../../errors/AppError';
import { hashPassword } from '../../utils/helpers';

const USER_SELECT = {
  id: true, email: true, firstName: true, lastName: true,
  role: true, avatar: true, phone: true, designation: true,
  department: true, isActive: true, organizationId: true,
  weeklyCapacity: true, createdAt: true, updatedAt: true, lastLoginAt: true,
};

export const getUsers = async (organizationId: string, userId: string, role: Role, filters: any) => {
  const where: any = { organizationId };

  if (role === 'DEVELOPER') {
    where.id = userId; // can only see self
  }

  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.role) where.role = filters.role;
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      select: {
        ...USER_SELECT,
        _count: { select: { taskAssignments: true, managedProjects: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...USER_SELECT,
      organization: { select: { id: true, name: true } },
      _count: { select: { taskAssignments: true, managedProjects: true, timeLogs: true, comments: true } },
    },
  });
  if (!user) throw new NotFoundError('User');
  return user;
};

export const updateUser = async (id: string, data: any, requesterId: string, requesterRole: Role) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');

  // Developers can only update their own profile
  if (requesterRole === 'DEVELOPER' && id !== requesterId) {
    throw new ForbiddenError('You can only update your own profile');
  }

  // Only Founder/Admin can change roles
  if (data.role && !['FOUNDER', 'ADMIN'].includes(requesterRole)) {
    throw new ForbiddenError('Only Founder/Admin can change user roles');
  }

  const updateData: any = {};
  if (data.firstName) updateData.firstName = data.firstName;
  if (data.lastName) updateData.lastName = data.lastName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.designation !== undefined) updateData.designation = data.designation;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.weeklyCapacity !== undefined) updateData.weeklyCapacity = data.weeklyCapacity;
  if (data.role) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.user.update({ where: { id }, data: updateData, select: USER_SELECT });
};

export const deactivateUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');
  if (user.role === 'FOUNDER') throw new ForbiddenError('Cannot deactivate the Founder');

  return prisma.user.update({ where: { id }, data: { isActive: false, refreshToken: null }, select: USER_SELECT });
};

export const getUserTimeSummary = async (userId: string, filters: any) => {
  const where: any = { userId };
  if (filters.from) where.logDate = { ...where.logDate, gte: new Date(filters.from) };
  if (filters.to) where.logDate = { ...where.logDate, lte: new Date(filters.to) };

  const [totalHours, byProject, byDay] = await Promise.all([
    prisma.timeLog.aggregate({ where, _sum: { hours: true } }),
    prisma.timeLog.groupBy({
      by: ['taskId'], where,
      _sum: { hours: true },
    }),
    prisma.timeLog.groupBy({
      by: ['logDate'], where,
      _sum: { hours: true },
      orderBy: { logDate: 'asc' },
    }),
  ]);

  return {
    totalHours: totalHours._sum.hours || 0,
    dailyBreakdown: byDay.map(d => ({ date: d.logDate, hours: d._sum.hours || 0 })),
  };
};
