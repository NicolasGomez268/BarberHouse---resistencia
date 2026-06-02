"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movimientoCajaSchema = void 0;
const zod_1 = require("zod");
exports.movimientoCajaSchema = zod_1.z.object({
    concepto: zod_1.z.string().min(1),
    monto: zod_1.z.number(),
    tipo: zod_1.z.enum(['ingreso', 'egreso']),
});
//# sourceMappingURL=caja.schemas.js.map