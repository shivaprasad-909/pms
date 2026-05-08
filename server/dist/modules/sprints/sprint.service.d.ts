export declare const createSprint: (input: any) => Promise<{
    project: {
        name: string;
        id: string;
    };
    _count: {
        tasks: number;
    };
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import("@prisma/client").$Enums.SprintStatus;
    startDate: Date;
    endDate: Date;
    projectId: string;
    goal: string | null;
}>;
export declare const getSprints: (filters: any) => Promise<({
    project: {
        name: string;
        id: string;
    };
    _count: {
        tasks: number;
    };
    tasks: {
        id: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        storyPoints: number;
    }[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import("@prisma/client").$Enums.SprintStatus;
    startDate: Date;
    endDate: Date;
    projectId: string;
    goal: string | null;
})[]>;
export declare const getSprintById: (id: string) => Promise<{
    analytics: {
        total: number;
        todo: number;
        inProgress: number;
        inReview: number;
        done: number;
        blocked: number;
        totalPoints: number;
        completedPoints: number;
    };
    project: {
        name: string;
        id: string;
    };
    tasks: ({
        _count: {
            comments: number;
            subtasks: number;
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
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import("@prisma/client").$Enums.SprintStatus;
    startDate: Date;
    endDate: Date;
    projectId: string;
    goal: string | null;
}>;
export declare const updateSprint: (id: string, data: any) => Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import("@prisma/client").$Enums.SprintStatus;
    startDate: Date;
    endDate: Date;
    projectId: string;
    goal: string | null;
}>;
export declare const deleteSprint: (id: string) => Promise<{
    message: string;
}>;
export declare const addTasksToSprint: (sprintId: string, taskIds: string[]) => Promise<{
    message: string;
}>;
export declare const removeTaskFromSprint: (sprintId: string, taskId: string) => Promise<{
    message: string;
}>;
export declare const getSprintBurndown: (sprintId: string) => Promise<{
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
export declare const getSprintVelocity: (sprintId: string) => Promise<{
    sprintId: string;
    name: string;
    project: {
        name: string;
        id: string;
    };
    completedPoints: number;
    totalPoints: number;
    completedTasks: number;
    totalTasks: number;
    velocity: number;
}>;
export declare const swapSprint: (fromSprintId: string, toSprintId: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=sprint.service.d.ts.map