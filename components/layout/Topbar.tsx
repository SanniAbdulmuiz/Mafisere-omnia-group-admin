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

export default function Topbar() {
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
      <span className="topbar-title">{title}</span>
      <div className="topbar-right">
        <span className="topbar-date">{date}</span>
        <span className="admin-pill">Super Admin</span>
      </div>
    </div>
  )
}
