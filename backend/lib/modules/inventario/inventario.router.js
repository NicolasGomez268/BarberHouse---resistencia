"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventarioRouter = void 0;
const express_1 = require("express");
const inventario_controller_1 = require("./inventario.controller");
exports.inventarioRouter = (0, express_1.Router)();
exports.inventarioRouter.get('/', (request, response) => inventario_controller_1.inventarioController.list(request, response));
exports.inventarioRouter.post('/', (request, response) => inventario_controller_1.inventarioController.create(request, response));
//# sourceMappingURL=inventario.router.js.map