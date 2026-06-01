import type { Sucursal } from '../../types'

const defaultSucursal: Sucursal = {
  id: 'principal',
  nombre: 'Sucursal principal',
}

export function useSucursal() {
  return {
    sucursal: defaultSucursal,
  }
}
