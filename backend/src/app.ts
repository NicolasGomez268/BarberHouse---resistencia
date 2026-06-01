import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { agendaRouter } from './modules/agenda/agenda.router'
import { authRouter } from './modules/auth/auth.router'
import { cajaRouter } from './modules/caja/caja.router'
import { equipoRouter } from './modules/equipo/equipo.router'
import { inventarioRouter } from './modules/inventario/inventario.router'
import { serviciosRouter } from './modules/servicios/servicios.router'
import { errorMiddleware } from './shared/middleware/error.middleware'

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/agenda', agendaRouter)
app.use('/api/equipo', equipoRouter)
app.use('/api/servicios', serviciosRouter)
app.use('/api/inventario', inventarioRouter)
app.use('/api/caja', cajaRouter)
app.use(errorMiddleware)

app.listen(port, () => {
  console.log(`API running on port ${port}`)
})

export { app }
