'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChartBarIcon, 
  DevicePhoneMobileIcon, 
  TruckIcon, 
  HomeIcon, 
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import ActivityChart from '@/components/ActivityChart'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getRecentListings, getListingStats } from '@/lib/fetchListings'

type Listing = {
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

export default function Dashboard() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (!auth) router.push('/')
  }, [router])

  useEffect(() => {
    async function fetchData() {
      try {
        const [listingsData, statsData] = await Promise.all([
          getRecentListings(4),
          getListingStats()
        ])
        setListings(listingsData)
        setStats(statsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `₦${(price / 1000).toFixed(0)}K`
    return `₦${price}`
  }

  const getCategoryBadge = (item: Listing) => {
    const badges: Record<string, { label: string; class: string }> = {
      gadget: { label: 'Gadget', class: 'b-gadget' },
      auto: { label: 'Auto', class: 'b-auto' },
      real_estate: { label: 'Estate', class: 'b-estate' }
    }
    return badges[item.type]
  }

  const getStatusBadge = (isAvailable: boolean) => {
    return isAvailable ? { label: 'Live', class: 'b-live' } : { label: 'Hidden', class: 'b-hidden' }
  }

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon" style={{background:'#1A4FA0'}}>
            <ChartBarIcon className="w-5 h-5" style={{color: '#fff'}} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.total || 0}</div>
            <div className="stat-label">Total Listings</div>
            <div className="stat-sub">All categories</div>
          </div>
        </div>
        <div className="stat-card stat-gadgets">
          <div className="stat-icon" style={{background:'#e8f0fb'}}>
            <DevicePhoneMobileIcon className="w-5 h-5" style={{color: '#1A4FA0'}} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.gadgets || 0}</div>
            <div className="stat-label">Gadgets</div>
            <div className="stat-sub">{stats?.gadgetsAvailable || 0} available</div>
          </div>
        </div>
        <div className="stat-card stat-autos">
          <div className="stat-icon" style={{background:'#e8f5e9'}}>
            <TruckIcon className="w-5 h-5" style={{color: '#2e7d32'}} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.autos || 0}</div>
            <div className="stat-label">Autos</div>
            <div className="stat-sub">{stats?.autosAvailable || 0} available</div>
          </div>
        </div>
        <div className="stat-card stat-estate">
          <div className="stat-icon" style={{background:'#fff8e1'}}>
            <HomeIcon className="w-5 h-5" style={{color: '#e65100'}} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.realEstate || 0}</div>
            <div className="stat-label">Real Estate</div>
            <div className="stat-sub">{stats?.realEstateAvailable || 0} available</div>
          </div>
        </div>
      </div>

      <ActivityChart />

      <div className="two-col">
        <div className="card">
          <div className="sec-hdr">
            <span className="sec-title">Recent Listings</span>
          </div>
          {listings.length === 0 ? (
            <p style={{color:'var(--muted)',fontSize:13,padding:'20px 0',textAlign:'center'}}>No listings yet</p>
          ) : (
            <table style={{tableLayout:'fixed',width:'100%'}}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Cat</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(item => {
                  const cat = getCategoryBadge(item)
                  const status = getStatusBadge(item.is_available)
                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td><span className={`badge ${cat.class}`}>{cat.label}</span></td>
                      <td>{formatPrice(item.price)}</td>
                      <td><span className={`badge ${status.class}`}>{status.label}</span></td>
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
            <button 
              onClick={() => router.push('/enquiries')}
              style={{
                fontSize:11,
                color:'var(--blue)',
                cursor:'pointer',
                background:'var(--blue-light)',
                border:'none',
                padding:'4px 10px',
                borderRadius:4,
                fontWeight:500,
                display:'flex',
                alignItems:'center',
                gap:4,
                fontFamily:'inherit'
              }}
            >
              View all
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="enq-item">
            <div className="enq-top">
              <span className="enq-name">Chukwuemeka Obi</span>
              <span className="enq-time">2 hrs ago</span>
            </div>
            <div className="enq-prod">iPhone 15 Pro Max</div>
            <div className="enq-msg">Is this still available? Can we negotiate?</div>
          </div>
          <div className="enq-item">
            <div className="enq-top">
              <span className="enq-name">Amina Bello</span>
              <span className="enq-time">5 hrs ago</span>
            </div>
            <div className="enq-prod">Toyota Camry 2020</div>
            <div className="enq-msg">Please call me, very interested in the car.</div>
          </div>
          <div className="enq-item">
            <div className="enq-top">
              <span className="enq-name">Tunde Adeyemi</span>
              <span className="enq-time">Yesterday</span>
            </div>
            <div className="enq-prod">3-Bed Terrace Lekki</div>
            <div className="enq-msg">What documents are available for this?</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec-hdr">
          <span className="sec-title">Quick Actions</span>
        </div>
        <div className="quick-grid">
          <button className="qbtn" onClick={() => router.push('/gadgets')}>
            <span className="qbtn-icon"><DevicePhoneMobileIcon className="w-5 h-5" style={{color: '#1A4FA0'}} /></span>
            <span className="qbtn-label">Upload Gadget</span>
            <div className="qbtn-sub">iPhone, tablet, accessory</div>
          </button>
          <button className="qbtn" onClick={() => router.push('/autos')}>
            <span className="qbtn-icon"><TruckIcon className="w-5 h-5" style={{color: '#2e7d32'}} /></span>
            <span className="qbtn-label">Upload Auto</span>
            <div className="qbtn-sub">Add a car listing</div>
          </button>
          <button className="qbtn" onClick={() => router.push('/real-estate')}>
            <span className="qbtn-icon"><HomeIcon className="w-5 h-5" style={{color: '#e65100'}} /></span>
            <span className="qbtn-label">Upload Property</span>
            <div className="qbtn-sub">Land or building</div>
          </button>
          <button className="qbtn" onClick={() => router.push('/settings')}>
            <span className="qbtn-icon"><Cog6ToothIcon className="w-5 h-5" style={{color: '#5a6a85'}} /></span>
            <span className="qbtn-label">Settings</span>
            <div className="qbtn-sub">Update settings</div>
          </button>
        </div>
      </div>
    </div>
  )
}