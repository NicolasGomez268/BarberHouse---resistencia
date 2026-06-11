import { paquetesRepository } from '../paquetes/paquetes.repository'
import { cajaRepository } from './caja.repository'
import type { CajaDiariaParams, LiquidacionParams, MetricasParams } from './caja.schemas'

type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'

function emptyMontos(): Record<MetodoPago, number> {
  return { EFECTIVO: 0, TRANSFERENCIA: 0, TARJETA: 0 }
}

export class CajaService {
  async validarPin(pin: string): Promise<string[] | null> {
    return cajaRepository.validarPin(pin)
  }

  async calcularCajaDiaria(params: CajaDiariaParams) {
    const { fecha, sucursalId } = params
    const [turnos, ventas, paquetes, barberos, servicios, productos] = await Promise.all([
      cajaRepository.findTurnosRealizados(sucursalId, fecha, fecha),
      cajaRepository.findVentas(sucursalId, fecha, fecha),
      paquetesRepository.findByFecha(sucursalId, fecha, fecha),
      cajaRepository.getBarberos(),
      cajaRepository.getServicios(),
      cajaRepository.getProductos(),
    ])

    const serviciosPorMetodo = emptyMontos()
    const productosPorMetodo = emptyMontos()
    const paquetesPorMetodo = emptyMontos()

    const movimientos = [
      ...turnos.map((turno) => {
        const barbero = barberos.get(turno.barberoId)
        const servicio = servicios.get(turno.servicioId)
        const isPrepago = turno.metodoPago === 'PREPAGO' || turno.prepagado === true
        const isMixto = turno.metodoPago === 'MIXTO'
        const montoEfectivo = turno.montoEfectivo ?? 0
        const montoTransferencia = turno.montoTransferencia ?? 0
        let monto: number
        if (isPrepago) {
          monto = 0
        } else if (isMixto) {
          serviciosPorMetodo['EFECTIVO'] += montoEfectivo
          serviciosPorMetodo['TRANSFERENCIA'] += montoTransferencia
          monto = montoEfectivo + montoTransferencia
        } else {
          const metodo = turno.metodoPago as MetodoPago
          monto = servicio?.precio ?? 0
          serviciosPorMetodo[metodo] += monto
        }
        return {
          id: turno.id,
          tipo: 'servicio' as const,
          hora: turno.hora,
          descripcion: `${turno.clienteNombre} · ${servicio?.nombre ?? turno.servicioId}`,
          detalle: barbero?.nombre ?? turno.barberoId,
          monto,
          metodoPago: isPrepago ? 'PREPAGO' : turno.metodoPago,
          ...(isMixto && !isPrepago ? { montoEfectivo, montoTransferencia } : {}),
        }
      }),
      ...ventas.map((venta) => {
        const producto = productos.get(venta.productoId)
        const metodo = venta.metodoPago as MetodoPago
        productosPorMetodo[metodo] += venta.total
        return {
          id: venta.id,
          tipo: 'producto' as const,
          hora: venta.hora,
          descripcion: venta.productoNombre ?? producto?.nombre ?? venta.productoId,
          detalle: `${venta.cantidad} unidad${venta.cantidad === 1 ? '' : 'es'}`,
          monto: venta.total,
          metodoPago: metodo,
        }
      }),
    ].sort((a, b) => a.hora.localeCompare(b.hora))

    const paquetesMovimientos = paquetes.map((p) => {
      const isMixto = p.metodoPago === 'MIXTO'
      const montoEfectivo = p.montoEfectivo ?? 0
      const montoTransferencia = p.montoTransferencia ?? 0
      if (isMixto) {
        paquetesPorMetodo['EFECTIVO'] += montoEfectivo
        paquetesPorMetodo['TRANSFERENCIA'] += montoTransferencia
      } else {
        const metodo = p.metodoPago as MetodoPago
        paquetesPorMetodo[metodo] += p.precioTotal
      }
      return {
        id: p.id,
        tipo: 'paquete' as const,
        hora: p.hora,
        descripcion: `${p.clienteNombre} · Paquete ${p.cantidadTotal} turnos`,
        detalle: `Usado: ${p.cantidadUsada}/${p.cantidadTotal}`,
        monto: p.precioTotal,
        metodoPago: p.metodoPago,
        ...(isMixto ? { montoEfectivo, montoTransferencia } : {}),
      }
    })

    const totalServicios = Object.values(serviciosPorMetodo).reduce((sum, v) => sum + v, 0)
    const totalProductos = Object.values(productosPorMetodo).reduce((sum, v) => sum + v, 0)
    const totalPaquetes = Object.values(paquetesPorMetodo).reduce((sum, v) => sum + v, 0)

    return {
      turnosRealizados: turnos.length,
      ventasProductos: totalProductos,
      totalDia: totalServicios + totalProductos + totalPaquetes,
      serviciosPorMetodo,
      productosPorMetodo,
      paquetesPorMetodo,
      movimientos,
      paquetesMovimientos,
    }
  }

