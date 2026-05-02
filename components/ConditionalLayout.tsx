'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="content">
          {children}
        </div>
      </div>
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}