"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const params_1 = require("../../utils/params");
const auth_1 = require("../../middleware/auth");
const upload_1 = require("../../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', upload_1.uploadSingle, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const file = req.file;
    if (!file) {
        (0, apiResponse_1.sendResponse)({ res, statusCode: 400, message: 'No file uploaded' });
        return;
    }
    (0, apiResponse_1.sendResponse)({ res, statusCode: 201, data: {
            id: file.filename,
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            fileSize: file.size,
        } });
}));
router.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // In a real system, you would delete the physical file and the DB record.
    (0, apiResponse_1.sendResponse)({ res, message: 'Upload deleted' });
}));
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    (0, apiResponse_1.sendResponse)({ res, data: { id: (0, params_1.p)(req.params.id) } });
}));
exports.default = router;
//# sourceMappingURL=upload.routes.js.map