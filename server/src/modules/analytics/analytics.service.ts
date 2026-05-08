// ============================================
// Analytics Module — Service
// ============================================
// Production-grade analytics with REAL data
// aggregation for dashboards and reports.
// ============================================

import prisma from '../../config/database';
import { Role } from '@prisma/client';
import dayjs from 'dayjs';

// ─── FOUNDER / ADMIN ANALYTICS ────────────────

export const getFounderOverview = async (organizationId: string) => {
  const [userCount, projectCount, taskCount, sprintCount, projectsByStatus, tasksByStatus,
    tasksByPriority, overdueTasks, totalHours, recentActivity, pendingApprovals] = await Promise.all([
    prisma.user.count({ where: { organizationId, isActive: true } }),
    prisma.project.count({ where: { organizationId } }),
    prisma.task.count({ where: { project: { organizationId } } }),
    prisma.sprint.count({ where: { project: { organizationId }, status: 'ACTIVE' } }),
    prisma.project.groupBy({ by: ['status'], where: { organizationId }, _count: { status: true } }),
    prisma.task.groupBy({ by: ['status'], where: { project: { organizationId } }, _count: { status: true } }),
    prisma.task.groupBy({ by: ['priority'], where: { project: { organizationId } }, _count: { priority: true } }),
    prisma.task.count({ where: { project: { organizationId }, dueDate: { lt: new Date() }, status: { notIn: ['DONE'] } } }),
    prisma.timeLog.aggregate({ where: { user: { organizationId } }, _sum: { hours: true } }),
    prisma.activityLog.findMany({
      where: { organizationId },
      take: 15, orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.project.findMany({
      where: { organizationId, status: 'PENDING_APPROVAL' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { tasks: true, members: true } },
      },
    }),
  ]);

  const completedTasks = tasksByStatus.find(t => t.status === 'DONE')?._count.status || 0;

  return {
    type: 'founder',
    stats: {
      users: userCount, projects: projectCount, tasks: taskCount,
      activeSprints: sprintCount, overdueTasks,
      totalHoursLogged: Math.round((totalHours._sum.hours || 0) * 10) / 10,
      completionRate: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0,
    },
    projectsByStatus: projectsByStatus.reduce((a, c) => ({ ...a, [c.status]: c._count.status }), {} as Record<string, number>),
    tasksByStatus: tasksByStatus.reduce((a, c) => ({ ...a, [c.status]: c._count.status }), {} as Record<string, number>),
    tasksByPriority: tasksByPriority.reduce((a, c) => ({ ...a, [c.priority]: c._count.priority }), {} as Record<string, number>),
    recentActivity,
    pendingApprovals,
  };
};

export const getProjectCompletionTrend = async (organizationId: string, months: number = 12) => {
  const startDate = dayjs().subtract(months, 'month').startOf('month').toDate();

  const completed = await prisma.project.findMany({
    where: { organizationId, completedAt: { gte: startDate }, status: 'COMPLETED' },
    select: { completedAt: true },
  });

  const created = await prisma.project.findMany({
    where: { organizationId, createdAt: { gte: startDate } },
    select: { createdAt: true },
  });

  // Group by month
  const trend: { month: string; created: number; completed: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const m = dayjs().subtract(i, 'month');
    const label = m.format('MMM YYYY');
    trend.push({
      month: label,
      created: created.filter(p => dayjs(p.createdAt).format('MMM YYYY') === label).length,
      completed: completed.filter(p => p.completedAt && dayjs(p.completedAt).format('MMM YYYY') === label).length,
    });
  }
  return trend;
};

export const getTeamWorkload = async (organizationId: string) => {
  const users = await prisma.user.findMany({
    where: { organizationId, isActive: true, role: { in: ['DEVELOPER', 'MANAGER'] } },
    select: { id: true, firstName: true, lastName: true, role: true, avatar: true, weeklyCapacity: true },
  });

  const workload = await Promise.all(users.map(async (u) => {
    const [activeTasks, totalHours, completedThisWeek] = await Promise.all([
      prisma.task.count({ where: { assignments: { some: { userId: u.id } }, status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] } } }),
      prisma.timeLog.aggregate({
        where: { userId: u.id, logDate: { gte: dayjs().startOf('week').toDate() } },
        _sum: { hours: true },
      }),
      prisma.task.count({
        where: {
          assignments: { some: { userId: u.id } }, status: 'DONE',
          completedAt: { gte: dayjs().startOf('week').toDate() },
        },
      }),
    ]);

    return {
      ...u,
      activeTasks,
      hoursThisWeek: Math.round((totalHours._sum.hours || 0) * 10) / 10,
      completedThisWeek,
      utilization: u.weeklyCapacity > 0 ? Math.round(((totalHours._sum.hours || 0) / u.weeklyCapacity) * 100) : 0,
    };
  }));

  return workload;
};

