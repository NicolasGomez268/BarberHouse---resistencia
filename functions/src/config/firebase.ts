import admin from 'firebase-admin'

function initApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.app()

  // En emulador: el Functions runner inyecta GCLOUD_PROJECT, FIREBASE_CONFIG
  // y las variables de emulador (FIRESTORE_EMULATOR_HOST, etc.) automaticamente.
  // En produccion: Cloud Functions provee el service account del entorno.
  // En ambos casos admin.initializeApp() sin args resuelve todo.
  return admin.initializeApp()
}

const firebaseApp = initApp()

const firestoreInstance = firebaseApp.firestore()
firestoreInstance.settings({ ignoreUndefinedProperties: true })

export const firestore = firestoreInstance
export const adminAuth = admin.auth(firebaseApp)
