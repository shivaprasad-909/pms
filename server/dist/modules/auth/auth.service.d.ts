import { Role } from '@prisma/client';
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
export declare const DEFAULT_PERMISSIONS: Record<Role, string[]>;
export declare const registerUser: (input: RegisterInput) => Promise<{
    id: string;
    createdAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: import("@prisma/client").$Enums.Role;
    uiPermissions: string[];
    isActive: boolean;
    phone: string;
    designation: string;
    department: string;
    weeklyCapacity: number;
    organizationId: string;
    lastLoginAt: Date;
}>;
export declare const loginUser: (email: string, password: string) => Promise<{
    user: {
        permissions: string[];
        organization: {
            name: string;
            id: string;
            slug: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        uiPermissions: string[];
        isActive: boolean;
        phone: string | null;
        designation: string | null;
        department: string | null;
        weeklyCapacity: number;
        organizationId: string;
        lastLoginAt: Date | null;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare const refreshAccessToken: (token: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare const logoutUser: (userId: string) => Promise<void>;
export declare const setupOrganization: (orgName: string, userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}) => Promise<{
    organization: {
        name: string;
        id: string;
        slug: string;
        description: string | null;
        logo: string | null;
        website: string | null;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
    };
    user: {
        permissions: string[];
        id: string;
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string;
        role: import("@prisma/client").$Enums.Role;
        uiPermissions: string[];
        isActive: boolean;
        phone: string;
        designation: string;
        department: string;
        weeklyCapacity: number;
        organizationId: string;
        lastLoginAt: Date;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare const getCurrentUser: (userId: string) => Promise<{
    permissions: string[];
    organization: {
        name: string;
        id: string;
        slug: string;
        logo: string;
    };
    id: string;
    createdAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: import("@prisma/client").$Enums.Role;
    uiPermissions: string[];
    isActive: boolean;
    phone: string;
    designation: string;
    department: string;
    weeklyCapacity: number;
    organizationId: string;
    lastLoginAt: Date;
}>;
export declare const forgotPassword: (email: string) => Promise<{
    message: string;
    resetToken?: undefined;
    expiresAt?: undefined;
} | {
    resetToken: string;
    expiresAt: Date;
    message?: undefined;
}>;
export declare const resetPassword: (token: string, newPassword: string) => Promise<void>;
export {};
//# sourceMappingURL=auth.service.d.ts.map