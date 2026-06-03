"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cajaRouter = void 0;
const express_1 = require("express");
const caja_controller_1 = require("./caja.controller");
exports.cajaRouter = (0, express_1.Router)();
exports.cajaRouter.get('/', (request, response) => caja_controller_1.cajaController.list(request, response));
exports.cajaRouter.post('/', (request, response) => caja_controller_1.cajaController.create(request, response));
//# sourceMappingURL=caja.router.js.map