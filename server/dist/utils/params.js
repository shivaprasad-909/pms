"use strict";
// ============================================
// Express v5 Type Augmentation
// ============================================
// In Express v5, req.params values are string | string[].
// This provides a helper to safely extract string params.
Object.defineProperty(exports, "__esModule", { value: true });
exports.p = void 0;
const p = (val) => {
    if (Array.isArray(val))
        return val[0] || '';
    return val || '';
};
exports.p = p;
//# sourceMappingURL=params.js.map