"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviciosRouter = void 0;
const express_1 = require("express");
const servicios_controller_1 = require("./servicios.controller");
exports.serviciosRouter = (0, express_1.Router)();
exports.serviciosRouter.get('/', (request, response) => servicios_controller_1.serviciosController.list(request, response));
exports.serviciosRouter.post('/', (request, response) => servicios_controller_1.serviciosController.create(request, response));
//# sourceMappingURL=servicios.router.js.map