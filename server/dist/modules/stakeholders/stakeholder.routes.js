"use strict";
// ============================================
// Stakeholders Module — Full CRUD
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const auth_1 = require("../../middleware/auth");
const authorize_1 = require("../../middleware/authorize");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /projects/:projectId/stakeholders
router.get('/:projectId/stakeholders', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stakeholders = await database_1.default.stakeholder.findMany({
        where: { projectId: (0, params_1.p)(req.params.projectId) },
        orderBy: { createdAt: 'desc' },
    });
    (0, apiResponse_1.sendResponse)({ res, data: stakeholders });
}));
// POST /projects/:projectId/stakeholders
router.post('/:projectId/stakeholders', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stakeholder = await database_1.default.stakeholder.create({
        data: {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            company: req.body.company,
            role: req.body.role,
            influence: req.body.influence || 'MEDIUM',
            notes: req.body.notes,
            projectId: (0, params_1.p)(req.params.projectId),
        },
    });
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, message: 'Stakeholder added', data: stakeholder });
}));
// PATCH /projects/:projectId/stakeholders/:stakeholderId
router.patch('/:projectId/stakeholders/:stakeholderId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = {};
    if (req.body.name !== undefined)
        data.name = req.body.name;
    if (req.body.email !== undefined)
        data.email = req.body.email;
    if (req.body.phone !== undefined)
        data.phone = req.body.phone;
    if (req.body.company !== undefined)
        data.company = req.body.company;
    if (req.body.role !== undefined)
        data.role = req.body.role;
    if (req.body.influence !== undefined)
        data.influence = req.body.influence;
    if (req.body.notes !== undefined)
        data.notes = req.body.notes;
    const stakeholder = await database_1.default.stakeholder.update({
        where: { id: (0, params_1.p)(req.params.stakeholderId) },
        data,
    });
    (0, apiResponse_1.sendResponse)({ res, message: 'Stakeholder updated', data: stakeholder });
}));
// DELETE /projects/:projectId/stakeholders/:stakeholderId
router.delete('/:projectId/stakeholders/:stakeholderId', authorize_1.managerOrAbove, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.default.stakeholder.delete({ where: { id: (0, params_1.p)(req.params.stakeholderId) } });
    (0, apiResponse_1.sendResponse)({ res, message: 'Stakeholder removed' });
}));
exports.default = router;
//# sourceMappingURL=stakeholder.routes.js.map