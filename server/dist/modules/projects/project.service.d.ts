import { Role } from '@prisma/client';
export declare const createProject: (input: any, userId: string, organizationId: string) => Promise<{
    createdBy: {
        id: string;
        email: string;
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
}>;
export declare const getProjects: (userId: string, role: Role, organizationId: string, filters: any) => Promise<{
    projects: {
        progress: number;
        _count: {
            members: number;
            tasks: number;
            sprints: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
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
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getProjectById: (projectId: string, userId: string, role: Role) => Promise<{
    progress: number;
    taskStats: {
        total: number;
        overdue: number;
        byStatus: Record<string, number>;
    };
    _count: {
        members: number;
        tasks: number;
        sprints: number;
        documents: number;
    };
    createdBy: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    members: ({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar: string;
            role: import("@prisma/client").$Enums.Role;
            designation: string;
        };
    } & {
        id: string;
        role: import("@prisma/client").$Enums.Role;
        projectId: string;
        userId: string;
        joinedAt: Date;
    })[];
    sprints: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SprintStatus;
        startDate: Date;
        endDate: Date;
        projectId: string;
        goal: string | null;
    }[];
    boards: ({
        columns: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string;
            position: number;
            taskStatus: import("@prisma/client").$Enums.TaskStatus | null;
            wipLimit: number | null;
            boardId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
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
}>;
export declare const updateProject: (projectId: string, input: any, userId: string, role: Role) => Promise<{
    createdBy: {
        id: string;
        firstName: string;
        lastName: string;
    };
    members: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        role: import("@prisma/client").$Enums.Role;
        projectId: string;
        userId: string;
        joinedAt: Date;
    })[];
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
}>;
export declare const deleteProject: (projectId: string) => Promise<{
    message: string;
}>;
export declare const addProjectMember: (projectId: string, userId: string, memberRole: Role) => Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
    };
} & {
    id: string;
    role: import("@prisma/client").$Enums.Role;
    projectId: string;
    userId: string;
    joinedAt: Date;
}>;
export declare const removeProjectMember: (projectId: string, userId: string) => Promise<{
    message: string;
}>;
export declare const getProjectMembers: (projectId: string) => Promise<({
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string;
        role: import("@prisma/client").$Enums.Role;
        designation: string;
        department: string;
    };
} & {
    id: string;
    role: import("@prisma/client").$Enums.Role;
    projectId: string;
    userId: string;
    joinedAt: Date;
})[]>;
export declare const updateProjectMemberRole: (projectId: string, userId: string, newRole: Role) => Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
    };
} & {
    id: string;
    role: import("@prisma/client").$Enums.Role;
    projectId: string;
    userId: string;
    joinedAt: Date;
}>;
export declare const getProjectTimeSummary: (projectId: string) => Promise<{
    totalHours: number;
    byUser: {
        name: string;
        hours: number;
    }[];
    byTask: {
        title: string;
        hours: number;
    }[];
    totalEntries: number;
}>;
export declare const submitForCompletion: (projectId: string, userId: string) => Promise<{
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
}>;
export declare const approveCompletion: (projectId: string) => Promise<{
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
}>;
export declare const rejectCompletion: (projectId: string, reason: string) => Promise<{
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
}>;
//# sourceMappingURL=project.service.d.ts.map