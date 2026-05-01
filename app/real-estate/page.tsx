'use client'

export default function RealEstatePage() {
  const properties = [
    { name: '3-Bed Terrace', type: 'House', location: 'Lekki, Lagos', price: '₦85,000,000', status: 'Live' },
    { name: '500sqm Land', type: 'Land', location: 'Ibeju, Lagos', price: '₦15,000,000', status: 'Live' },
  ]

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Real Estate — All Listings</span>
        <button className="sec-btn">+ Upload New Property</button>
      </div>
      <div className="card">
        <table style={{tableLayout:'fixed',width:'100%'}}>
          <thead>
            <tr>
              <th style={{width:'26%'}}>Property</th>
              <th style={{width:'11%'}}>Type</th>
              <th style={{width:'16%'}}>Location</th>
              <th style={{width:'16%'}}>Price</th>
              <th style={{width:'10%'}}>Status</th>
              <th style={{width:'21%'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p, i) => (
              <tr key={i}>
                <td>{p.name}</td>
                <td><span className="badge b-estate">{p.type}</span></td>
                <td>{p.location}</td>
                <td>{p.price}</td>
                <td><span className={`badge ${p.status === 'Live' ? 'b-live' : 'b-hidden'}`}>{p.status}</span></td>
                <td>
                  <div className="row-acts">
                    <button className="abtn a-edit">Edit</button>
                    <button className="abtn a-tog">{p.status === 'Live' ? 'Hide' : 'Show'}</button>
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
