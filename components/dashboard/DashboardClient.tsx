'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChartBarIcon,
  Cog6ToothIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  HomeIcon,
  TruckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import ActivityChart from '@/components/ActivityChart'

type RecentListing = {
  id: string
  name: string
  category: string
  price: number
  is_available: boolean
  type: 'gadget' | 'auto' | 'real_estate'
}

type Stats = {
  total: number
  gadgets: number
  gadgetsAvailable: number
  autos: number
  autosAvailable: number
  realEstate: number
  realEstateAvailable: number
}

type ActivityPoint = {
  day: string
  gadgets: number
  autos: number
  realEstate: number
}

type Props = {
  listings: RecentListing[]
  stats: Stats
  activityData: ActivityPoint[]
}

function formatPrice(price: number) {
  if (price >= 1000000) return `NGN ${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `NGN ${(price / 1000).toFixed(0)}K`
  return `NGN ${price}`
}

function getCategoryBadge(item: RecentListing) {
  const badges: Record<RecentListing['type'], { label: string; className: string }> = {
    gadget: { label: 'Gadget', className: 'b-gadget' },
    auto: { label: 'Auto', className: 'b-auto' },
    real_estate: { label: 'Estate', className: 'b-estate' },
  }
  return badges[item.type]
}

function getStatusBadge(isAvailable: boolean) {
  return isAvailable ? { label: 'Live', className: 'b-live' } : { label: 'Hidden', className: 'b-hidden' }
}

export default function DashboardClient({ listings, stats, activityData }: Props) {
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (!auth) router.push('/')
  }, [router])

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon" style={{ background: '#1A4FA0' }}>
            <ChartBarIcon className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Listings</div>
            <div className="stat-sub">All categories</div>
          </div>
        </div>
        <div className="stat-card stat-gadgets">
          <div className="stat-icon" style={{ background: '#e8f0fb' }}>
            <DevicePhoneMobileIcon className="w-5 h-5" style={{ color: '#1A4FA0' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.gadgets}</div>
            <div className="stat-label">Gadgets</div>
            <div className="stat-sub">{stats.gadgetsAvailable} available</div>
          </div>
        </div>
        <div className="stat-card stat-autos">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>
            <TruckIcon className="w-5 h-5" style={{ color: '#2e7d32' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.autos}</div>
            <div className="stat-label">Autos</div>
            <div className="stat-sub">{stats.autosAvailable} available</div>
          </div>
        </div>
        <div className="stat-card stat-estate">
          <div className="stat-icon" style={{ background: '#fff8e1' }}>
            <HomeIcon className="w-5 h-5" style={{ color: '#e65100' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.realEstate}</div>
            <div className="stat-label">Real Estate</div>
            <div className="stat-sub">{stats.realEstateAvailable} available</div>
          </div>
        </div>
      </div>

      <ActivityChart data={activityData} />

      <div className="two-col">
        <div className="card">
          <div className="sec-hdr">
            <span className="sec-title">Recent Listings</span>
          </div>
          {listings.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No listings yet</p>
          ) : (
            <table style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Cat</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((item) => {
                  const cat = getCategoryBadge(item)
                  const status = getStatusBadge(item.is_available)
                  return (
                    <tr key={`${item.type}-${item.id}`}>
                      <td>{item.name}</td>
                      <td><span className={`badge ${cat.className}`}>{cat.label}</span></td>
                      <td>{formatPrice(item.price)}</td>
                      <td><span className={`badge ${status.className}`}>{status.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="sec-hdr">
            <span className="sec-title">Recent Enquiries</span>
            <button className="sec-btn-outline" onClick={() => router.push('/enquiries')} type="button">View all</button>
          </div>
          <div className="enq-item">
            <div className="enq-top">
              <span className="enq-name">No live enquiry source</span>
              <span className="enq-time">Pending setup</span>
            </div>
            <div className="enq-msg">Connect the customer enquiry table to populate this panel.</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec-hdr">
          <span className="sec-title">Quick Actions</span>
        </div>
        <div className="quick-grid">
          <QuickAction label="Gadgets" sub="Upload device" path="/gadgets" icon={<DevicePhoneMobileIcon className="w-5 h-5" style={{ color: '#1A4FA0' }} />} routerPush={router.push} bg="#eff6ff" />
          <QuickAction label="Autos" sub="Add vehicle" path="/autos" icon={<TruckIcon className="w-5 h-5" style={{ color: '#059669' }} />} routerPush={router.push} bg="#ecfdf5" />
          <QuickAction label="Property" sub="List estate" path="/real-estate" icon={<HomeIcon className="w-5 h-5" style={{ color: '#ea580c' }} />} routerPush={router.push} bg="#fff7ed" />
          <QuickAction label="Enquiries" sub="Messages" path="/enquiries" icon={<EnvelopeIcon className="w-5 h-5" style={{ color: '#ca8a04' }} />} routerPush={router.push} bg="#fefce8" />
          <QuickAction label="Users" sub="Manage staff" path="/users" icon={<UsersIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />} routerPush={router.push} bg="#f5f3ff" />
          <QuickAction label="Settings" sub="Configure" path="/settings" icon={<Cog6ToothIcon className="w-5 h-5" style={{ color: '#64748b' }} />} routerPush={router.push} bg="#f1f5f9" />
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  label,
  sub,
  path,
  icon,
  bg,
  routerPush,
}: {
  label: string
  sub: string
  path: string
  icon: ReactNode
  bg: string
  routerPush: (href: string) => void
}) {
  return (
    <button className="qbtn" onClick={() => routerPush(path)} type="button">
      <span className="qbtn-icon" style={{ background: bg }}>{icon}</span>
      <span className="qbtn-label">{label}</span>
      <div className="qbtn-sub">{sub}</div>
    </button>
  )
}
