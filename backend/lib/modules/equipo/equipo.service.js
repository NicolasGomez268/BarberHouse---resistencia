"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipoService = exports.EquipoService = void 0;
const equipo_repository_1 = require("./equipo.repository");
class EquipoService {
    list() {
        return equipo_repository_1.equipoRepository.findAll();
    }
    create(input) {
        return equipo_repository_1.equipoRepository.create(input);
    }
}
exports.EquipoService = EquipoService;
exports.equipoService = new EquipoService();
//# sourceMappingURL=equipo.service.js.map