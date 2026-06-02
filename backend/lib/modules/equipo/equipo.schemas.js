"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.miembroEquipoSchema = void 0;
const zod_1 = require("zod");
exports.miembroEquipoSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    rol: zod_1.z.enum(['admin', 'barbero', 'cajero']),
});
//# sourceMappingURL=equipo.schemas.js.map