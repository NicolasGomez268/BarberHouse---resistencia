"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviciosRepository = exports.ServiciosRepository = void 0;
class ServiciosRepository {
    findAll() {
        return [];
    }
    create(input) {
        return { id: crypto.randomUUID(), ...input };
    }
}
exports.ServiciosRepository = ServiciosRepository;
exports.serviciosRepository = new ServiciosRepository();
//# sourceMappingURL=servicios.repository.js.map