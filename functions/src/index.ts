import { onRequest } from 'firebase-functions/v2/https'
import { app } from './app'

export const api = onRequest({ region: 'southamerica-west1' }, app)
