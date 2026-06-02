"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productoSchema = void 0;
const zod_1 = require("zod");
exports.productoSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1),
    stock: zod_1.z.number().int().nonnegative(),
    stockMinimo: zod_1.z.number().int().nonnegative(),
});
//# sourceMappingURL=inventario.schemas.js.map