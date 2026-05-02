'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/gadgets': 'Gadgets',
  '/autos': 'Autos',
  '/real-estate': 'Real Estate',
  '/enquiries': 'Enquiries',
  '/users': 'Users',
  '/settings': 'Settings',
}

interface TopbarProps {
  onMenuClick?: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const [date, setDate] = useState('')

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    )
  }, [])

  const title = titles[pathname] || 'Dashboard'

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
        <span className="topbar-title">{title}</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{date}</span>
        <span className="admin-pill">Super Admin</span>
      </div>
    </div>
  )
}