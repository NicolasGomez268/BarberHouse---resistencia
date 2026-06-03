"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipoController = exports.EquipoController = void 0;
const equipo_schemas_1 = require("./equipo.schemas");
const equipo_service_1 = require("./equipo.service");
class EquipoController {
    list(_request, response) {
        response.json(equipo_service_1.equipoService.list());
    }
    create(request, response) {
        const input = equipo_schemas_1.miembroEquipoSchema.parse(request.body);
        response.status(201).json(equipo_service_1.equipoService.create(input));
    }
}
exports.EquipoController = EquipoController;
exports.equipoController = new EquipoController();
//# sourceMappingURL=equipo.controller.js.map