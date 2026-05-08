"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendResponse = void 0;
const sendResponse = ({ res, statusCode = 200, success = true, message = 'Success', data, pagination, }) => {
    const response = { success, message };
    if (data !== undefined)
        response.data = data;
    if (pagination)
        response.pagination = pagination;
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
const sendError = (res, statusCode, message, errors) => {
    const response = { success: false, message };
    if (errors)
        response.errors = errors;
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
//# sourceMappingURL=apiResponse.js.map