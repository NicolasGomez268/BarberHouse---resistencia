"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipoRepository = exports.EquipoRepository = void 0;
class EquipoRepository {
    findAll() {
        return [];
    }
    create(input) {
        return { id: crypto.randomUUID(), ...input };
    }
}
exports.EquipoRepository = EquipoRepository;
exports.equipoRepository = new EquipoRepository();
//# sourceMappingURL=equipo.repository.js.map