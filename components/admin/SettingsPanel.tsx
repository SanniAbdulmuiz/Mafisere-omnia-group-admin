'use client'

import { useMemo, useState, useTransition } from 'react'
import { saveBusinessSettings } from '@/lib/admin/actions'
import type { BusinessSettings } from '@/lib/admin/queries'

type SettingsForm = Required<Omit<BusinessSettings, 'id' | 'updated_at'>>

const defaultSettings: SettingsForm = {
  business_name: 'Mafisere Omnia Group Ltd',
  phone_1: '07084680224',
  phone_2: '08101458546',
  email: 'mafisereomnagroup@gmail.com',
  address: '12 Adepele Street, Computer Village, Ikeja',
  show_enquiry_button: true,
  whatsapp_chat_widget: true,
  show_sold_items: false,
  maintenance_mode: false,
}

function normalizeSettings(settings: BusinessSettings): SettingsForm {
  return {
    ...defaultSettings,
    business_name: settings.business_name ?? defaultSettings.business_name,
    phone_1: settings.phone_1 ?? defaultSettings.phone_1,
    phone_2: settings.phone_2 ?? defaultSettings.phone_2,
    email: settings.email ?? defaultSettings.email,
    address: settings.address ?? defaultSettings.address,
    show_enquiry_button: settings.show_enquiry_button ?? defaultSettings.show_enquiry_button,
    whatsapp_chat_widget: settings.whatsapp_chat_widget ?? defaultSettings.whatsapp_chat_widget,
    show_sold_items: settings.show_sold_items ?? defaultSettings.show_sold_items,
    maintenance_mode: settings.maintenance_mode ?? defaultSettings.maintenance_mode,
  }
}

function formatUpdatedAt(value?: string) {
  if (!value) return 'Not saved yet'
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function SettingsPanel({ settings }: { settings: BusinessSettings }) {
  const initialForm = useMemo(() => normalizeSettings(settings), [settings])
  const [form, setForm] = useState<SettingsForm>(initialForm)
  const [savedForm, setSavedForm] = useState<SettingsForm>(initialForm)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' })
  const [isPending, startTransition] = useTransition()
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm)
  const canSave = isDirty && !isPending && form.business_name.trim().length > 0

  function updateField(name: keyof SettingsForm, value: string | boolean) {
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
      if (result.success) setSavedForm(form)
    })
  }

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Settings</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sec-btn-outline" onClick={() => setForm(savedForm)} disabled={!isDirty || isPending} type="button">
            Reset
          </button>
          <button className="sec-btn" onClick={handleSave} disabled={!canSave} type="button">
            {isPending ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>
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
            <div className="sec-hdr" style={{ marginBottom: 4 }}><span className="sec-title">Operational Status</span></div>
            <div className="settings-row">
              <div>
                <div className="settings-key">Storefront mode</div>
                <div className="settings-val">{form.maintenance_mode ? 'Customer site should show maintenance state' : 'Customer site should accept traffic'}</div>
              </div>
              <span className={`badge ${form.maintenance_mode ? 'b-hidden' : 'b-live'}`}>{form.maintenance_mode ? 'Maintenance' : 'Live'}</span>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-key">Last saved</div>
                <div className="settings-val">{formatUpdatedAt(settings.updated_at)}</div>
              </div>
              <span className={`badge ${isDirty ? 'b-used' : 'b-live'}`}>{isDirty ? 'Unsaved' : 'Synced'}</span>
            </div>
          </div>

          <div className="danger-zone">
            <div className="danger-title">Deferred Admin Controls</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
              Password changes, user management, and destructive enquiry actions should be enabled after the auth and role system is in place.
            </div>
            <button className="abtn a-reset" disabled style={{ padding: '6px 14px', fontSize: 11 }} type="button">Requires Auth Pass</button>
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
