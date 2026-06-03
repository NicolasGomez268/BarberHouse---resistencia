"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventarioController = exports.InventarioController = void 0;
const inventario_schemas_1 = require("./inventario.schemas");
const inventario_service_1 = require("./inventario.service");
class InventarioController {
    list(_request, response) {
        response.json(inventario_service_1.inventarioService.list());
    }
    create(request, response) {
        const input = inventario_schemas_1.productoSchema.parse(request.body);
        response.status(201).json(inventario_service_1.inventarioService.create(input));
    }
}
exports.InventarioController = InventarioController;
exports.inventarioController = new InventarioController();
//# sourceMappingURL=inventario.controller.js.map