import { Banknote, Boxes, CalendarDays, ContactRound, LogOut, Scissors, Users } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import barberHouseLogo from '../../assets/barber-house-logo.svg'
import { useAuth } from '../hooks/useAuth'

const allLinks = [
  { to: '/agenda', label: 'Agenda', Icon: CalendarDays, requiresCaja: false },
  { to: '/equipo', label: 'Equipo', Icon: Users, requiresCaja: false },
  { to: '/servicios', label: 'Servicios', Icon: Scissors, requiresCaja: false },
  { to: '/inventario', label: 'Stock', Icon: Boxes, requiresCaja: false },
  { to: '/clientes', label: 'Clientes', Icon: ContactRound, requiresCaja: false },
  { to: '/caja', label: 'Caja', Icon: Banknote, requiresCaja: true },
]

export function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const links = allLinks.filter(
    (link) => !link.requiresCaja || (user?.sucursalesConAccesoCaja ?? []).length > 0,
  )

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background pb-28 text-text-primary md:pb-0">
      <aside className="hidden border-b border-[#111111] bg-[#050505] px-4 py-4 md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-60 md:border-b-0 md:border-r md:py-6">
        <div className="mb-4 md:mb-8">
          <img
            alt="Barber House"
            className="mb-4 h-auto w-full rounded-lg border border-[#111111] bg-black object-contain"
            src={barberHouseLogo}
          />
          <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">Peluquería</p>
          <h1 className="mt-1 text-xl font-bold text-white">Administración</h1>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {links.map((link) => (
            <NavLink
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#f5c518] text-black'
                    : 'text-[#a0a0a0] hover:bg-[#111111] hover:text-white'
                }`
              }
              key={link.to}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            className="mt-auto flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-[#111111] hover:text-red-200"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </nav>
      </aside>
      <main className="min-h-screen p-4 md:ml-60 md:p-6">
        <Outlet />
      </main>
      <nav
        className={`fixed inset-x-2 bottom-3 z-40 grid rounded-[2rem] border border-[#2a2a2a] bg-[#050505]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur md:hidden`}
        style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
      >
        {links.map(({ to, label, Icon }) => (
          <NavLink
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[1.5rem] px-0.5 py-2 text-[9px] font-semibold transition ${
                isActive ? 'bg-[#f5c518] text-black' : 'text-[#a0a0a0] hover:text-white'
              }`
            }
            key={to}
            to={to}
          >
            <Icon aria-hidden="true" className="h-[14px] w-[14px]" strokeWidth={2.4} />
            <span className="w-full truncate text-center leading-tight">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
