import { Role } from '@prisma/client';
export declare const getUsers: (organizationId: string, userId: string, role: Role, filters: any) => Promise<{
    users: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        phone: string;
        designation: string;
        department: string;
        weeklyCapacity: number;
        organizationId: string;
        lastLoginAt: Date;
        _count: {
            managedProjects: number;
            taskAssignments: number;
        };
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getUserById: (id: string) => Promise<{
    organization: {
        name: string;
        id: string;
    };
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: import("@prisma/client").$Enums.Role;
    isActive: boolean;
    phone: string;
    designation: string;
    department: string;
    weeklyCapacity: number;
    organizationId: string;
    lastLoginAt: Date;
    _count: {
        managedProjects: number;
        taskAssignments: number;
        comments: number;
        timeLogs: number;
    };
}>;
export declare const updateUser: (id: string, data: any, requesterId: string, requesterRole: Role) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: import("@prisma/client").$Enums.Role;
    isActive: boolean;
    phone: string;
    designation: string;
    department: string;
    weeklyCapacity: number;
    organizationId: string;
    lastLoginAt: Date;
}>;
export declare const deactivateUser: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: import("@prisma/client").$Enums.Role;
    isActive: boolean;
    phone: string;
    designation: string;
    department: string;
    weeklyCapacity: number;
    organizationId: string;
    lastLoginAt: Date;
}>;
export declare const getUserTimeSummary: (userId: string, filters: any) => Promise<{
    totalHours: number;
    dailyBreakdown: {
        date: Date;
        hours: number;
    }[];
}>;
//# sourceMappingURL=user.service.d.ts.map