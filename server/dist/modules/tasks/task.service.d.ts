import { Role, TaskStatus } from '@prisma/client';
export declare const createTask: (input: any, userId: string, role: Role) => Promise<{
    project: {
        name: string;
        id: string;
        slug: string;
    };
    comments: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        replies: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            taskId: string;
            content: string;
            parentId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        taskId: string;
        content: string;
        parentId: string | null;
    })[];
    timeLogs: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startTime: Date | null;
        endTime: Date | null;
        taskId: string;
        hours: number;
        logDate: Date;
    })[];
    attachments: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        taskId: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedBy: string;
    })[];
    sprint: {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.SprintStatus;
    };
    assignments: ({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        userId: string;
        taskId: string;
        assignedAt: Date;
    })[];
    dependencies: ({
        dependencyTask: {
            id: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        dependentTaskId: string;
        dependencyTaskId: string;
    })[];
    dependents: ({
        dependentTask: {
            id: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        dependentTaskId: string;
        dependencyTaskId: string;
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
}>;
export declare const getTasks: (filters: any, userId: string, role: Role) => Promise<{
    tasks: ({
        project: {
            name: string;
            id: string;
            slug: string;
        };
        _count: {
            comments: number;
            timeLogs: number;
            attachments: number;
            subtasks: number;
        };
        sprint: {
            name: string;
            id: string;
            status: import("@prisma/client").$Enums.SprintStatus;
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
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getTaskById: (taskId: string) => Promise<{
    project: {
        name: string;
        id: string;
        slug: string;
    };
    comments: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        replies: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            taskId: string;
            content: string;
            parentId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        taskId: string;
        content: string;
        parentId: string | null;
    })[];
    timeLogs: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startTime: Date | null;
        endTime: Date | null;
        taskId: string;
        hours: number;
        logDate: Date;
    })[];
    attachments: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        taskId: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedBy: string;
    })[];
    sprint: {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.SprintStatus;
    };
    assignments: ({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        userId: string;
        taskId: string;
        assignedAt: Date;
    })[];
    dependencies: ({
        dependencyTask: {
            id: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        dependentTaskId: string;
        dependencyTaskId: string;
    })[];
    dependents: ({
        dependentTask: {
            id: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        dependentTaskId: string;
        dependencyTaskId: string;
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
}>;
export declare const updateTask: (taskId: string, input: any, userId: string, role: Role) => Promise<{
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
}>;
export declare const deleteTask: (taskId: string) => Promise<{
    message: string;
}>;
export declare const assignTask: (taskId: string, userId: string) => Promise<{
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
}>;
export declare const unassignTask: (taskId: string, userId: string) => Promise<{
    message: string;
}>;
export declare const addComment: (taskId: string, userId: string, content: string, parentId?: string) => Promise<{
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    taskId: string;
    content: string;
    parentId: string | null;
}>;
export declare const reorderTask: (taskId: string, position: number, status?: TaskStatus) => Promise<{
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
}>;
export declare const addDependency: (dependentTaskId: string, dependencyTaskId: string) => Promise<{
    dependentTask: {
        id: string;
        title: string;
    };
    dependencyTask: {
        id: string;
        title: string;
    };
} & {
    id: string;
    createdAt: Date;
    dependentTaskId: string;
    dependencyTaskId: string;
}>;
export declare const updateSubtask: (subtaskId: string, data: any) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    taskId: string;
    position: number;
    isCompleted: boolean;
}>;
export declare const getTaskStats: (projectId: string) => Promise<{
    total: number;
    overdue: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
}>;
export declare const listComments: (taskId: string) => Promise<({
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string;
    };
    replies: ({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        taskId: string;
        content: string;
        parentId: string | null;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    taskId: string;
    content: string;
    parentId: string | null;
})[]>;
export declare const updateComment: (commentId: string, content: string) => Promise<{
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    taskId: string;
    content: string;
    parentId: string | null;
}>;
export declare const deleteComment: (commentId: string) => Promise<void>;
export declare const listDependencies: (taskId: string) => Promise<{
    blocking: ({
        dependentTask: {
            id: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            priority: import("@prisma/client").$Enums.Priority;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        dependentTaskId: string;
        dependencyTaskId: string;
    })[];
    blockedBy: ({
        dependencyTask: {
            id: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            priority: import("@prisma/client").$Enums.Priority;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        dependentTaskId: string;
        dependencyTaskId: string;
    })[];
}>;
export declare const removeDependency: (dependencyId: string) => Promise<void>;
export declare const listSubtasks: (taskId: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    taskId: string;
    position: number;
    isCompleted: boolean;
}[]>;
export declare const createSubtask: (taskId: string, data: any) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    taskId: string;
    position: number;
    isCompleted: boolean;
}>;
export declare const deleteSubtask: (subtaskId: string) => Promise<void>;
export declare const listTimeLogs: (taskId: string) => Promise<({
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string;
    };
} & {
    id: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    startTime: Date | null;
    endTime: Date | null;
    taskId: string;
    hours: number;
    logDate: Date;
})[]>;
export declare const createTimeLog: (taskId: string, userId: string, data: any) => Promise<{
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
    task: {
        id: string;
        title: string;
    };
} & {
    id: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    startTime: Date | null;
    endTime: Date | null;
    taskId: string;
    hours: number;
    logDate: Date;
}>;
export declare const listAttachments: (taskId: string) => Promise<({
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
} & {
    id: string;
    createdAt: Date;
    taskId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
})[]>;
//# sourceMappingURL=task.service.d.ts.map