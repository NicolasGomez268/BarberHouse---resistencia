"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cajaRepository = exports.CajaRepository = void 0;
class CajaRepository {
    findAll() {
        return [];
    }
    create(input) {
        return { id: crypto.randomUUID(), ...input, fecha: new Date().toISOString() };
    }
}
exports.CajaRepository = CajaRepository;
exports.cajaRepository = new CajaRepository();
//# sourceMappingURL=caja.repository.js.map