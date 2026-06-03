"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const agenda_router_1 = require("./modules/agenda/agenda.router");
const auth_router_1 = require("./modules/auth/auth.router");
const caja_router_1 = require("./modules/caja/caja.router");
const equipo_router_1 = require("./modules/equipo/equipo.router");
const inventario_router_1 = require("./modules/inventario/inventario.router");
const servicios_router_1 = require("./modules/servicios/servicios.router");
const error_middleware_1 = require("./shared/middleware/error.middleware");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN }));
app.use(express_1.default.json());
app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
});
app.use('/auth', auth_router_1.authRouter);
app.use('/agenda', agenda_router_1.agendaRouter);
app.use('/equipo', equipo_router_1.equipoRouter);
app.use('/servicios', servicios_router_1.serviciosRouter);
app.use('/inventario', inventario_router_1.inventarioRouter);
app.use('/caja', caja_router_1.cajaRouter);
app.use(error_middleware_1.errorMiddleware);
//# sourceMappingURL=app.js.map