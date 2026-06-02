"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
class AuthService {
    login(input) {
        return {
            token: input.token,
            user: null,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map