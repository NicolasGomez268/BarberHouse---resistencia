"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cajaService = exports.CajaService = void 0;
const caja_repository_1 = require("./caja.repository");
class CajaService {
    list() {
        return caja_repository_1.cajaRepository.findAll();
    }
    create(input) {
        return caja_repository_1.cajaRepository.create(input);
    }
}
exports.CajaService = CajaService;
exports.cajaService = new CajaService();
//# sourceMappingURL=caja.service.js.map