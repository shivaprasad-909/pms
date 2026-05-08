import { Response } from 'express';
interface ApiResponseOptions {
    res: Response;
    statusCode?: number;
    success?: boolean;
    message?: string;
    data?: any;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare const sendResponse: ({ res, statusCode, success, message, data, pagination, }: ApiResponseOptions) => Response<any, Record<string, any>>;
export declare const sendError: (res: Response, statusCode: number, message: string, errors?: any) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=apiResponse.d.ts.map