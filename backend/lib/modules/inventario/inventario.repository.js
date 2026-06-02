"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventarioRepository = exports.InventarioRepository = void 0;
class InventarioRepository {
    findAll() {
        return [];
    }
    create(input) {
        return { id: crypto.randomUUID(), ...input };
    }
}
exports.InventarioRepository = InventarioRepository;
exports.inventarioRepository = new InventarioRepository();
//# sourceMappingURL=inventario.repository.js.map