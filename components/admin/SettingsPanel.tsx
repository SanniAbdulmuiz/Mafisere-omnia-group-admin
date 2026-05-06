'use client'

import { useState, useTransition } from 'react'
import { saveBusinessSettings } from '@/lib/admin/actions'
import type { BusinessSettings } from '@/lib/admin/queries'

const defaultSettings: Required<Omit<BusinessSettings, 'id'>> = {
  business_name: '',
  phone_1: '',
  phone_2: '',
  email: '',
  address: '',
  show_enquiry_button: true,
  whatsapp_chat_widget: true,
  show_sold_items: false,
  maintenance_mode: false,
}

export default function SettingsPanel({ settings }: { settings: BusinessSettings }) {
  const [form, setForm] = useState({ ...defaultSettings, ...settings })
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' })
  const [isPending, startTransition] = useTransition()

  function updateField(name: keyof BusinessSettings, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSave() {
    setMessage({ text: '', type: 'success' })
    startTransition(async () => {
      const result = await saveBusinessSettings(form)
      setMessage({
        text: result.message,
        type: result.success ? 'success' : 'error',
      })
    })
  }

  return (
    <div>
      <div className="sec-hdr"><span className="sec-title">Settings</span></div>
      {message.text && (
        <div className="card" style={{
          marginBottom: 14,
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#15803d' : '#b91c1c',
        }}>
          {message.text}
        </div>
      )}
      <div className="two-col">
        <div className="card">
          <div className="sec-hdr" style={{ marginBottom: 0 }}><span className="sec-title">Business Info</span></div>
          <div className="settings-section" style={{ marginTop: 12 }}>
            <Input label="Business Name" value={form.business_name} onChange={(value) => updateField('business_name', value)} />
            <Input label="Phone 1" value={form.phone_1} onChange={(value) => updateField('phone_1', value)} />
            <Input label="Phone 2" value={form.phone_2} onChange={(value) => updateField('phone_2', value)} />
            <Input label="Email" value={form.email} onChange={(value) => updateField('email', value)} type="email" />
            <Input label="Address" value={form.address} onChange={(value) => updateField('address', value)} />
            <button className="sec-btn" onClick={handleSave} disabled={isPending} type="button">
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="sec-hdr" style={{ marginBottom: 4 }}><span className="sec-title">Site Preferences</span></div>
            <Toggle label="Show enquiry button" detail="Display on all product pages" value={form.show_enquiry_button} onChange={(value) => updateField('show_enquiry_button', value)} />
            <Toggle label="Whatsapp chat widget" detail="Floating chat on customer site" value={form.whatsapp_chat_widget} onChange={(value) => updateField('whatsapp_chat_widget', value)} />
            <Toggle label="Show sold items" detail="Display unavailable listings" value={form.show_sold_items} onChange={(value) => updateField('show_sold_items', value)} />
            <Toggle label="Maintenance mode" detail="Take customer site offline" value={form.maintenance_mode} onChange={(value) => updateField('maintenance_mode', value)} />
          </div>

          <div className="card">
            <div className="sec-hdr" style={{ marginBottom: 4 }}><span className="sec-title">Change Admin Password</span></div>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" placeholder="Enter current password" /></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="Enter new password" /></div>
            <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Repeat new password" /></div>
            <button className="sec-btn" disabled type="button">Handle With Auth Pass</button>
          </div>

          <div className="danger-zone">
            <div className="danger-title">Danger Zone</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>These actions are irreversible. Proceed with extreme caution.</div>
            <button className="abtn a-del" disabled style={{ padding: '6px 14px', fontSize: 11 }} type="button">Handle With Enquiry Workflow</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" value={value} onChange={(event) => onChange(event.target.value)} type={type} />
    </div>
  )
}

function Toggle({
  label,
  detail,
  value,
  onChange,
}: {
  label: string
  detail: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-key">{label}</div>
        <div className="settings-val">{detail}</div>
      </div>
      <button className={`toggle ${value ? 'on' : 'off'}`} onClick={() => onChange(!value)} type="button" />
    </div>
  )
}
