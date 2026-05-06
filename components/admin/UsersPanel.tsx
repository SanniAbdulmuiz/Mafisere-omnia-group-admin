'use client'

import { useMemo, useState } from 'react'
import type { AdminUser } from '@/lib/admin/queries'

const permissions = [
  { permission: 'Upload listings', staff: 'Yes', manager: 'Yes', admin: 'Yes' },
  { permission: 'Edit listings', staff: 'No', manager: 'Yes', admin: 'Yes' },
  { permission: 'Delete listings', staff: 'No', manager: 'No', admin: 'Yes' },
  { permission: 'Manage users', staff: 'No', manager: 'No', admin: 'Yes' },
  { permission: 'View enquiries', staff: 'Yes', manager: 'Yes', admin: 'Yes' },
  { permission: 'Change settings', staff: 'No', manager: 'No', admin: 'Yes' },
]

export default function UsersPanel({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [showForm, setShowForm] = useState(false)
  const users = useMemo(() => initialUsers, [initialUsers])

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Users - Staff Accounts</span>
        <button className="sec-btn" onClick={() => setShowForm(true)} type="button">+ Create New User</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="sec-hdr">
            <span className="sec-title">New User</span>
            <button className="sec-btn-outline" onClick={() => setShowForm(false)} type="button">Cancel</button>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Full name" /></div>
            <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" placeholder="name@company.com" type="email" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-select">
                <option>Staff</option>
                <option>Manager</option>
                <option>Super Admin</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Temporary Password</label><input className="form-input" placeholder="Temporary password" type="password" /></div>
          </div>
          <button className="sec-btn" type="button">Create User</button>
        </div>
      )}

      <div className="card">
        {users.length === 0 ? (
          <div style={{ padding: 32, color: 'var(--muted)', textAlign: 'center' }}>
            No staff records are connected yet.
          </div>
        ) : (
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Name</th>
                <th style={{ width: '26%' }}>Email</th>
                <th style={{ width: '16%' }}>Role</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '16%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td style={{ color: 'var(--muted)' }}>{user.email}</td>
                  <td><span className={`badge ${user.role === 'Super Admin' ? 'b-admin' : 'b-staff'}`}>{user.role}</span></td>
                  <td><span className={`badge ${user.status === 'Active' ? 'b-active' : 'b-inactive'}`}>{user.status}</span></td>
                  <td>
                    <div className="row-acts">
                      <button className="abtn a-edit" type="button">Edit</button>
                      {user.role !== 'Super Admin' && <button className="abtn a-del" type="button">Remove</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="sec-hdr"><span className="sec-title">Role Permissions</span></div>
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Permission</th>
              <th style={{ width: '20%' }}>Staff</th>
              <th style={{ width: '20%' }}>Manager</th>
              <th style={{ width: '20%' }}>Super Admin</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.permission}>
                <td>{permission.permission}</td>
                <td><span className={`badge ${permission.staff === 'Yes' ? 'b-live' : 'b-hidden'}`}>{permission.staff}</span></td>
                <td><span className={`badge ${permission.manager === 'Yes' ? 'b-live' : 'b-hidden'}`}>{permission.manager}</span></td>
                <td><span className={`badge ${permission.admin === 'Yes' ? 'b-live' : 'b-hidden'}`}>{permission.admin}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
