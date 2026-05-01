'use client'

export default function EnquiriesPage() {
  const enquiries = [
    { name: 'Chukwuemeka Obi', time: 'Today 2:14 PM', product: 'Re: iPhone 15 Pro Max — ₦1,350,000', msg: 'Is this still available? Can we negotiate the price? I\'m ready to pay cash.' },
    { name: 'Amina Bello', time: 'Today 10:45 AM', product: 'Re: Toyota Camry 2020 — ₦18,500,000', msg: 'Please call me on 08034XXXXXX. Want to see it this weekend.' },
    { name: 'Tunde Adeyemi', time: 'Yesterday 4:30 PM', product: 'Re: 3-Bed Terrace Lekki — ₦85,000,000', msg: 'What documents are available? Is it C of O or Governor\'s Consent?' },
    { name: 'Ngozi Eze', time: 'Yesterday 9:00 AM', product: 'Re: iPad Pro 12.9" — ₦980,000', msg: 'Does it come with Apple Pencil? What\'s the warranty situation?' },
  ]

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Customer Enquiries</span>
        <span style={{fontSize:'11px',color:'var(--muted)'}}>4 unread</span>
      </div>
      <div className="card">
        {enquiries.map((e, i) => (
          <div key={i} className="enq-item">
            <div className="enq-top">
              <span className="enq-name">{e.name}</span>
              <span className="enq-time">{e.time}</span>
            </div>
            <div className="enq-prod">{e.product}</div>
            <div className="enq-msg">{e.msg}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
