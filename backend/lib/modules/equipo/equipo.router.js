"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipoRouter = void 0;
const express_1 = require("express");
const equipo_controller_1 = require("./equipo.controller");
exports.equipoRouter = (0, express_1.Router)();
exports.equipoRouter.get('/', (request, response) => equipo_controller_1.equipoController.list(request, response));
exports.equipoRouter.post('/', (request, response) => equipo_controller_1.equipoController.create(request, response));
//# sourceMappingURL=equipo.router.js.map