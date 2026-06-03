"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
function errorMiddleware(error, _request, response, _next) {
    if (error instanceof zod_1.ZodError) {
        response.status(400).json({ error: 'Validation error', issues: error.issues });
        return;
    }
    response.status(500).json({ error: 'Internal server error' });
}
//# sourceMappingURL=error.middleware.js.map