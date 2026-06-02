import { useState } from 'react'
import { cajaMock } from '../../../mocks/caja.mock'
import type {
  CajaDiariaResumen,
  CajaMovimiento,
  LiquidacionBarbero,
  LiquidacionResumen,
  MetricasMensualesResumen,
  MetricaBarbero,
  MetricaProducto,
  MetricaServicio,
  MontosPorMetodo,
  SucursalId,
} from '../../../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

function emptyPaymentTotals(): MontosPorMetodo {
  return {
    efectivo: 0,
    transferencia: 0,
    tarjeta: 0,
  }
}

function isBetweenDates(date: string, from: string, to: string) {
  return date >= from && date <= to
}

export function useCaja() {
  const [pinValido, setPinValido] = useState(false)
  const [sucursalesDesbloqueadas, setSucursalesDesbloqueadas] = useState<SucursalId[]>([])

  function validarPin(pin: string): string | null {
    if (!USE_MOCKS) {
      // TODO: reemplazar por validación real contra API.
      return 'La conexión real de Caja todavía no está configurada.'
    }

    const sucursales = cajaMock.pines[pin]
    if (!sucursales) {
      setPinValido(false)
      setSucursalesDesbloqueadas([])
      return 'PIN incorrecto. Intentá nuevamente.'
    }

    setPinValido(true)
    setSucursalesDesbloqueadas(sucursales)
    return null
  }

  function calcularCajaDiaria(fecha: string, sucursalId: SucursalId): CajaDiariaResumen {
    const turnos = cajaMock.turnos.filter((turno) => turno.fecha === fecha && turno.sucursalId === sucursalId)
    const ventas = cajaMock.ventas.filter((venta) => venta.fecha === fecha && venta.sucursalId === sucursalId)
    const serviciosPorMetodo = emptyPaymentTotals()
    const productosPorMetodo = emptyPaymentTotals()

    turnos.forEach((turno) => {
      serviciosPorMetodo[turno.metodoPago] += turno.monto
    })

    ventas.forEach((venta) => {
      productosPorMetodo[venta.metodoPago] += venta.monto
    })

    const movimientos: CajaMovimiento[] = [
      ...turnos.map((turno) => ({
        id: turno.id,
        tipo: 'servicio' as const,
        hora: turno.hora,
        descripcion: `${turno.cliente} · ${turno.servicio}`,
        detalle: turno.barberoNombre,
        monto: turno.monto,
        metodoPago: turno.metodoPago,
      })),
      ...ventas.map((venta) => ({
        id: venta.id,
        tipo: 'producto' as const,
        hora: venta.hora,
        descripcion: venta.producto,
        detalle: `${venta.cantidad} unidad${venta.cantidad === 1 ? '' : 'es'}`,
        monto: venta.monto,
        metodoPago: venta.metodoPago,
      })),
    ].sort((first, second) => first.hora.localeCompare(second.hora))

    const totalServicios = turnos.reduce((total, turno) => total + turno.monto, 0)
    const ventasProductos = ventas.reduce((total, venta) => total + venta.monto, 0)

    return {
      turnosRealizados: turnos.length,
      ventasProductos,
      totalDia: totalServicios + ventasProductos,
      serviciosPorMetodo,
      productosPorMetodo,
      movimientos,
    }
  }

  function calcularLiquidacion(desde: string, hasta: string, sucursalId: SucursalId): LiquidacionResumen {
    const rows = new Map<string, LiquidacionBarbero>()
    const turnos = cajaMock.turnos.filter(
      (turno) => turno.sucursalId === sucursalId && isBetweenDates(turno.fecha, desde, hasta),
    )

    turnos.forEach((turno) => {
      const current = rows.get(turno.barberoId) ?? {
        barberoId: turno.barberoId,
        barberoNombre: turno.barberoNombre,
        turnosRealizados: 0,
        montoBruto: 0,
        comisionBarbero: 0,
        parteCasa: 0,
      }
      const parteCasa = turno.monto * (turno.porcentajeCasa / 100)
      const comisionBarbero = turno.monto - parteCasa

      rows.set(turno.barberoId, {
        ...current,
        turnosRealizados: current.turnosRealizados + 1,
        montoBruto: current.montoBruto + turno.monto,
        comisionBarbero: current.comisionBarbero + comisionBarbero,
        parteCasa: current.parteCasa + parteCasa,
      })
    })

    const filas = Array.from(rows.values())

    return {
      filas,
      totalBruto: filas.reduce((total, row) => total + row.montoBruto, 0),
      totalComisiones: filas.reduce((total, row) => total + row.comisionBarbero, 0),
      totalCasa: filas.reduce((total, row) => total + row.parteCasa, 0),
    }
  }

  function calcularMetricas(mes: number, anio: number, sucursalId: SucursalId): MetricasMensualesResumen {
    const monthKey = `${anio}-${String(mes).padStart(2, '0')}`
    const turnos = cajaMock.turnos.filter((turno) => turno.sucursalId === sucursalId && turno.fecha.startsWith(monthKey))
    const ventas = cajaMock.ventas.filter((venta) => venta.sucursalId === sucursalId && venta.fecha.startsWith(monthKey))
    const servicios = new Map<string, MetricaServicio>()
    const barberos = new Map<string, MetricaBarbero>()
    const productos = new Map<string, MetricaProducto>()

    turnos.forEach((turno) => {
      const service = servicios.get(turno.servicio) ?? { servicio: turno.servicio, cantidad: 0, total: 0 }
      servicios.set(turno.servicio, {
        ...service,
        cantidad: service.cantidad + 1,
        total: service.total + turno.monto,
      })

      const barber = barberos.get(turno.barberoId) ?? {
        barberoId: turno.barberoId,
        barberoNombre: turno.barberoNombre,
        turnos: 0,
        recaudado: 0,
        comision: 0,
      }
      barberos.set(turno.barberoId, {
        ...barber,
        turnos: barber.turnos + 1,
        recaudado: barber.recaudado + turno.monto,
        comision: barber.comision + turno.monto * ((100 - turno.porcentajeCasa) / 100),
      })
    })

    ventas.forEach((venta) => {
      const product = productos.get(venta.producto) ?? { producto: venta.producto, unidades: 0, total: 0 }
      productos.set(venta.producto, {
        ...product,
        unidades: product.unidades + venta.cantidad,
        total: product.total + venta.monto,
      })
    })

    const totalServicios = turnos.reduce((total, turno) => total + turno.monto, 0)
    const totalProductos = ventas.reduce((total, venta) => total + venta.monto, 0)

    return {
      totalMes: totalServicios + totalProductos,
      totalServicios,
      totalProductos,
      turnosRealizados: turnos.length,
      servicios: Array.from(servicios.values()).sort((first, second) => second.cantidad - first.cantidad),
      barberos: Array.from(barberos.values()).sort((first, second) => second.recaudado - first.recaudado),
      productos: Array.from(productos.values()).sort((first, second) => second.unidades - first.unidades),
    }
  }

  return {
    pinValido,
    sucursalesDesbloqueadas,
    sucursales: cajaMock.sucursales,
    validarPin,
    calcularCajaDiaria,
    calcularLiquidacion,
    calcularMetricas,
  }
}
