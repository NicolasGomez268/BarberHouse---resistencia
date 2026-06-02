"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turnoSchema = void 0;
const zod_1 = require("zod");
exports.turnoSchema = zod_1.z.object({
    cliente: zod_1.z.string().min(1),
    servicioId: zod_1.z.string().min(1),
    profesionalId: zod_1.z.string().min(1),
    fechaInicio: zod_1.z.string().min(1),
});
//# sourceMappingURL=agenda.schemas.js.map