"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
});
//# sourceMappingURL=auth.schemas.js.map