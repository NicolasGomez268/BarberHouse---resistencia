"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agendaService = exports.AgendaService = void 0;
const agenda_repository_1 = require("./agenda.repository");
class AgendaService {
    list() {
        return agenda_repository_1.agendaRepository.findAll();
    }
    create(input) {
        return agenda_repository_1.agendaRepository.create(input);
    }
}
exports.AgendaService = AgendaService;
exports.agendaService = new AgendaService();
//# sourceMappingURL=agenda.service.js.map