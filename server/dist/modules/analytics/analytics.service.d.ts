import { Role } from '@prisma/client';
export declare const getFounderOverview: (organizationId: string) => Promise<{
    type: string;
    stats: {
        users: number;
        projects: number;
        tasks: number;
        activeSprints: number;
        overdueTasks: number;
        totalHoursLogged: number;
        completionRate: number;
    };
    projectsByStatus: Record<string, number>;
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
    recentActivity: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
            role: import("@prisma/client").$Enums.Role;
        };
        project: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string | null;
        projectId: string | null;
        action: import("@prisma/client").$Enums.ActivityAction;
        entityType: import("@prisma/client").$Enums.EntityType;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    })[];
    pendingApprovals: ({
        _count: {
            members: number;
            tasks: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        name: string;
        id: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        workspaceId: string | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
        priority: import("@prisma/client").$Enums.Priority;
        startDate: Date | null;
        endDate: Date | null;
        completedAt: Date | null;
        budget: number | null;
        progress: number;
        createdById: string;
    })[];
}>;
export declare const getProjectCompletionTrend: (organizationId: string, months?: number) => Promise<{
    month: string;
    created: number;
    completed: number;
}[]>;
export declare const getTeamWorkload: (organizationId: string) => Promise<{
    activeTasks: number;
    hoursThisWeek: number;
    completedThisWeek: number;
    utilization: number;
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: import("@prisma/client").$Enums.Role;
    weeklyCapacity: number;
}[]>;
export declare const getSprintVelocity: (organizationId: string, sprintCount?: number) => Promise<{
    name: string;
    project: string;
    completedPoints: number;
    completedTasks: number;
    startDate: Date;
    endDate: Date;
}[]>;
export declare const getProductivity: (organizationId: string, days?: number) => Promise<{
    date: string;
    created: number;
    completed: number;
}[]>;
export declare const getTimeTrackingSummary: (organizationId: string) => Promise<{
    byProject: {
        name: string;
        hours: number;
    }[];
}>;
export declare const getManagerOverview: (userId: string, organizationId: string) => Promise<{
    type: string;
    stats: {
        projects: number;
        tasks: number;
        overdueTasks: number;
        activeSprints: number;
        completionRate: number;
        pendingReviews: number;
    };
    tasksByStatus: Record<string, number>;
    projects: {
        progress: number;
        _count: {
            members: number;
            tasks: number;
            sprints: number;
        };
        members: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.Role;
            projectId: string;
            userId: string;
            joinedAt: Date;
        })[];
        name: string;
        id: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        workspaceId: string | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
        priority: import("@prisma/client").$Enums.Priority;
        startDate: Date | null;
        endDate: Date | null;
        completedAt: Date | null;
        budget: number | null;
        createdById: string;
    }[];
    recentActivity: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        project: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string | null;
        projectId: string | null;
        action: import("@prisma/client").$Enums.ActivityAction;
        entityType: import("@prisma/client").$Enums.EntityType;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    })[];
    reviewTasks: ({
        project: {
            name: string;
            id: string;
        };
        assignments: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
        } & {
            id: string;
            userId: string;
            taskId: string;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.Priority;
        startDate: Date | null;
        completedAt: Date | null;
        projectId: string;
        title: string;
        estimatedHours: number | null;
        actualHours: number | null;
        storyPoints: number | null;
        dueDate: Date | null;
        position: number;
        labels: import("@prisma/client/runtime/library").JsonValue | null;
        sprintId: string | null;
        boardColumnId: string | null;
    })[];
}>;
export declare const getProjectBurndown: (sprintId: string) => Promise<{
    sprint: {
        id: string;
        name: string;
    };
    totalPoints: number;
    burndown: {
        day: number;
        date: string;
        ideal: number;
        actual: number;
    }[];
}>;
export declare const getDeveloperOverview: (userId: string) => Promise<{
    type: string;
    stats: {
        totalTasks: number;
        overdueTasks: number;
        totalHoursLogged: number;
        hoursThisWeek: number;
        todo: number;
        inProgress: number;
        inReview: number;
        done: number;
    };
    tasks: ({
        project: {
            name: string;
            id: string;
        };
        _count: {
            comments: number;
            timeLogs: number;
            attachments: number;
        };
        assignments: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
        } & {
            id: string;
            userId: string;
            taskId: string;
            assignedAt: Date;
        })[];
        subtasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            taskId: string;
            position: number;
            isCompleted: boolean;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.Priority;
        startDate: Date | null;
        completedAt: Date | null;
        projectId: string;
        title: string;
        estimatedHours: number | null;
        actualHours: number | null;
        storyPoints: number | null;
        dueDate: Date | null;
        position: number;
        labels: import("@prisma/client/runtime/library").JsonValue | null;
        sprintId: string | null;
        boardColumnId: string | null;
    })[];
    recentActivity: ({
        project: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string | null;
        projectId: string | null;
        action: import("@prisma/client").$Enums.ActivityAction;
        entityType: import("@prisma/client").$Enums.EntityType;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    })[];
}>;
export declare const getDashboardData: (userId: string, role: Role, organizationId: string) => Promise<{
    type: string;
    stats: {
        users: number;
        projects: number;
        tasks: number;
        activeSprints: number;
        overdueTasks: number;
        totalHoursLogged: number;
        completionRate: number;
    };
    projectsByStatus: Record<string, number>;
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
    recentActivity: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
            role: import("@prisma/client").$Enums.Role;
        };
        project: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string | null;
        projectId: string | null;
        action: import("@prisma/client").$Enums.ActivityAction;
        entityType: import("@prisma/client").$Enums.EntityType;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    })[];
    pendingApprovals: ({
        _count: {
            members: number;
            tasks: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        name: string;
        id: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        workspaceId: string | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
        priority: import("@prisma/client").$Enums.Priority;
        startDate: Date | null;
        endDate: Date | null;
        completedAt: Date | null;
        budget: number | null;
        progress: number;
        createdById: string;
    })[];
} | {
    type: string;
    stats: {
        projects: number;
        tasks: number;
        overdueTasks: number;
        activeSprints: number;
        completionRate: number;
        pendingReviews: number;
    };
    tasksByStatus: Record<string, number>;
    projects: {
        progress: number;
        _count: {
            members: number;
            tasks: number;
            sprints: number;
        };
        members: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.Role;
            projectId: string;
            userId: string;
            joinedAt: Date;
        })[];
        name: string;
        id: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        workspaceId: string | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
        priority: import("@prisma/client").$Enums.Priority;
        startDate: Date | null;
        endDate: Date | null;
        completedAt: Date | null;
        budget: number | null;
        createdById: string;
    }[];
    recentActivity: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        project: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string | null;
        projectId: string | null;
        action: import("@prisma/client").$Enums.ActivityAction;
        entityType: import("@prisma/client").$Enums.EntityType;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    })[];
    reviewTasks: ({
        project: {
            name: string;
            id: string;
        };
        assignments: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
        } & {
            id: string;
            userId: string;
            taskId: string;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.Priority;
        startDate: Date | null;
        completedAt: Date | null;
        projectId: string;
        title: string;
        estimatedHours: number | null;
        actualHours: number | null;
        storyPoints: number | null;
        dueDate: Date | null;
        position: number;
        labels: import("@prisma/client/runtime/library").JsonValue | null;
        sprintId: string | null;
        boardColumnId: string | null;
    })[];
} | {
    type: string;
    stats: {
        totalTasks: number;
        overdueTasks: number;
        totalHoursLogged: number;
        hoursThisWeek: number;
        todo: number;
        inProgress: number;
        inReview: number;
        done: number;
    };
    tasks: ({
        project: {
            name: string;
            id: string;
        };
        _count: {
            comments: number;
            timeLogs: number;
            attachments: number;
        };
        assignments: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
        } & {
            id: string;
            userId: string;
            taskId: string;
            assignedAt: Date;
        })[];
        subtasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            taskId: string;
            position: number;
            isCompleted: boolean;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.Priority;
        startDate: Date | null;
        completedAt: Date | null;
        projectId: string;
        title: string;
        estimatedHours: number | null;
        actualHours: number | null;
        storyPoints: number | null;
        dueDate: Date | null;
        position: number;
        labels: import("@prisma/client/runtime/library").JsonValue | null;
        sprintId: string | null;
        boardColumnId: string | null;
    })[];
    recentActivity: ({
        project: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        organizationId: string | null;
        projectId: string | null;
        action: import("@prisma/client").$Enums.ActivityAction;
        entityType: import("@prisma/client").$Enums.EntityType;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    })[];
}>;
export declare const getManagerWorkload: (userId: string, organizationId: string) => Promise<{
    activeTasks: number;
    hoursThisWeek: number;
    utilization: number;
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    weeklyCapacity: number;
}[]>;
export declare const getManagerCompletionTrend: (userId: string, months?: number) => Promise<{
    month: string;
    created: number;
    completed: number;
}[]>;
export declare const getDeveloperProductivity: (userId: string, days?: number) => Promise<{
    totalCompleted: number;
    totalPoints: number;
    totalHours: number;
    trend: {
        date: string;
        completed: number;
        hoursLogged: number;
        points: number;
    }[];
}>;
export declare const getResourceAllocation: (organizationId: string) => Promise<{
    project: {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProjectStatus;
    };
    members: number;
    memberDetails: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        role: import("@prisma/client").$Enums.Role;
        projectId: string;
        userId: string;
        joinedAt: Date;
    })[];
    totalTasks: number;
    activeTasks: number;
}[]>;
export declare const getWorkloadHeatmap: (organizationId: string) => Promise<{
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string;
        weeklyCapacity: number;
    };
    weekData: {
        week: string;
        hours: number;
        tasks: number;
    }[];
}[]>;
export declare const getCapacityAnalytics: (organizationId: string) => Promise<{
    summary: {
        totalCapacity: number;
        totalUsed: number;
        overallUtilization: number;
        overloaded: number;
        available: number;
    };
    users: {
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
            role: import("@prisma/client").$Enums.Role;
            weeklyCapacity: number;
        };
        activeTasks: number;
        hoursUsed: number;
        hoursRemaining: number;
        capacity: number;
        utilization: number;
        pendingPoints: number;
        status: string;
    }[];
}>;
//# sourceMappingURL=analytics.service.d.ts.map