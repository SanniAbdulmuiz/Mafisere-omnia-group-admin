'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { handleGadgetUpload } from '@/lib/uploadMedia'
import { EllipsisVerticalIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Gadget {
  id: number
  name: string
  category: string
  condition: string
  storage: string | null
  price: number
  description: string | null
  images: string[]
  video_url: string | null
  is_available: boolean
  created_at: string
}

export default function GadgetsPage() {
  const [gadgets, setGadgets] = useState<Gadget[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [editingGadget, setEditingGadget] = useState<Gadget | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const [form, setForm] = useState({
    name: '',
    category: 'iphone',
    condition: 'new',
    storage: '',
    price: '',
    description: ''
  })
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [uploading, setUploading] = useState('')

  useEffect(() => { fetchGadgets() }, [])

  useEffect(() => {
    if (!openMenuId) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenuId(null) }
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.action-dropdown')) setOpenMenuId(null)
    }
    document.addEventListener('keydown', handleEsc)
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.removeEventListener('click', handleClick)
    }
  }, [openMenuId])

  async function fetchGadgets() {
    const { data, error } = await supabase.from('gadgets').select('*').order('created_at', { ascending: false })
    if (!error && data) setGadgets(data)
    setLoading(false)
  }

  async function toggleStatus(gadget: Gadget) {
    await supabase.from('gadgets').update({ is_available: !gadget.is_available }).eq('id', gadget.id)
    fetchGadgets()
  }

  async function deleteGadget(id: number) {
    if (!confirm('Delete this gadget?')) return
    await supabase.from('gadgets').delete().eq('id', id)
    fetchGadgets()
  }

  function openEditModal(gadget: Gadget) {
    setEditingGadget(gadget)
    setForm({
      name: gadget.name,
      category: gadget.category.toLowerCase(),
      condition: gadget.condition.toLowerCase(),
      storage: gadget.storage || '',
      price: gadget.price.toString(),
      description: gadget.description || ''
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingGadget(null)
    setForm({ name: '', category: 'iphone', condition: 'new', storage: '', price: '', description: '' })
    setMessage({ text: '', type: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      setMessage({ text: 'Please fill in required fields', type: 'error' })
      return
    }

    setSaving(true)
    setUploading('')
    setMessage({ text: '', type: '' })

    try {
      if (editingGadget) {
        const { error } = await supabase.from('gadgets').update({
          name: form.name.trim(),
          category: form.category.toLowerCase(),
          condition: form.condition.charAt(0).toUpperCase() + form.condition.slice(1),
          storage: form.storage || null,
          price: parseFloat(form.price),
          description: form.description || null
        }).eq('id', editingGadget.id)
        
        if (error) throw error
        setMessage({ text: 'Gadget updated successfully!', type: 'success' })
      } else {
        await handleGadgetUpload(form, images, video, (msg) => setUploading(msg))
        setMessage({ text: 'Gadget uploaded successfully!', type: 'success' })
        setForm({ name: '', category: 'iphone', condition: 'new', storage: '', price: '', description: '' })
        setImages([])
        setVideo(null)
      }
      
      setTimeout(() => {
        closeModal()
        fetchGadgets()
      }, 1500)

    } catch (err: any) {
      console.error('Error:', err)
      const errorMsg = err?.message || err?.error?.message || 'Operation failed.'
      setMessage({ text: errorMsg, type: 'error' })
    } finally {
      setSaving(false)
    }
  }; // This closes the handleSubmit function

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Gadgets — All Listings</span>
        <button className="sec-btn" onClick={() => setShowModal(true)}>+ Upload New Gadget</button>
      </div>

      <div className="card" style={{marginTop: 20, overflowX: 'auto'}}>
        {loading ? (
          <LoadingSpinner message="Loading gadgets..." />
        ) : gadgets.length === 0 ? (
          <div style={{padding: 40, textAlign: 'center', color: '#666'}}>No gadgets listed yet</div>
        ) : (
          <table style={{tableLayout:'fixed',width:'100%'}}>
            <thead>
              <tr>
                <th style={{width:'25%'}}>Name</th>
                <th style={{width:'11%'}}>Type</th>
                <th style={{width:'10%'}}>Condition</th>
                <th style={{width:'10%'}}>Storage</th>
                <th style={{width:'14%'}}>Price</th>
                <th style={{width:'10%'}}>Status</th>
                <th style={{width:'20%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gadgets.map((g) => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td><span className="badge b-gadget">{g.category}</span></td>
                  <td><span className={`badge ${g.condition === 'New' ? 'b-new' : 'b-used'}`}>{g.condition === 'Used' ? 'UK Used' : g.condition}</span></td>
                  <td>{g.storage || '—'}</td>
                  <td>₦{g.price.toLocaleString()}</td>
                  <td><span className={`badge ${g.is_available ? 'b-live' : 'b-hidden'}`}>{g.is_available ? 'Available' : 'Sold'}</span></td>
                  <td style={{position: 'relative'}}>
                    {/* Mobile: Kebab menu */}
                    <button 
                      className="mobile-menu-btn"
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpenMenuId(openMenuId === g.id ? null : g.id) }}
                      style={{background: 'none', border: 'none', cursor: 'pointer', padding: '4px'}}
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" style={{color: '#6b7280'}} />
                    </button>
                    
                    {/* Desktop: Regular buttons */}
                    <div className="desktop-actions" style={{display: 'flex', gap: '8px'}}>
                      <button className="abtn a-edit" onClick={() => openEditModal(g)}>Edit</button>
                      <button className="abtn a-tog" onClick={() => toggleStatus(g)}>{g.is_available ? 'Mark Sold' : 'Mark Available'}</button>
                      <button className="abtn a-del" onClick={() => deleteGadget(g.id)}>Del</button>
                    </div>

                    {/* Dropdown menu */}
                    {openMenuId === g.id && (
                      <div className="action-dropdown" style={{
                        position: 'absolute', right: 0, top: '100%', zIndex: 50,
                        background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '140px', overflow: 'hidden', marginTop: '4px'
                      }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { openEditModal(g); setOpenMenuId(null) }} 
                          style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: 500}}>
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => { toggleStatus(g); setOpenMenuId(null) }}
                          style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: 500}}>
                          <EyeIcon className="w-4 h-4" /> {g.is_available ? 'Mark Sold' : 'Mark Available'}
                        </button>
                        <button onClick={() => { deleteGadget(g.id); setOpenMenuId(null) }}
                          style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', background: '#fef2f2', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#dc2626', fontWeight: 500}}>
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 16, width: '95%',
            maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', color: '#333',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20}}>
              <h2 style={{fontSize: 18, fontWeight: 600}}>{editingGadget ? 'Edit Gadget' : 'Upload New Gadget'}</h2>
              <button onClick={closeModal} style={{border:'none',background:'none',fontSize:24,cursor:'pointer'}}>×</button>
            </div>

            {message.text && (
              <div style={{
                padding: '10px', borderRadius: 8, marginBottom: 16, fontSize: 13,
                background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#15803d' : '#b91c1c',
                border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`
              }}>{message.text}</div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div>
                <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Product Name *</label>
                <input name="name" placeholder="e.g. iPhone 15 Pro Max" value={form.name} onChange={handleChange} className="form-input" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
              </div>

              <div style={{display:'flex', gap: 8}}>
                <div style={{flex: 1}}>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="form-select" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}}>
                    <option value="iphone">iPhone</option>
                    <option value="tablet">Tablet</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Condition</label>
                  <select name="condition" value={form.condition} onChange={handleChange} className="form-select" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}}>
                    <option value="new">New</option>
                    <option value="used">UK Used</option>
                  </select>
                </div>
              </div>

              <div style={{display:'flex', gap: 8}}>
                <div style={{flex: 1}}>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Storage</label>
                  <input name="storage" placeholder="256GB" value={form.storage} onChange={handleChange} className="form-input" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                </div>
                <div style={{flex: 1}}>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Price (₦) *</label>
                  <input name="price" type="number" placeholder="1350000" value={form.price} onChange={handleChange} className="form-input" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                </div>
              </div>

              <div>
                <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Description</label>
                <textarea name="description" placeholder="Product description..." value={form.description} onChange={handleChange} className="form-input" rows={3} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb', resize:'vertical'}} />
              </div>

              <div>
                <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Product Images</label>
                <div style={{border:'2px dashed #d1d5db', borderRadius:8, padding:16, textAlign:'center', background:'#f9fafb'}}>
                  <input type="file" accept="image/*" multiple onChange={e => e.target.files && setImages(Array.from(e.target.files))} style={{fontSize:14}} />
                  {images.length > 0 && <p style={{fontSize:13,color:'#1A4FA0',marginTop:8, fontWeight:500}}>{images.length} image(s) selected</p>}
                </div>
              </div>

              <div>
                <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Product Video (Optional)</label>
                <div style={{border:'2px dashed #d1d5db', borderRadius:8, padding:16, textAlign:'center', background:'#f9fafb'}}>
                  <input type="file" accept="video/*" onChange={e => e.target.files && setVideo(e.target.files[0])} style={{fontSize:14}} />
                  {video && <p style={{fontSize:13,color:'#1A4FA0',marginTop:8, fontWeight:500}}>{video.name}</p>}
                </div>
              </div>

              {uploading && <p style={{fontSize:13,color:'#1A4FA0',marginTop:6, fontWeight:500}}>{uploading}</p>}

              <button onClick={handleSubmit} disabled={saving} style={{
                marginTop: 8, width: '100%', padding: '14px', background: '#1A4FA0',
                color: 'white', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
                border: 'none', fontSize: 15, fontWeight: 600, boxShadow: '0 2px 8px rgba(26,79,160,0.3)'
              }}>
                {saving ? 'Saving...' : editingGadget ? 'Save Changes' : 'Upload Gadget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}