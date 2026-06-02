"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agendaRepository = exports.AgendaRepository = void 0;
class AgendaRepository {
    findAll() {
        return [];
    }
    create(input) {
        return { id: crypto.randomUUID(), ...input, estado: 'pendiente' };
    }
}
exports.AgendaRepository = AgendaRepository;
exports.agendaRepository = new AgendaRepository();
//# sourceMappingURL=agenda.repository.js.map