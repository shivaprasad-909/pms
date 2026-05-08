// ============================================
// Database Seed — Demo Data
// ============================================

import { PrismaClient, Role, ProjectStatus, TaskStatus, Priority, SprintStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.$transaction([
    prisma.automationExecution.deleteMany(),
    prisma.automationRule.deleteMany(),
    prisma.documentBlock.deleteMany(),
    prisma.documentPage.deleteMany(),
    prisma.channelMessage.deleteMany(),
    prisma.channelMember.deleteMany(),
    prisma.chatChannel.deleteMany(),
    prisma.savedView.deleteMany(),
    prisma.boardColumn.deleteMany(),
    prisma.board.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.timeLog.deleteMany(),
    prisma.taskDependency.deleteMany(),
    prisma.subtask.deleteMany(),
    prisma.taskAttachment.deleteMany(),
    prisma.taskComment.deleteMany(),
    prisma.taskAssignment.deleteMany(),
    prisma.task.deleteMany(),
    prisma.sprint.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  const hash = await bcrypt.hash('password123', 10);

  // 1. Organization
  const org = await prisma.organization.create({
    data: { name: 'Acme Corp', slug: 'acme-corp', description: 'Enterprise software company' },
  });
  console.log('✅ Organization created');

  // 2. Users
  const founder = await prisma.user.create({
    data: { email: 'founder@acme.com', password: hash, firstName: 'Alex', lastName: 'Morgan', role: 'FOUNDER', organizationId: org.id, designation: 'CEO', department: 'Executive' },
  });
  const admin = await prisma.user.create({
    data: { email: 'admin@acme.com', password: hash, firstName: 'Sarah', lastName: 'Chen', role: 'ADMIN', organizationId: org.id, designation: 'CTO', department: 'Engineering' },
  });
  const manager1 = await prisma.user.create({
    data: { email: 'manager@acme.com', password: hash, firstName: 'David', lastName: 'Kim', role: 'MANAGER', organizationId: org.id, designation: 'Engineering Manager', department: 'Engineering' },
  });
  const manager2 = await prisma.user.create({
    data: { email: 'pm@acme.com', password: hash, firstName: 'Lisa', lastName: 'Park', role: 'MANAGER', organizationId: org.id, designation: 'Product Manager', department: 'Product' },
  });
  const dev1 = await prisma.user.create({
    data: { email: 'dev1@acme.com', password: hash, firstName: 'James', lastName: 'Wilson', role: 'DEVELOPER', organizationId: org.id, designation: 'Senior Developer', department: 'Engineering' },
  });
  const dev2 = await prisma.user.create({
    data: { email: 'dev2@acme.com', password: hash, firstName: 'Emily', lastName: 'Brown', role: 'DEVELOPER', organizationId: org.id, designation: 'Frontend Developer', department: 'Engineering' },
  });
  const dev3 = await prisma.user.create({
    data: { email: 'dev3@acme.com', password: hash, firstName: 'Michael', lastName: 'Lee', role: 'DEVELOPER', organizationId: org.id, designation: 'Backend Developer', department: 'Engineering' },
  });
  const dev4 = await prisma.user.create({
    data: { email: 'dev4@acme.com', password: hash, firstName: 'Priya', lastName: 'Sharma', role: 'DEVELOPER', organizationId: org.id, designation: 'Full Stack Developer', department: 'Engineering' },
  });
  console.log('✅ 8 Users created');

  // 3. Projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Platform Redesign', slug: 'platform-redesign',
        description: 'Complete redesign of the customer-facing platform with modern UI/UX',
        status: 'ACTIVE', priority: 'HIGH', organizationId: org.id, createdById: founder.id,
        startDate: new Date('2026-01-15'), endDate: new Date('2026-06-30'), budget: 150000,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App v2', slug: 'mobile-app-v2',
        description: 'Next generation mobile application with offline support',
        status: 'ACTIVE', priority: 'HIGH', organizationId: org.id, createdById: admin.id,
        startDate: new Date('2026-02-01'), endDate: new Date('2026-08-15'), budget: 200000,
      },
    }),
    prisma.project.create({
      data: {
        name: 'API Gateway', slug: 'api-gateway',
        description: 'Unified API gateway for microservices architecture',
        status: 'PLANNING', priority: 'MEDIUM', organizationId: org.id, createdById: admin.id,
        startDate: new Date('2026-04-01'), endDate: new Date('2026-09-30'), budget: 80000,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Analytics Dashboard', slug: 'analytics-dashboard',
        description: 'Real-time analytics and reporting dashboard for business intelligence',
        status: 'ACTIVE', priority: 'MEDIUM', organizationId: org.id, createdById: founder.id,
        startDate: new Date('2026-03-01'), endDate: new Date('2026-07-15'), budget: 120000,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Security Audit', slug: 'security-audit',
        description: 'Comprehensive security review and penetration testing',
        status: 'COMPLETED', priority: 'URGENT', organizationId: org.id, createdById: founder.id,
        startDate: new Date('2025-11-01'), endDate: new Date('2026-02-28'), completedAt: new Date('2026-02-25'), budget: 50000,
      },
    }),
  ]);
  console.log('✅ 5 Projects created');

  // 4. Project Members
  const memberData = [
    { userId: manager1.id, projectId: projects[0].id, role: 'MANAGER' as Role },
    { userId: dev1.id, projectId: projects[0].id, role: 'DEVELOPER' as Role },
    { userId: dev2.id, projectId: projects[0].id, role: 'DEVELOPER' as Role },
    { userId: manager2.id, projectId: projects[1].id, role: 'MANAGER' as Role },
    { userId: dev3.id, projectId: projects[1].id, role: 'DEVELOPER' as Role },
    { userId: dev4.id, projectId: projects[1].id, role: 'DEVELOPER' as Role },
    { userId: manager1.id, projectId: projects[2].id, role: 'MANAGER' as Role },
    { userId: dev1.id, projectId: projects[2].id, role: 'DEVELOPER' as Role },
    { userId: manager2.id, projectId: projects[3].id, role: 'MANAGER' as Role },
    { userId: dev2.id, projectId: projects[3].id, role: 'DEVELOPER' as Role },
    { userId: dev4.id, projectId: projects[3].id, role: 'DEVELOPER' as Role },
    { userId: manager1.id, projectId: projects[4].id, role: 'MANAGER' as Role },
    { userId: dev3.id, projectId: projects[4].id, role: 'DEVELOPER' as Role },
  ];
  await prisma.projectMember.createMany({ data: memberData });
  console.log('✅ Project members assigned');

  // 5. Sprints
  const sprints = await Promise.all([
    prisma.sprint.create({ data: { name: 'Sprint 1', goal: 'Foundation & auth', status: 'COMPLETED', projectId: projects[0].id, startDate: new Date('2026-01-15'), endDate: new Date('2026-01-29') } }),
    prisma.sprint.create({ data: { name: 'Sprint 2', goal: 'Core UI components', status: 'COMPLETED', projectId: projects[0].id, startDate: new Date('2026-01-30'), endDate: new Date('2026-02-13') } }),
    prisma.sprint.create({ data: { name: 'Sprint 3', goal: 'Dashboard & analytics', status: 'ACTIVE', projectId: projects[0].id, startDate: new Date('2026-02-14'), endDate: new Date('2026-02-28') } }),
    prisma.sprint.create({ data: { name: 'Sprint 4', goal: 'Testing & polish', status: 'PLANNING', projectId: projects[0].id, startDate: new Date('2026-03-01'), endDate: new Date('2026-03-15') } }),
    prisma.sprint.create({ data: { name: 'Sprint 1', goal: 'App architecture', status: 'COMPLETED', projectId: projects[1].id, startDate: new Date('2026-02-01'), endDate: new Date('2026-02-15') } }),
    prisma.sprint.create({ data: { name: 'Sprint 2', goal: 'Offline sync', status: 'ACTIVE', projectId: projects[1].id, startDate: new Date('2026-02-16'), endDate: new Date('2026-03-01') } }),
  ]);
  console.log('✅ 6 Sprints created');

  // 6. Tasks with variety
  const taskTemplates = [
    // Project 0 - Platform Redesign
    { title: 'Design system setup', status: 'DONE' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[0].id, sprintId: sprints[0].id, storyPoints: 8, assignees: [dev2.id], dueDate: '2026-01-22', completedAt: new Date('2026-01-21') },
    { title: 'Authentication flow', status: 'DONE' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[0].id, sprintId: sprints[0].id, storyPoints: 13, assignees: [dev1.id], dueDate: '2026-01-28', completedAt: new Date('2026-01-27') },
    { title: 'User profile page', status: 'DONE' as TaskStatus, priority: 'MEDIUM' as Priority, projectId: projects[0].id, sprintId: sprints[1].id, storyPoints: 5, assignees: [dev2.id], dueDate: '2026-02-05', completedAt: new Date('2026-02-04') },
    { title: 'Dashboard layout', status: 'DONE' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[0].id, sprintId: sprints[1].id, storyPoints: 8, assignees: [dev1.id, dev2.id], dueDate: '2026-02-10', completedAt: new Date('2026-02-09') },
    { title: 'KPI widgets', status: 'IN_PROGRESS' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[0].id, sprintId: sprints[2].id, storyPoints: 13, assignees: [dev1.id], dueDate: '2026-02-22', estimatedHours: 20 },
    { title: 'Chart components', status: 'IN_PROGRESS' as TaskStatus, priority: 'MEDIUM' as Priority, projectId: projects[0].id, sprintId: sprints[2].id, storyPoints: 8, assignees: [dev2.id], dueDate: '2026-02-25', estimatedHours: 16 },
    { title: 'Activity feed', status: 'TODO' as TaskStatus, priority: 'MEDIUM' as Priority, projectId: projects[0].id, sprintId: sprints[2].id, storyPoints: 5, assignees: [dev1.id], dueDate: '2026-02-28', estimatedHours: 10 },
    { title: 'Real-time notifications', status: 'TODO' as TaskStatus, priority: 'LOW' as Priority, projectId: projects[0].id, sprintId: sprints[3].id, storyPoints: 5, assignees: [dev2.id], dueDate: '2026-03-10' },
    { title: 'Performance optimization', status: 'TODO' as TaskStatus, priority: 'MEDIUM' as Priority, projectId: projects[0].id, sprintId: sprints[3].id, storyPoints: 8, assignees: [dev1.id], dueDate: '2026-03-14' },
    { title: 'E2E testing', status: 'TODO' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[0].id, storyPoints: 13, assignees: [dev1.id, dev2.id], dueDate: '2026-03-20' },
    // Project 1 - Mobile App
    { title: 'React Native setup', status: 'DONE' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[1].id, sprintId: sprints[4].id, storyPoints: 5, assignees: [dev3.id], dueDate: '2026-02-05', completedAt: new Date('2026-02-04') },
    { title: 'Navigation structure', status: 'DONE' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[1].id, sprintId: sprints[4].id, storyPoints: 8, assignees: [dev4.id], dueDate: '2026-02-12', completedAt: new Date('2026-02-11') },
    { title: 'Offline data sync', status: 'IN_PROGRESS' as TaskStatus, priority: 'URGENT' as Priority, projectId: projects[1].id, sprintId: sprints[5].id, storyPoints: 21, assignees: [dev3.id, dev4.id], dueDate: '2026-02-28', estimatedHours: 40 },
    { title: 'Push notifications', status: 'TODO' as TaskStatus, priority: 'MEDIUM' as Priority, projectId: projects[1].id, sprintId: sprints[5].id, storyPoints: 8, assignees: [dev3.id], dueDate: '2026-03-01' },
    { title: 'Biometric authentication', status: 'IN_REVIEW' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[1].id, sprintId: sprints[5].id, storyPoints: 5, assignees: [dev4.id], dueDate: '2026-02-25' },
    // Project 3 - Analytics
    { title: 'Data pipeline setup', status: 'IN_PROGRESS' as TaskStatus, priority: 'HIGH' as Priority, projectId: projects[3].id, storyPoints: 13, assignees: [dev2.id, dev4.id], dueDate: '2026-03-15', estimatedHours: 30 },
    { title: 'Chart library integration', status: 'TODO' as TaskStatus, priority: 'MEDIUM' as Priority, projectId: projects[3].id, storyPoints: 8, assignees: [dev2.id], dueDate: '2026-03-25' },
    { title: 'Report export (PDF)', status: 'TODO' as TaskStatus, priority: 'LOW' as Priority, projectId: projects[3].id, storyPoints: 5, assignees: [dev4.id], dueDate: '2026-04-05' },
  ];

  for (let i = 0; i < taskTemplates.length; i++) {
    const t = taskTemplates[i];
    const task = await prisma.task.create({
      data: {
        title: t.title, status: t.status, priority: t.priority,
        projectId: t.projectId, sprintId: t.sprintId || null,
        storyPoints: t.storyPoints, position: i,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        completedAt: t.completedAt || null,
        estimatedHours: (t as any).estimatedHours || null,
      },
    });

    if (t.assignees.length > 0) {
      await prisma.taskAssignment.createMany({
        data: t.assignees.map(uid => ({ taskId: task.id, userId: uid })),
      });
    }

    // Add subtasks to some tasks
    if (i < 3) {
      await prisma.subtask.createMany({
        data: [
          { taskId: task.id, title: 'Research & planning', isCompleted: true, position: 0 },
          { taskId: task.id, title: 'Implementation', isCompleted: t.status === 'DONE', position: 1 },
          { taskId: task.id, title: 'Code review', isCompleted: t.status === 'DONE', position: 2 },
        ],
      });
    }
  }
  console.log('✅ 18 Tasks created with assignments & subtasks');

  // 7. Time Logs
  const timeLogs = [];
  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const devs = [dev1, dev2, dev3, dev4];
    for (const dev of devs) {
      if (Math.random() > 0.3) {
        timeLogs.push({
          hours: Math.round((Math.random() * 6 + 1) * 10) / 10,
          description: ['Feature development', 'Bug fixing', 'Code review', 'Documentation', 'Testing'][Math.floor(Math.random() * 5)],
          logDate: date,
          taskId: taskTemplates[Math.floor(Math.random() * taskTemplates.length)].title, // placeholder, we'll fix
          userId: dev.id,
        });
      }
    }
  }
  // Get actual task IDs
  const allTasks = await prisma.task.findMany({ select: { id: true } });
  for (const log of timeLogs) {
    const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
    await prisma.timeLog.create({
      data: { hours: log.hours, description: log.description, logDate: log.logDate, taskId: randomTask.id, userId: log.userId },
    });
  }
  console.log(`✅ ${timeLogs.length} Time logs created`);

  // 8. Activity Logs
  const actions = ['CREATED', 'UPDATED', 'STATUS_CHANGED', 'ASSIGNED', 'COMMENTED', 'LOGGED_TIME'] as const;
  const entityTypes = ['TASK', 'PROJECT', 'SPRINT', 'COMMENT'] as const;
  const allUsers = [founder, admin, manager1, manager2, dev1, dev2, dev3, dev4];
  for (let i = 0; i < 50; i++) {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    await prisma.activityLog.create({
      data: {
        action: actions[Math.floor(Math.random() * actions.length)],
        entityType: entityTypes[Math.floor(Math.random() * entityTypes.length)],
        entityId: allTasks[Math.floor(Math.random() * allTasks.length)].id,
        userId: randomUser.id,
        projectId: randomProject.id,
        organizationId: org.id,
        createdAt: date,
      },
    });
  }
  console.log('✅ 50 Activity logs created');

  // 9. Notifications
  for (const dev of [dev1, dev2, dev3, dev4]) {
    await prisma.notification.createMany({
      data: [
        { type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: 'You have been assigned a new task', userId: dev.id, isRead: Math.random() > 0.5 },
        { type: 'COMMENT_ADDED', title: 'New Comment', message: 'Someone commented on your task', userId: dev.id, isRead: Math.random() > 0.5 },
        { type: 'SPRINT_STARTED', title: 'Sprint Started', message: 'Sprint 3 has been activated', userId: dev.id, isRead: false },
      ],
    });
  }
  console.log('✅ Notifications created');

  // 10. Chat Channels + Messages
  const generalChannel = await prisma.chatChannel.create({
    data: {
      name: 'General', type: 'GENERAL', organizationId: org.id,
      description: 'Company-wide announcements and discussions',
      members: { createMany: { data: allUsers.map(u => ({ userId: u.id })) } },
    },
  });

  const projectChannel = await prisma.chatChannel.create({
    data: {
      name: 'Platform Redesign', type: 'PROJECT', organizationId: org.id,
      projectId: projects[0].id,
      members: { createMany: { data: [manager1, dev1, dev2].map(u => ({ userId: u.id })) } },
    },
  });

  const chatMessages = [
    { content: 'Welcome to the team! 🎉', userId: founder.id, channelId: generalChannel.id },
    { content: 'Sprint 3 kickoff at 10am tomorrow', userId: manager1.id, channelId: generalChannel.id },
    { content: 'The design system is looking great!', userId: admin.id, channelId: projectChannel.id },
    { content: 'I\'ll have the KPI widgets done by EOD', userId: dev1.id, channelId: projectChannel.id },
    { content: 'Can someone review my PR?', userId: dev2.id, channelId: projectChannel.id },
  ];
  for (const msg of chatMessages) {
    await prisma.channelMessage.create({ data: msg });
  }
  console.log('✅ Chat channels and messages created');

  // 11. Boards (auto-created with projects in real flow, but seed manually)
  for (const proj of projects) {
    await prisma.board.create({
      data: {
        name: 'Default Board', projectId: proj.id,
        columns: {
          createMany: {
            data: [
              { name: 'To Do', color: '#636E72', position: 0, taskStatus: 'TODO' },
              { name: 'In Progress', color: '#6C5CE7', position: 1, taskStatus: 'IN_PROGRESS' },
              { name: 'In Review', color: '#F39C12', position: 2, taskStatus: 'IN_REVIEW' },
              { name: 'Done', color: '#00B894', position: 3, taskStatus: 'DONE' },
            ],
          },
        },
      },
    });
  }
  console.log('✅ Boards created for all projects');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('  Founder: founder@acme.com / password123');
  console.log('  Admin:   admin@acme.com / password123');
  console.log('  Manager: manager@acme.com / password123');
  console.log('  Dev:     dev1@acme.com / password123\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
