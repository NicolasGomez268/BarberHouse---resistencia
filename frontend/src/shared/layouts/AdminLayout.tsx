import { Banknote, Boxes, CalendarDays, LogOut, Scissors, Users } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/agenda', label: 'Agenda', Icon: CalendarDays },
  { to: '/equipo', label: 'Equipo', Icon: Users },
  { to: '/servicios', label: 'Servicios', Icon: Scissors },
  { to: '/inventario', label: 'Stock', Icon: Boxes },
  { to: '/caja', label: 'Caja', Icon: Banknote },
]

export function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background pb-28 text-text-primary md:pb-0">
      <aside className="hidden border-b border-[#1f2937] bg-[#111827] px-4 py-4 md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-60 md:border-b-0 md:border-r md:py-6">
        <div className="mb-4 md:mb-8">
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
                    : 'text-[#a0a0a0] hover:bg-[#1f2937] hover:text-white'
                }`
              }
              key={link.to}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            className="mt-auto flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-[#1f2937] hover:text-red-200"
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
      <nav className="fixed inset-x-4 bottom-4 z-40 grid grid-cols-6 rounded-[2rem] border border-[#2a2a4a] bg-[#111827]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur md:hidden">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.5rem] px-2 py-3 text-xs font-semibold transition ${
                isActive ? 'bg-[#f5c518] text-black' : 'text-[#a0a0a0] hover:text-white'
              }`
            }
            key={to}
            to={to}
          >
            <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={2.4} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
        <button
          className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.5rem] px-2 py-3 text-xs font-semibold text-red-300 transition hover:text-red-200"
          onClick={handleLogout}
          type="button"
        >
          <LogOut aria-hidden="true" className="h-6 w-6" strokeWidth={2.4} />
          <span className="truncate">Salir</span>
        </button>
      </nav>
    </div>
  )
}