export const getSprintVelocity = async (organizationId: string, sprintCount: number = 8) => {
  const sprints = await prisma.sprint.findMany({
    where: { project: { organizationId }, status: 'COMPLETED' },
    orderBy: { endDate: 'desc' }, take: sprintCount,
    include: {
      project: { select: { name: true } },
      tasks: { where: { status: 'DONE' }, select: { storyPoints: true } },
    },
  });

  return sprints.reverse().map(s => ({
    name: s.name,
    project: s.project.name,
    completedPoints: s.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0),
    completedTasks: s.tasks.length,
    startDate: s.startDate, endDate: s.endDate,
  }));
};

export const getProductivity = async (organizationId: string, days: number = 30) => {
  const startDate = dayjs().subtract(days, 'day').toDate();

  const tasksByDay = await prisma.task.findMany({
    where: { project: { organizationId }, completedAt: { gte: startDate } },
    select: { completedAt: true },
  });

  const createdByDay = await prisma.task.findMany({
    where: { project: { organizationId }, createdAt: { gte: startDate } },
    select: { createdAt: true },
  });

  const trend: { date: string; created: number; completed: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day');
    const label = d.format('MMM DD');
    trend.push({
      date: label,
      created: createdByDay.filter(t => dayjs(t.createdAt).format('MMM DD') === label).length,
      completed: tasksByDay.filter(t => t.completedAt && dayjs(t.completedAt).format('MMM DD') === label).length,
    });
  }
  return trend;
};

