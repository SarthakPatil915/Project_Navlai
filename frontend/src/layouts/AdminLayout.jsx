import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/app/store'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  QrCode,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/enrollments', icon: Ticket, label: 'Enrollments' },
  { to: '/admin/scan-qr', icon: QrCode, label: 'Scan QR' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-neutral-200 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
            <NavLink to="/" className="text-xl font-semibold text-neutral-900">
              Navlai Admin
            </NavLink>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 hover:bg-neutral-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarLinks.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
            
            <hr className="my-4 border-neutral-200" />
            
            <NavLink
              to="/"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <Home className="h-5 w-5" />
              Back to Site
            </NavLink>
          </nav>

          {/* User info & Logout */}
          <div className="border-t border-neutral-200 p-4">
            <div className="mb-3 px-3">
              <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-500">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 hover:bg-neutral-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-600">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
