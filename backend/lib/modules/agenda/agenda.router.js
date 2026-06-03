"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agendaRouter = void 0;
const express_1 = require("express");
const agenda_controller_1 = require("./agenda.controller");
exports.agendaRouter = (0, express_1.Router)();
exports.agendaRouter.get('/', (request, response) => agenda_controller_1.agendaController.list(request, response));
exports.agendaRouter.post('/', (request, response) => agenda_controller_1.agendaController.create(request, response));
//# sourceMappingURL=agenda.router.js.map