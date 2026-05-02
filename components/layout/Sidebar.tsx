'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true
    if (path !== '/dashboard' && pathname.startsWith(path)) return true
    return false
  }

  const handleNav = (path: string) => {
    router.push(path)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/logo.png" alt="Mafisere" style={{width:32,height:32,borderRadius:6,objectFit:'contain'}} />
        <div className="brand-text">Mafisere Admin<span>Omnia Group Ltd</span></div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-label">Overview</div>
        <button
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => handleNav('/dashboard')}
        >
          <span className="nav-icon">▦</span> Dashboard
        </button>

        <div className="nav-label">Listings</div>
        <button
          className={`nav-item ${isActive('/gadgets') ? 'active' : ''}`}
          onClick={() => handleNav('/gadgets')}
        >
          <span className="nav-icon">📱</span> Gadgets
        </button>
        <button
          className={`nav-item ${isActive('/autos') ? 'active' : ''}`}
          onClick={() => handleNav('/autos')}
        >
          <span className="nav-icon">🚗</span> Autos
        </button>
        <button
          className={`nav-item ${isActive('/real-estate') ? 'active' : ''}`}
          onClick={() => handleNav('/real-estate')}
        >
          <span className="nav-icon">🏘</span> Real Estate
        </button>

        <div className="nav-label">Customers</div>
        <button
          className={`nav-item ${isActive('/enquiries') ? 'active' : ''}`}
          onClick={() => handleNav('/enquiries')}
        >
          <span className="nav-icon">✉</span> Enquiries
          <span className="nav-badge">4</span>
        </button>

        <div className="nav-label">Admin</div>
        <button
          className={`nav-item ${isActive('/users') ? 'active' : ''}`}
          onClick={() => handleNav('/users')}
        >
          <span className="nav-icon">👥</span> Users
        </button>
        <button
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => handleNav('/settings')}
        >
          <span className="nav-icon">⚙</span> Settings
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => {
          sessionStorage.removeItem('admin_auth')
          router.push('/')
        }}>
          <span className="nav-icon">⏻</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
