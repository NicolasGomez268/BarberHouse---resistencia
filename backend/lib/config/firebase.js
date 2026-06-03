"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.firestore = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
function initApp() {
    if (firebase_admin_1.default.apps.length > 0)
        return firebase_admin_1.default.app();
    // En emulador: el Functions runner inyecta GCLOUD_PROJECT, FIREBASE_CONFIG
    // y las variables de emulador (FIRESTORE_EMULATOR_HOST, etc.) automaticamente.
    // En produccion: Cloud Functions provee el service account del entorno.
    // En ambos casos admin.initializeApp() sin args resuelve todo.
    return firebase_admin_1.default.initializeApp();
}
const firebaseApp = initApp();
exports.firestore = firebaseApp.firestore();
exports.adminAuth = firebase_admin_1.default.auth(firebaseApp);
//# sourceMappingURL=firebase.js.map