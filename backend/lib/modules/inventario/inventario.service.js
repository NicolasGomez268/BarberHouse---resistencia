"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventarioService = exports.InventarioService = void 0;
const inventario_repository_1 = require("./inventario.repository");
class InventarioService {
    list() {
        return inventario_repository_1.inventarioRepository.findAll();
    }
    create(input) {
        return inventario_repository_1.inventarioRepository.create(input);
    }
}
exports.InventarioService = InventarioService;
exports.inventarioService = new InventarioService();
//# sourceMappingURL=inventario.service.js.map