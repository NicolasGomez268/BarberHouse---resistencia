import type { Servicio } from '../types'

export const MOCK_SERVICIOS: Servicio[] = [
  { id: 'srv-1', nombre: 'Corte de Cabello', descripcion: 'Corte clásico a tijera o máquina', precio: 8000, duracionMinutos: 30, activo: true },
  { id: 'srv-2', nombre: 'Corte + Barba', descripcion: 'Corte de cabello más arreglo de barba completo', precio: 13000, duracionMinutos: 45, activo: true },
  { id: 'srv-3', nombre: 'Arreglo de Barba', descripcion: 'Perfilado y arreglo de barba con navaja', precio: 6000, duracionMinutos: 20, activo: true },
  { id: 'srv-4', nombre: 'Coloración', descripcion: 'Coloración completa con productos premium', precio: 18000, duracionMinutos: 90, activo: true },
  { id: 'srv-5', nombre: 'Alisado', descripcion: 'Alisado keratina duración 3 meses', precio: 35000, duracionMinutos: 120, activo: true },
  { id: 'srv-6', nombre: 'Depilación Facial', descripcion: 'Depilación de cejas y zona facial', precio: 5000, duracionMinutos: 25, activo: true },
  { id: 'srv-7', nombre: 'Tratamiento Capilar', descripcion: 'Hidratación y nutrición profunda', precio: 12000, duracionMinutos: 60, activo: false },
]

export const serviciosMock: Servicio[] = MOCK_SERVICIOS
