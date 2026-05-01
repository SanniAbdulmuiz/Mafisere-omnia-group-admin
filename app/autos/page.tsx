'use client'

export default function AutosPage() {
  const autos = [
    { name: 'Toyota Camry Full Option', year: '2020', condition: 'Foreign', price: '₦18,500,000', status: 'Live' },
    { name: 'Honda Accord Sport', year: '2019', condition: 'Nigerian', price: '₦12,000,000', status: 'Live' },
  ]

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Autos — All Listings</span>
        <button className="sec-btn">+ Upload New Auto</button>
      </div>
      <div className="card">
        <table style={{tableLayout:'fixed',width:'100%'}}>
          <thead>
            <tr>
              <th style={{width:'28%'}}>Name</th>
              <th style={{width:'10%'}}>Year</th>
              <th style={{width:'13%'}}>Condition</th>
              <th style={{width:'16%'}}>Price</th>
              <th style={{width:'10%'}}>Status</th>
              <th style={{width:'23%'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {autos.map((a, i) => (
              <tr key={i}>
                <td>{a.name}</td>
                <td>{a.year}</td>
                <td><span className={`badge ${a.condition === 'Foreign' ? 'b-new' : 'b-used'}`}>{a.condition}</span></td>
                <td>{a.price}</td>
                <td><span className={`badge ${a.status === 'Live' ? 'b-live' : 'b-hidden'}`}>{a.status}</span></td>
                <td>
                  <div className="row-acts">
                    <button className="abtn a-edit">Edit</button>
                    <button className="abtn a-tog">{a.status === 'Live' ? 'Hide' : 'Show'}</button>
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
