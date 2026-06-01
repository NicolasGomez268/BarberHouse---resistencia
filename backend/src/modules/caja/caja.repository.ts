import type { MovimientoCajaInput } from './caja.schemas'

export class CajaRepository {
  findAll() {
    return []
  }

  create(input: MovimientoCajaInput) {
    return { id: crypto.randomUUID(), ...input, fecha: new Date().toISOString() }
  }
}

export const cajaRepository = new CajaRepository()
