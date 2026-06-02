import type { ProductoInput } from './inventario.schemas'

export class InventarioRepository {
  findAll() {
    return []
  }

  create(input: ProductoInput) {
    return { id: crypto.randomUUID(), ...input }
  }
}

export const inventarioRepository = new InventarioRepository()
