import cors from 'cors'
import express from 'express'
import { agendaRouter } from './modules/agenda/agenda.router'
import { authRouter } from './modules/auth/auth.router'
import { cajaRouter } from './modules/caja/caja.router'
import { equipoRouter } from './modules/equipo/equipo.router'
import { inventarioRouter } from './modules/inventario/inventario.router'
import { serviciosRouter } from './modules/servicios/servicios.router'
import { errorMiddleware } from './shared/middleware/error.middleware'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/auth', authRouter)
app.use('/agenda', agendaRouter)
app.use('/equipo', equipoRouter)
app.use('/servicios', serviciosRouter)
app.use('/inventario', inventarioRouter)
app.use('/caja', cajaRouter)
app.use(errorMiddleware)

export { app }
