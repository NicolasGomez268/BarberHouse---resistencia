"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviciosService = exports.ServiciosService = void 0;
const servicios_repository_1 = require("./servicios.repository");
class ServiciosService {
    list() {
        return servicios_repository_1.serviciosRepository.findAll();
    }
    create(input) {
        return servicios_repository_1.serviciosRepository.create(input);
    }
}
exports.ServiciosService = ServiciosService;
exports.serviciosService = new ServiciosService();
//# sourceMappingURL=servicios.service.js.map