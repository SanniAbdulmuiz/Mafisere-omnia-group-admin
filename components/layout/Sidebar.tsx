'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  ChartPieIcon, 
  DevicePhoneMobileIcon, 
  TruckIcon, 
  HomeIcon, 
  EnvelopeIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true
    if (path !== '/dashboard' && pathname.startsWith(path)) return true
    return false
  }

  const handleNav = (path: string) => {
    router.push(path)
    onClose?.()
  }

  const sidebarClass = 'sidebar' + (isOpen ? ' sidebar-open' : '')

  return (
    <aside className={sidebarClass}>
      <div className="sidebar-brand">
        <img src="/logo.png" alt="Mafisere" style={{width:32,height:32,borderRadius:6,objectFit:'contain'}} />
        <div className="brand-text">Mafisere Admin<span>Omnia Group Ltd</span></div>
      </div>
      <button className="sidebar-close" onClick={onClose}>×</button>
      <nav className="sidebar-nav">
        <div className="nav-label">Overview</div>
        <button
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => handleNav('/dashboard')}
        >
          <ChartPieIcon className="w-5 h-5" /> Dashboard
        </button>

        <div className="nav-label">Listings</div>
        <button
          className={`nav-item ${isActive('/gadgets') ? 'active' : ''}`}
          onClick={() => handleNav('/gadgets')}
        >
          <DevicePhoneMobileIcon className="w-5 h-5" /> Gadgets
        </button>
        <button
          className={`nav-item ${isActive('/autos') ? 'active' : ''}`}
          onClick={() => handleNav('/autos')}
        >
          <TruckIcon className="w-5 h-5" /> Autos
        </button>
        <button
          className={`nav-item ${isActive('/real-estate') ? 'active' : ''}`}
          onClick={() => handleNav('/real-estate')}
        >
          <HomeIcon className="w-5 h-5" /> Real Estate
        </button>

        <div className="nav-label">Customers</div>
        <button
          className={`nav-item ${isActive('/enquiries') ? 'active' : ''}`}
          onClick={() => handleNav('/enquiries')}
        >
          <EnvelopeIcon className="w-5 h-5" /> Enquiries
          <span className="nav-badge">4</span>
        </button>

        <div className="nav-label">Admin</div>
        <button
          className={`nav-item ${isActive('/users') ? 'active' : ''}`}
          onClick={() => handleNav('/users')}
        >
          <UsersIcon className="w-5 h-5" /> Users
        </button>
        <button
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => handleNav('/settings')}
        >
          <Cog6ToothIcon className="w-5 h-5" /> Settings
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => {
          sessionStorage.removeItem('admin_auth')
          router.push('/')
        }}>
          <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>
  )
}