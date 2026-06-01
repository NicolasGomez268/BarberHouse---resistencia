import admin from 'firebase-admin'
import 'dotenv/config'

export function getFirebaseApp() {
  if (admin.apps.length > 0) {
    return admin.app()
  }

  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}

export const firestore = getFirebaseApp().firestore()
