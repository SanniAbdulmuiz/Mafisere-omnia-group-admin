'use client'

export default function SettingsPage() {
  return (
    <div>
      <div className="sec-hdr"><span className="sec-title">Settings</span></div>
      <div className="two-col">
        <div className="card">
          <div className="sec-hdr" style={{marginBottom:0}}><span className="sec-title">Business Info</span></div>
          <div className="settings-section" style={{marginTop:12}}>
            <div className="form-group"><label className="form-label">Business Name</label><input className="form-input" defaultValue="Mafisere Omnia Group Ltd"/></div>
            <div className="form-group"><label className="form-label">Phone 1</label><input className="form-input" defaultValue="07084680224"/></div>
            <div className="form-group"><label className="form-label">Phone 2</label><input className="form-input" defaultValue="08101458546"/></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="mafisereomnagroup@gmail.com" type="email"/></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" defaultValue="12 Adepele Street, Computer Village, Ikeja"/></div>
            <button className="sec-btn">Save Changes</button>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="card">
            <div className="sec-hdr" style={{marginBottom:4}}><span className="sec-title">Site Preferences</span></div>
            <div className="settings-row">
              <div><div className="settings-key">Show enquiry button</div><div className="settings-val">Display on all product pages</div></div>
              <button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on') || e.currentTarget.classList.toggle('off')}></button>
            </div>
            <div className="settings-row">
              <div><div className="settings-key">Whatsapp chat widget</div><div className="settings-val">Floating chat on customer site</div></div>
              <button className="toggle on" onClick={e => e.currentTarget.classList.toggle('on') || e.currentTarget.classList.toggle('off')}></button>
            </div>
            <div className="settings-row">
              <div><div className="settings-key">Show sold items</div><div className="settings-val">Display unavailable listings</div></div>
              <button className="toggle off" onClick={e => e.currentTarget.classList.toggle('on') || e.currentTarget.classList.toggle('off')}></button>
            </div>
            <div className="settings-row">
              <div><div className="settings-key">Maintenance mode</div><div className="settings-val">Take customer site offline</div></div>
              <button className="toggle off" onClick={e => e.currentTarget.classList.toggle('on') || e.currentTarget.classList.toggle('off')}></button>
            </div>
          </div>

          <div className="card">
            <div className="sec-hdr" style={{marginBottom:4}}><span className="sec-title">Change Admin Password</span></div>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" placeholder="Enter current password"/></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="Enter new password"/></div>
            <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Repeat new password"/></div>
            <button className="sec-btn">Update Password</button>
          </div>

          <div className="danger-zone">
            <div className="danger-title">Danger Zone</div>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:10}}>These actions are irreversible. Proceed with extreme caution.</div>
            <button className="abtn a-del" style={{padding:'6px 14px',fontSize:11}}>Clear All Enquiries</button>
          </div>
        </div>
      </div>
    </div>
  )
}
