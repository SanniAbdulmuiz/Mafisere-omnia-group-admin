'use client'

export default function GadgetsPage() {
  const gadgets = [
    { name: 'iPhone 15 Pro Max', category: 'iPhone', condition: 'New', storage: '256GB', price: '₦1,350,000', status: 'Live' },
    { name: 'iPhone 14', category: 'iPhone', condition: 'Used', storage: '128GB', price: '₦750,000', status: 'Live' },
    { name: 'iPad Pro 12.9"', category: 'Tablet', condition: 'New', storage: '256GB', price: '₦980,000', status: 'Hidden' },
    { name: 'AirPods Pro 2nd Gen', category: 'Accessory', condition: 'New', storage: '—', price: '₦180,000', status: 'Live' },
  ]

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Gadgets — All Listings</span>
        <button className="sec-btn">+ Upload New Gadget</button>
      </div>
      <div className="card">
        <table style={{tableLayout:'fixed',width:'100%'}}>
          <thead>
            <tr>
              <th style={{width:'28%'}}>Name</th>
              <th style={{width:'12%'}}>Type</th>
              <th style={{width:'11%'}}>Condition</th>
              <th style={{width:'10%'}}>Storage</th>
              <th style={{width:'14%'}}>Price</th>
              <th style={{width:'10%'}}>Status</th>
              <th style={{width:'15%'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gadgets.map((g, i) => (
              <tr key={i}>
                <td>{g.name}</td>
                <td><span className="badge b-gadget">{g.category}</span></td>
                <td><span className={`badge ${g.condition === 'New' ? 'b-new' : 'b-used'}`}>{g.condition}</span></td>
                <td>{g.storage}</td>
                <td>{g.price}</td>
                <td><span className={`badge ${g.status === 'Live' ? 'b-live' : 'b-hidden'}`}>{g.status}</span></td>
                <td>
                  <div className="row-acts">
                    <button className="abtn a-edit">Edit</button>
                    <button className="abtn a-tog">{g.status === 'Live' ? 'Hide' : 'Show'}</button>
                    <button className="abtn a-del">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
