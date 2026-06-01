import { cajaRepository } from './caja.repository'
import type { MovimientoCajaInput } from './caja.schemas'

export class CajaService {
  list() {
    return cajaRepository.findAll()
  }

  create(input: MovimientoCajaInput) {
    return cajaRepository.create(input)
  }
}

export const cajaService = new CajaService()
