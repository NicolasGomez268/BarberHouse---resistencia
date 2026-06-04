import { inventarioRepository } from './inventario.repository'
import type { AjusteStockInput, ProductoInput, ProductoUpdateInput, VentaInput } from './inventario.schemas'

export class InventarioService {
  list() {
    return inventarioRepository.findAll()
  }

  create(input: ProductoInput) {
    return inventarioRepository.create(input)
  }

  update(id: string, input: ProductoUpdateInput) {
    return inventarioRepository.update(id, input)
  }

  delete(id: string) {
    return inventarioRepository.delete(id)
  }

  ajustarStock(id: string, input: AjusteStockInput) {
    return inventarioRepository.ajustarStock(id, input)
  }

  registrarVenta(input: VentaInput) {
    return inventarioRepository.registrarVenta(input)
  }
}

export const inventarioService = new InventarioService()
