'use client'

export default function UsersPage() {
  const users = [
    { name: 'Super Admin', initials: 'SA', bg: '#e8f0fb', color: '#1A4FA0', email: 'admin@mafisere.com', role: 'Super Admin', roleClass: 'b-admin', status: 'Active', statusClass: 'b-active' },
    { name: 'Amaka Okonkwo', initials: 'AO', bg: '#e8f5e9', color: '#2e7d32', email: 'amaka@mafisere.com', role: 'Staff', roleClass: 'b-staff', status: 'Active', statusClass: 'b-active' },
    { name: 'Bello Adamu', initials: 'BA', bg: '#fff8e1', color: '#f57f17', email: 'bello@mafisere.com', role: 'Manager', roleClass: 'b-staff', status: 'Inactive', statusClass: 'b-inactive' },
  ]

  const permissions = [
    { permission: 'Upload listings', staff: 'Yes', manager: 'Yes', admin: 'Yes' },
    { permission: 'Edit listings', staff: 'No', manager: 'Yes', admin: 'Yes' },
    { permission: 'Delete listings', staff: 'No', manager: 'No', admin: 'Yes' },
    { permission: 'Manage users', staff: 'No', manager: 'No', admin: 'Yes' },
    { permission: 'View enquiries', staff: 'Yes', manager: 'Yes', admin: 'Yes' },
    { permission: 'Change settings', staff: 'No', manager: 'No', admin: 'Yes' },
  ]

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Users — Staff Accounts</span>
        <button className="sec-btn" onClick={() => document.getElementById('user-form')?.classList.toggle('hidden')}>+ Create New User</button>
      </div>

      <div id="user-form" className="card hidden" style={{marginBottom: 14}}>
        <div className="sec-hdr"><span className="sec-title">New User</span><span style={{fontSize:11,color:'var(--muted)',cursor:'pointer'}} onClick={() => document.getElementById('user-form')?.classList.toggle('hidden')}>Cancel</span></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="e.g. Amaka Nwosu"/></div>
          <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" placeholder="amaka@mafisere.com" type="email"/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Role</label>
            <select className="form-select">
              <option>Staff — Can upload listings</option>
              <option>Manager — Can edit &amp; delete</option>
              <option>Super Admin — Full access</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Temporary Password</label><input className="form-input" placeholder="They'll change on first login" type="password"/></div>
        </div>
        <button className="sec-btn" style={{marginTop: 4}}>Create User</button>
      </div>

      <div className="card">
        <table style={{tableLayout:'fixed',width:'100%'}}>
          <thead>
            <tr>
              <th style={{width:'30%'}}>Name</th>
              <th style={{width:'26%'}}>Email</th>
              <th style={{width:'16%'}}>Role</th>
              <th style={{width:'12%'}}>Status</th>
              <th style={{width:'16%'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td><div className="user-info"><div className="user-avatar" style={{background:u.bg,color:u.color}}>{u.initials}</div>{u.name}</div></td>
                <td style={{color:'var(--muted)'}}>{u.email}</td>
                <td><span className={`badge ${u.roleClass}`}>{u.role}</span></td>
                <td><span className={`badge ${u.statusClass}`}>{u.status}</span></td>
                <td>
                  <div className="row-acts">
                    <button className="abtn a-edit">Edit</button>
                    {u.role !== 'Super Admin' && <button className="abtn a-del">Remove</button>}
                    {u.role === 'Super Admin' && <button className="abtn a-reset">Reset PW</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{marginTop:14}}>
        <div className="sec-hdr"><span className="sec-title">Role Permissions</span></div>
        <table style={{tableLayout:'fixed',width:'100%'}}>
          <thead>
            <tr>
              <th style={{width:'40%'}}>Permission</th>
              <th style={{width:'20%'}}>Staff</th>
              <th style={{width:'20%'}}>Manager</th>
              <th style={{width:'20%'}}>Super Admin</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((p, i) => (
              <tr key={i}>
                <td>{p.permission}</td>
                <td><span className={`badge ${p.staff === 'Yes' ? 'b-live' : 'b-hidden'}`}>{p.staff}</span></td>
                <td><span className={`badge ${p.manager === 'Yes' ? 'b-live' : 'b-hidden'}`}>{p.manager}</span></td>
                <td><span className={`badge ${p.admin === 'Yes' ? 'b-live' : 'b-hidden'}`}>{p.admin}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
