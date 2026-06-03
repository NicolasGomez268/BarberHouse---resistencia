"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviciosController = exports.ServiciosController = void 0;
const servicios_schemas_1 = require("./servicios.schemas");
const servicios_service_1 = require("./servicios.service");
class ServiciosController {
    list(_request, response) {
        response.json(servicios_service_1.serviciosService.list());
    }
    create(request, response) {
        const input = servicios_schemas_1.servicioSchema.parse(request.body);
        response.status(201).json(servicios_service_1.serviciosService.create(input));
    }
}
exports.ServiciosController = ServiciosController;
exports.serviciosController = new ServiciosController();
//# sourceMappingURL=servicios.controller.js.map