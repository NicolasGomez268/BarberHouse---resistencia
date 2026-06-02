"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cajaController = exports.CajaController = void 0;
const caja_schemas_1 = require("./caja.schemas");
const caja_service_1 = require("./caja.service");
class CajaController {
    list(_request, response) {
        response.json(caja_service_1.cajaService.list());
    }
    create(request, response) {
        const input = caja_schemas_1.movimientoCajaSchema.parse(request.body);
        response.status(201).json(caja_service_1.cajaService.create(input));
    }
}
exports.CajaController = CajaController;
exports.cajaController = new CajaController();
//# sourceMappingURL=caja.controller.js.map