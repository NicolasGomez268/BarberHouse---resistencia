"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_schemas_1 = require("./auth.schemas");
const auth_service_1 = require("./auth.service");
class AuthController {
    login(request, response) {
        const input = auth_schemas_1.loginSchema.parse(request.body);
        response.json(auth_service_1.authService.login(input));
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map