  async calcularLiquidacion(params: LiquidacionParams) {
    const { desde, hasta, sucursalId } = params
    const [turnos, barberos, servicios] = await Promise.all([
      cajaRepository.findTurnosRealizados(sucursalId, desde, hasta),
      cajaRepository.getBarberos(),
      cajaRepository.getServicios(),
    ])

    const rows = new Map<string, {
      barberoId: string
      barberoNombre: string
      turnosRealizados: number
      montoBruto: number
      comisionBarbero: number
      parteCasa: number
    }>()

    turnos.forEach((turno) => {
      const barbero = barberos.get(turno.barberoId)
      const servicio = servicios.get(turno.servicioId)
      const monto = servicio?.precio ?? 0
      const esDueno = barbero?.esDueno ?? false
      const porcentajeCasa = esDueno ? 0 : (barbero?.porcentajeCasa ?? 0)
      const parteCasa = monto * (porcentajeCasa / 100)
      const comisionBarbero = monto - parteCasa

      const current = rows.get(turno.barberoId) ?? {
        barberoId: turno.barberoId,
        barberoNombre: barbero?.nombre ?? turno.barberoId,
        turnosRealizados: 0,
        montoBruto: 0,
        comisionBarbero: 0,
        parteCasa: 0,
      }
      rows.set(turno.barberoId, {
        ...current,
        turnosRealizados: current.turnosRealizados + 1,
        montoBruto: current.montoBruto + monto,
        comisionBarbero: current.comisionBarbero + comisionBarbero,
        parteCasa: current.parteCasa + parteCasa,
      })
    })

    const filas = Array.from(rows.values())
    return {
      filas,
      totalBruto: filas.reduce((sum, row) => sum + row.montoBruto, 0),
      totalComisiones: filas.reduce((sum, row) => sum + row.comisionBarbero, 0),
      totalCasa: filas.reduce((sum, row) => sum + row.parteCasa, 0),
    }
  }

  async calcularMetricas(params: MetricasParams) {
    const { mes, anio, sucursalId } = params
    const monthKey = `${anio}-${String(mes).padStart(2, '0')}`
    const desde = `${monthKey}-01`
    const hasta = `${monthKey}-31`

    const [turnos, ventas, barberos, servicios, productos] = await Promise.all([
      cajaRepository.findTurnosRealizados(sucursalId, desde, hasta),
      cajaRepository.findVentas(sucursalId, desde, hasta),
      cajaRepository.getBarberos(),
      cajaRepository.getServicios(),
      cajaRepository.getProductos(),
    ])

    const serviciosMap = new Map<string, { servicio: string; cantidad: number; total: number }>()
    const barberosMap = new Map<string, { barberoId: string; barberoNombre: string; turnos: number; recaudado: number; comision: number }>()
    const productosMap = new Map<string, { producto: string; unidades: number; total: number }>()

    turnos.forEach((turno) => {
      const barbero = barberos.get(turno.barberoId)
      const servicio = servicios.get(turno.servicioId)
      const monto = servicio?.precio ?? 0
      const nombre = servicio?.nombre ?? turno.servicioId
      const esDueno = barbero?.esDueno ?? false
      const porcentajeCasa = barbero?.porcentajeCasa ?? 0
      const comision = esDueno ? monto : monto * ((100 - porcentajeCasa) / 100)

      const cs = serviciosMap.get(nombre) ?? { servicio: nombre, cantidad: 0, total: 0 }
      serviciosMap.set(nombre, { ...cs, cantidad: cs.cantidad + 1, total: cs.total + monto })

      const cb = barberosMap.get(turno.barberoId) ?? {
        barberoId: turno.barberoId,
        barberoNombre: barbero?.nombre ?? turno.barberoId,
        turnos: 0,
        recaudado: 0,
        comision: 0,
      }
      barberosMap.set(turno.barberoId, {
        ...cb,
        turnos: cb.turnos + 1,
        recaudado: cb.recaudado + monto,
        comision: cb.comision + comision,
      })
    })

    ventas.forEach((venta) => {
      const producto = productos.get(venta.productoId)
      const nombre = producto?.nombre ?? venta.productoId
      const cp = productosMap.get(nombre) ?? { producto: nombre, unidades: 0, total: 0 }
      productosMap.set(nombre, { ...cp, unidades: cp.unidades + venta.cantidad, total: cp.total + venta.total })
    })

    const totalServicios = turnos.reduce((sum, t) => sum + (servicios.get(t.servicioId)?.precio ?? 0), 0)
    const totalProductos = ventas.reduce((sum, v) => sum + v.total, 0)

    return {
      totalMes: totalServicios + totalProductos,
      totalServicios,
      totalProductos,
      turnosRealizados: turnos.length,
      servicios: Array.from(serviciosMap.values()).sort((a, b) => b.cantidad - a.cantidad),
      barberos: Array.from(barberosMap.values()).sort((a, b) => b.recaudado - a.recaudado),
      productos: Array.from(productosMap.values()).sort((a, b) => b.unidades - a.unidades),
    }
  }
}

export const cajaService = new CajaService()
