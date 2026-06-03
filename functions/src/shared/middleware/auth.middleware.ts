import type { NextFunction, Request, Response } from 'express'
import { adminAuth } from '../../config/firebase'
import type { SucursalId } from '../types'

export async function authMiddleware(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    request.user = {
      id: decoded.uid,
      email: decoded.email ?? '',
      role: decoded['role'] ?? 'admin',
      sucursalesConAccesoCaja: (decoded['sucursalesConAccesoCaja'] as SucursalId[]) ?? [],
    }
    next()
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' })
  }
}
