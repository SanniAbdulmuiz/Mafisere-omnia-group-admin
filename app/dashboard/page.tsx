'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (!auth) router.push('/')
  }, [router])

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card hl">
          <div className="stat-label">Total Listings</div>
          <div className="stat-value">24</div>
          <div className="stat-sub">All categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gadgets</div>
          <div className="stat-value">12</div>
          <div className="stat-sub">10 available</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Autos</div>
          <div className="stat-value">7</div>
          <div className="stat-sub">6 available</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Real Estate</div>
          <div className="stat-value">5</div>
          <div className="stat-sub">5 available</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="sec-hdr">
            <span className="sec-title">Recent Listings</span>
          </div>
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
              <tr>
                <td>iPhone 15 Pro Max</td>
                <td><span className="badge b-gadget">Gadget</span></td>
                <td>₦1.35M</td>
                <td><span className="badge b-live">Live</span></td>
              </tr>
              <tr>
                <td>Toyota Camry 2020</td>
                <td><span className="badge b-auto">Auto</span></td>
                <td>₦18.5M</td>
                <td><span className="badge b-live">Live</span></td>
              </tr>
              <tr>
                <td>3-Bed Terrace Lekki</td>
                <td><span className="badge b-estate">Estate</span></td>
                <td>₦85M</td>
                <td><span className="badge b-live">Live</span></td>
              </tr>
              <tr>
                <td>iPad Pro 12.9"</td>
                <td><span className="badge b-gadget">Gadget</span></td>
                <td>₦980K</td>
                <td><span className="badge b-hidden">Hidden</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="sec-hdr">
            <span className="sec-title">Recent Enquiries</span>
            <span style={{fontSize:11,color:'var(--blue)',cursor:'pointer'}} onClick={() => router.push('/enquiries')}>View all</span>
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
            <span className="qbtn-icon">📱</span>
            <span className="qbtn-label">Upload Gadget</span>
            <div className="qbtn-sub">iPhone, tablet, accessory</div>
          </button>
          <button className="qbtn" onClick={() => router.push('/autos')}>
            <span className="qbtn-icon">🚗</span>
            <span className="qbtn-label">Upload Auto</span>
            <div className="qbtn-sub">Add a car listing</div>
          </button>
          <button className="qbtn" onClick={() => router.push('/real-estate')}>
            <span className="qbtn-icon">🏘</span>
            <span className="qbtn-label">Upload Property</span>
            <div className="qbtn-sub">Land or building</div>
          </button>
        </div>
      </div>
    </div>
  )
}
