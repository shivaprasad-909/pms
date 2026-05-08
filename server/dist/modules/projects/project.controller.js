"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectCompletion = exports.approveCompletion = exports.submitCompletion = exports.getTimeSummary = exports.removeMember = exports.updateMemberRole = exports.getMembers = exports.addMember = exports.remove = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const projectService = __importStar(require("./project.service"));
exports.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await projectService.createProject(req.body, user.userId, user.organizationId);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Project created', data: result });
});
exports.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await projectService.getProjects(user.userId, user.role, user.organizationId, req.query);
    (0, apiResponse_1.sendResponse)({ res, data: result.projects, pagination: result.pagination });
});
exports.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await projectService.getProjectById((0, params_1.p)(req.params.projectId), user.userId, user.role);
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await projectService.updateProject((0, params_1.p)(req.params.projectId), req.body, user.userId, user.role);
    (0, apiResponse_1.sendResponse)({ res, message: 'Project updated', data: result });
});
exports.remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await projectService.deleteProject((0, params_1.p)(req.params.projectId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.addMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await projectService.addProjectMember((0, params_1.p)(req.params.projectId), req.body.userId, req.body.role);
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Member added', data: result });
});
exports.getMembers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await projectService.getProjectMembers((0, params_1.p)(req.params.projectId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.updateMemberRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await projectService.updateProjectMemberRole((0, params_1.p)(req.params.projectId), (0, params_1.p)(req.params.userId), req.body.role);
    (0, apiResponse_1.sendResponse)({ res, message: 'Member role updated', data: result });
});
exports.removeMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await projectService.removeProjectMember((0, params_1.p)(req.params.projectId), (0, params_1.p)(req.params.userId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.getTimeSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await projectService.getProjectTimeSummary((0, params_1.p)(req.params.projectId));
    (0, apiResponse_1.sendResponse)({ res, data: result });
});
exports.submitCompletion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const result = await projectService.submitForCompletion((0, params_1.p)(req.params.projectId), user.userId);
    (0, apiResponse_1.sendResponse)({ res, message: 'Submitted for approval', data: result });
});
exports.approveCompletion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await projectService.approveCompletion((0, params_1.p)(req.params.projectId));
    (0, apiResponse_1.sendResponse)({ res, message: 'Project approved', data: result });
});
exports.rejectCompletion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await projectService.rejectCompletion((0, params_1.p)(req.params.projectId), req.body.reason);
    (0, apiResponse_1.sendResponse)({ res, message: 'Completion rejected', data: result });
});
//# sourceMappingURL=project.controller.js.map