export const getTimeTrackingSummary = async (organizationId: string) => {
  const timeLogs = await prisma.timeLog.findMany({
    where: { user: { organizationId } },
    include: {
      task: { select: { projectId: true, project: { select: { name: true } } } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  // Group by project
  const byProject: Record<string, { name: string; hours: number }> = {};
  timeLogs.forEach(log => {
    const projName = log.task.project.name;
    if (!byProject[projName]) byProject[projName] = { name: projName, hours: 0 };
    byProject[projName].hours += log.hours;
  });

  return { byProject: Object.values(byProject).sort((a, b) => b.hours - a.hours) };
};

// ─── MANAGER ANALYTICS ────────────────

export const getManagerOverview = async (userId: string, organizationId: string) => {
  const myProjects = await prisma.project.findMany({
    where: { organizationId, members: { some: { userId, role: 'MANAGER' } } },
    include: {
      _count: { select: { tasks: true, members: true, sprints: true } },
      members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } }, take: 8 },
    },
  });

  const projectIds = myProjects.map(p => p.id);

  const [taskStats, overdueTasks, activeSprints, recentActivity, reviewTasks] = await Promise.all([
    prisma.task.groupBy({ by: ['status'], where: { projectId: { in: projectIds } }, _count: { status: true } }),
    prisma.task.count({ where: { projectId: { in: projectIds }, dueDate: { lt: new Date() }, status: { notIn: ['DONE'] } } }),
    prisma.sprint.count({ where: { projectId: { in: projectIds }, status: 'ACTIVE' } }),
    prisma.activityLog.findMany({
      where: { projectId: { in: projectIds } }, take: 10, orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.task.findMany({
      where: { projectId: { in: projectIds }, status: 'IN_REVIEW' },
      include: {
        project: { select: { id: true, name: true } },
        assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
      },
      take: 10,
    }),
  ]);

  const totalTasks = taskStats.reduce((s, t) => s + t._count.status, 0);
  const doneTasks = taskStats.find(t => t.status === 'DONE')?._count.status || 0;

  // Calculate progress per project
  const projectsWithProgress = await Promise.all(myProjects.map(async (p) => {
    const stats = await prisma.task.groupBy({ by: ['status'], where: { projectId: p.id }, _count: { status: true } });
    const total = stats.reduce((s, t) => s + t._count.status, 0);
    const done = stats.find(t => t.status === 'DONE')?._count.status || 0;
    return { ...p, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }));

  return {
    type: 'manager',
    stats: {
      projects: myProjects.length, tasks: totalTasks, overdueTasks,
      activeSprints, completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      pendingReviews: reviewTasks.length,
    },
    tasksByStatus: taskStats.reduce((a, c) => ({ ...a, [c.status]: c._count.status }), {} as Record<string, number>),
    projects: projectsWithProgress,
    recentActivity,
    reviewTasks,
  };
};

export const getProjectBurndown = async (sprintId: string) => {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { tasks: { select: { storyPoints: true, status: true, completedAt: true, createdAt: true } } },
  });
  if (!sprint) return null;

  const totalPoints = sprint.tasks.reduce((s, t) => s + (t.storyPoints || 1), 0);
  const days = dayjs(sprint.endDate).diff(dayjs(sprint.startDate), 'day') + 1;
  const burndown: { day: number; date: string; ideal: number; actual: number }[] = [];

  for (let i = 0; i < days; i++) {
    const d = dayjs(sprint.startDate).add(i, 'day');
    const completedByDay = sprint.tasks.filter(t =>
      t.completedAt && dayjs(t.completedAt).isBefore(d.endOf('day'))
    ).reduce((s, t) => s + (t.storyPoints || 1), 0);

    burndown.push({
      day: i + 1,
      date: d.format('MMM DD'),
      ideal: Math.round(totalPoints - (totalPoints / days) * (i + 1)),
      actual: d.isBefore(dayjs()) || d.isSame(dayjs(), 'day') ? totalPoints - completedByDay : 0,
    });
  }

  return { sprint: { id: sprint.id, name: sprint.name }, totalPoints, burndown };
};

// ─── DEVELOPER ANALYTICS ────────────────

export const getDeveloperOverview = async (userId: string) => {
  const [myTasks, recentActivity, totalHours, weekHours] = await Promise.all([
    prisma.task.findMany({
      where: { assignments: { some: { userId } } },
      include: {
        project: { select: { id: true, name: true } },
        assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
        subtasks: { orderBy: { position: 'asc' } },
        _count: { select: { comments: true, timeLogs: true, attachments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.activityLog.findMany({
      where: { userId }, take: 10, orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.timeLog.aggregate({ where: { userId }, _sum: { hours: true } }),
    prisma.timeLog.aggregate({
      where: { userId, logDate: { gte: dayjs().startOf('week').toDate() } },
      _sum: { hours: true },
    }),
  ]);

  const overdue = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;

  return {
    type: 'developer',
    stats: {
      totalTasks: myTasks.length, overdueTasks: overdue,
      totalHoursLogged: Math.round((totalHours._sum.hours || 0) * 10) / 10,
      hoursThisWeek: Math.round((weekHours._sum.hours || 0) * 10) / 10,
      todo: myTasks.filter(t => t.status === 'TODO').length,
      inProgress: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: myTasks.filter(t => t.status === 'IN_REVIEW').length,
      done: myTasks.filter(t => t.status === 'DONE').length,
    },
    tasks: myTasks,
    recentActivity,
  };
};

// ─── UNIFIED DASHBOARD ENDPOINT ────────────────

export const getDashboardData = async (userId: string, role: Role, organizationId: string) => {
  if (role === 'FOUNDER' || role === 'ADMIN') return getFounderOverview(organizationId);
  if (role === 'MANAGER') return getManagerOverview(userId, organizationId);
  return getDeveloperOverview(userId);
};

// ─── MANAGER WORKLOAD ────────────────

export const getManagerWorkload = async (userId: string, organizationId: string) => {
  const myProjects = await prisma.project.findMany({
    where: { organizationId, members: { some: { userId, role: 'MANAGER' } } },
    select: { id: true },
  });
  const projectIds = myProjects.map(p => p.id);

  const members = await prisma.projectMember.findMany({
    where: { projectId: { in: projectIds }, role: 'DEVELOPER' },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true, weeklyCapacity: true } },
    },
  });

  const uniqueUsers = Array.from(new Map(members.map(m => [m.user.id, m.user])).values());

  const workload = await Promise.all(uniqueUsers.map(async (u) => {
    const [activeTasks, weekHours] = await Promise.all([
      prisma.task.count({
        where: { projectId: { in: projectIds }, assignments: { some: { userId: u.id } }, status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] } },
      }),
      prisma.timeLog.aggregate({
        where: { userId: u.id, logDate: { gte: dayjs().startOf('week').toDate() } },
        _sum: { hours: true },
      }),
    ]);
    return {
      ...u,
      activeTasks,
      hoursThisWeek: Math.round((weekHours._sum.hours || 0) * 10) / 10,
      utilization: u.weeklyCapacity > 0 ? Math.round(((weekHours._sum.hours || 0) / u.weeklyCapacity) * 100) : 0,
    };
  }));

  return workload;
};

// ─── MANAGER COMPLETION TREND ────────────────

export const getManagerCompletionTrend = async (userId: string, months: number = 6) => {
  const myProjects = await prisma.project.findMany({
    where: { members: { some: { userId, role: 'MANAGER' } } },
    select: { id: true },
  });
  const projectIds = myProjects.map(p => p.id);
  const startDate = dayjs().subtract(months, 'month').startOf('month').toDate();

  const completedTasks = await prisma.task.findMany({
    where: { projectId: { in: projectIds }, completedAt: { gte: startDate }, status: 'DONE' },
    select: { completedAt: true },
  });

  const createdTasks = await prisma.task.findMany({
    where: { projectId: { in: projectIds }, createdAt: { gte: startDate } },
    select: { createdAt: true },
  });

  const trend: { month: string; created: number; completed: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const m = dayjs().subtract(i, 'month');
    const label = m.format('MMM YYYY');
    trend.push({
      month: label,
      created: createdTasks.filter(t => dayjs(t.createdAt).format('MMM YYYY') === label).length,
      completed: completedTasks.filter(t => t.completedAt && dayjs(t.completedAt).format('MMM YYYY') === label).length,
    });
  }
  return trend;
};

// ─── DEVELOPER PRODUCTIVITY ────────────────

export const getDeveloperProductivity = async (userId: string, days: number = 30) => {
  const startDate = dayjs().subtract(days, 'day').toDate();

  const [completed, created, timeLogs] = await Promise.all([
    prisma.task.findMany({
      where: { assignments: { some: { userId } }, completedAt: { gte: startDate }, status: 'DONE' },
      select: { completedAt: true, storyPoints: true },
    }),
    prisma.task.findMany({
      where: { assignments: { some: { userId } }, createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.timeLog.findMany({
      where: { userId, logDate: { gte: startDate } },
      select: { logDate: true, hours: true },
    }),
  ]);

  const trend: { date: string; completed: number; hoursLogged: number; points: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day');
    const label = d.format('MMM DD');
    const dayCompleted = completed.filter(t => t.completedAt && dayjs(t.completedAt).format('MMM DD') === label);
    trend.push({
      date: label,
      completed: dayCompleted.length,
      hoursLogged: Math.round(timeLogs.filter(l => dayjs(l.logDate).format('MMM DD') === label).reduce((s, l) => s + l.hours, 0) * 10) / 10,
      points: dayCompleted.reduce((s, t) => s + (t.storyPoints || 0), 0),
    });
  }

  return {
    totalCompleted: completed.length,
    totalPoints: completed.reduce((s, t) => s + (t.storyPoints || 0), 0),
    totalHours: Math.round(timeLogs.reduce((s, l) => s + l.hours, 0) * 10) / 10,
    trend,
  };
};

// ─── RESOURCE ALLOCATION ────────────────

export const getResourceAllocation = async (organizationId: string) => {
  const projects = await prisma.project.findMany({
    where: { organizationId, status: { in: ['ACTIVE', 'PLANNING'] } },
    select: { id: true, name: true, status: true },
  });

  const allocation = await Promise.all(projects.map(async (proj) => {
    const members = await prisma.projectMember.findMany({
      where: { projectId: proj.id },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
    });
    const [taskCount, activeTaskCount] = await Promise.all([
      prisma.task.count({ where: { projectId: proj.id } }),
      prisma.task.count({ where: { projectId: proj.id, status: { in: ['IN_PROGRESS', 'IN_REVIEW'] } } }),
    ]);
    return { project: proj, members: members.length, memberDetails: members, totalTasks: taskCount, activeTasks: activeTaskCount };
  }));

  return allocation;
};

// ─── WORKLOAD HEATMAP ────────────────

export const getWorkloadHeatmap = async (organizationId: string) => {
  const users = await prisma.user.findMany({
    where: { organizationId, isActive: true, role: { in: ['DEVELOPER', 'MANAGER'] } },
    select: { id: true, firstName: true, lastName: true, avatar: true, weeklyCapacity: true },
  });

  const heatmap = await Promise.all(users.map(async (u) => {
    const weekData: { week: string; hours: number; tasks: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = dayjs().subtract(i, 'week').startOf('week').toDate();
      const weekEnd = dayjs().subtract(i, 'week').endOf('week').toDate();

      const [hours, tasks] = await Promise.all([
        prisma.timeLog.aggregate({
          where: { userId: u.id, logDate: { gte: weekStart, lte: weekEnd } },
          _sum: { hours: true },
        }),
        prisma.task.count({
          where: { assignments: { some: { userId: u.id } }, completedAt: { gte: weekStart, lte: weekEnd } },
        }),
      ]);

      weekData.push({
        week: dayjs(weekStart).format('MMM DD'),
        hours: Math.round((hours._sum.hours || 0) * 10) / 10,
        tasks,
      });
    }
    return { user: u, weekData };
  }));

  return heatmap;
};

// ─── CAPACITY ANALYTICS ────────────────

export const getCapacityAnalytics = async (organizationId: string) => {
  const users = await prisma.user.findMany({
    where: { organizationId, isActive: true, role: { in: ['DEVELOPER', 'MANAGER'] } },
    select: { id: true, firstName: true, lastName: true, role: true, avatar: true, weeklyCapacity: true },
  });

  const capacity = await Promise.all(users.map(async (u) => {
    const [activeTasks, weekHours, totalPoints] = await Promise.all([
      prisma.task.count({
        where: { assignments: { some: { userId: u.id } }, status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] } },
      }),
      prisma.timeLog.aggregate({
        where: { userId: u.id, logDate: { gte: dayjs().startOf('week').toDate() } },
        _sum: { hours: true },
      }),
      prisma.task.aggregate({
        where: { assignments: { some: { userId: u.id } }, status: { in: ['TODO', 'IN_PROGRESS'] } },
        _sum: { storyPoints: true },
      }),
    ]);

    const hoursUsed = weekHours._sum.hours || 0;
    const remaining = Math.max(0, u.weeklyCapacity - hoursUsed);

    return {
      user: u,
      activeTasks,
      hoursUsed: Math.round(hoursUsed * 10) / 10,
      hoursRemaining: Math.round(remaining * 10) / 10,
      capacity: u.weeklyCapacity,
      utilization: u.weeklyCapacity > 0 ? Math.round((hoursUsed / u.weeklyCapacity) * 100) : 0,
      pendingPoints: totalPoints._sum.storyPoints || 0,
      status: hoursUsed >= u.weeklyCapacity ? 'OVERLOADED' : hoursUsed >= u.weeklyCapacity * 0.8 ? 'HIGH' : hoursUsed >= u.weeklyCapacity * 0.5 ? 'NORMAL' : 'LOW',
    };
  }));

  const totalCapacity = users.reduce((s, u) => s + u.weeklyCapacity, 0);
  const totalUsed = capacity.reduce((s, c) => s + c.hoursUsed, 0);

  return {
    summary: {
      totalCapacity,
      totalUsed: Math.round(totalUsed * 10) / 10,
      overallUtilization: totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0,
      overloaded: capacity.filter(c => c.status === 'OVERLOADED').length,
      available: capacity.filter(c => c.status === 'LOW').length,
    },
    users: capacity,
  };
};

