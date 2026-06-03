"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicioSchema = void 0;
const zod_1 = require("zod");
exports.servicioSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1),
    precio: zod_1.z.number().nonnegative(),
    duracionMinutos: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=servicios.schemas.js.map