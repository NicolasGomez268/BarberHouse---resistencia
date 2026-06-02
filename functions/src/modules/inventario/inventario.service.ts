import { inventarioRepository } from './inventario.repository'
import type { ProductoInput } from './inventario.schemas'

export class InventarioService {
  list() {
    return inventarioRepository.findAll()
  }

  create(input: ProductoInput) {
    return inventarioRepository.create(input)
  }
}

export const inventarioService = new InventarioService()
