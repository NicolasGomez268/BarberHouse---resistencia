"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agendaController = exports.AgendaController = void 0;
const agenda_schemas_1 = require("./agenda.schemas");
const agenda_service_1 = require("./agenda.service");
class AgendaController {
    list(_request, response) {
        response.json(agenda_service_1.agendaService.list());
    }
    create(request, response) {
        const input = agenda_schemas_1.turnoSchema.parse(request.body);
        response.status(201).json(agenda_service_1.agendaService.create(input));
    }
}
exports.AgendaController = AgendaController;
exports.agendaController = new AgendaController();
//# sourceMappingURL=agenda.controller.js.map