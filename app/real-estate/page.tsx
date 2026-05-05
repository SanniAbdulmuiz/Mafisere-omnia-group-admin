'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadMultiplePropertyImages, uploadVideoToCloudinary } from '@/lib/uploadMedia'
import LoadingSpinner from '@/components/LoadingSpinner'
import { EllipsisVerticalIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Property {
  id: number
  name: string
  type: string
  location: string
  bedrooms: number | null
  price: number
  description: string | null
  images: string[]
  video_url: string | null
  is_available: boolean
}

export default function RealEstatePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'}>({text: '', type: 'success'})
  const [uploading, setUploading] = useState('')
  const [videoProgress, setVideoProgress] = useState(0)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'House', location: '', bedrooms: '', price: '', description: ''
  })

  useEffect(() => { fetchProperties() }, [])

  useEffect(() => {
    if (!openMenuId) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.action-dropdown')) setOpenMenuId(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openMenuId])

  async function fetchProperties() {
    const { data, error } = await supabase.from('real_estate').select('*').order('created_at', { ascending: false })
    if (!error && data) setProperties(data)
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.location || !form.price) {
      setMessage({ text: 'Please fill in required fields', type: 'error' })
      return
    }
    setSaving(true)
    setMessage({ text: '', type: 'success' })

    try {
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadMultiplePropertyImages(images)
      }

      let videoUrl: string | null = null
      if (video) {
        const videoData = await uploadVideoToCloudinary(video)
        videoUrl = videoData.url
      }

      const { error } = await supabase.from('real_estate').insert([{
        name: form.name.trim(),
        type: form.type,
        location: form.location.trim(),
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        price: parseFloat(form.price),
        description: form.description || null,
        images: imageUrls,
        video_url: videoUrl,
        is_available: true
      }])

      if (error) throw error

      setMessage({ text: 'Property uploaded successfully!', type: 'success' })
      setForm({ name: '', type: 'House', location: '', bedrooms: '', price: '', description: '' })
      setImages([])
      setVideo(null)
      setShowModal(false)
      fetchProperties()
    } catch (err: any) {
      setMessage({ text: err.message || 'Upload failed', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(prop: Property) {
    await supabase.from('real_estate').update({ is_available: !prop.is_available }).eq('id', prop.id)
    fetchProperties()
  }

  async function deleteProperty(id: number) {
    if (!confirm('Delete this property?')) return
    await supabase.from('real_estate').delete().eq('id', id)
    fetchProperties()
  }

  function openEditModal(prop: Property) {
    setEditingProperty(prop)
    setForm({
      name: prop.name,
      type: prop.type || 'House',
      location: prop.location || '',
      bedrooms: prop.bedrooms?.toString() || '',
      price: prop.price.toString(),
      description: prop.description || ''
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingProperty(null)
    setForm({ name: '', type: 'House', location: '', bedrooms: '', price: '', description: '' })
    setMessage({text: '', type: 'success'})
    setVideoProgress(0)
    setImages([])
    setVideo(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Real Estate — All Listings</span>
        <button className="sec-btn" onClick={() => { setShowModal(true); setEditingProperty(null); setMessage({text: '', type: 'success'}); setForm({ name: '', type: 'House', location: '', bedrooms: '', price: '', description: '' }); setImages([]); setVideo(null); setVideoProgress(0); }}>+ Upload New Property</button>
      </div>
      <div className="card" style={{overflowX: 'auto'}}>
        {loading ? (
          <LoadingSpinner message="Loading properties..." />
        ) : properties.length === 0 ? (
          <div style={{padding: 40, textAlign: 'center', color: '#666'}}>No properties listed yet</div>
        ) : (
          <table style={{tableLayout:'fixed',width:'100%'}}>
            <thead>
              <tr>
                <th style={{width:'22%'}}>Property</th>
                <th style={{width:'10%'}}>Type</th>
                <th style={{width:'14%'}}>Location</th>
                <th style={{width:'10%'}}>Beds</th>
                <th style={{width:'14%'}}>Price</th>
                <th style={{width:'10%'}}>Status</th>
                <th style={{width:'20%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><span className="badge b-estate">{p.type}</span></td>
                  <td>{p.location}</td>
                  <td>{p.bedrooms || '-'}</td>
                  <td>₦{p.price >= 1000000 ? (p.price / 1000000).toFixed(1) + 'M' : p.price.toLocaleString()}</td>
                  <td><span className={`badge ${p.is_available ? 'b-live' : 'b-hidden'}`}>{p.is_available ? 'Available' : 'Sold'}</span></td>
                  <td style={{position: 'relative'}}>
                    <button 
                      className="mobile-menu-btn"
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpenMenuId(openMenuId === p.id ? null : p.id) }}
                      style={{background: 'none', border: 'none', cursor: 'pointer', padding: '4px'}}
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" style={{color: '#6b7280'}} />
                    </button>
                    
                    <div className="desktop-actions" style={{display: 'flex', gap: '8px'}}>
                      <button className="abtn a-edit" onClick={() => openEditModal(p)}>Edit</button>
                      <button className="abtn a-tog" onClick={() => toggleStatus(p)}>{p.is_available ? 'Mark Sold' : 'Mark Available'}</button>
                      <button className="abtn a-del" onClick={() => deleteProperty(p.id)}>Del</button>
                    </div>

                    {openMenuId === p.id && (
                      <>
                      <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999}} onClick={() => setOpenMenuId(null)} />
                      <div className="action-dropdown" style={{
                        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000,
                        background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        minWidth: '160px', overflow: 'hidden', padding: '8px 0'
                      }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { openEditModal(p); setOpenMenuId(null) }} 
                          style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: 500}}>
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => { toggleStatus(p); setOpenMenuId(null) }}
                          style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: 500}}>
                          <EyeIcon className="w-4 h-4" /> {p.is_available ? 'Mark Sold' : 'Mark Available'}
                        </button>
                        <button onClick={() => { deleteProperty(p.id); setOpenMenuId(null) }}
                          style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', background: '#fef2f2', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#dc2626', fontWeight: 500}}>
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                      </div>
                      </>
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
              <h2 style={{fontSize: 18, fontWeight: 600}}>{editingProperty ? 'Edit Property' : 'Upload New Property'}</h2>
              <button onClick={() => setShowModal(false)} style={{border:'none',background:'none',fontSize:24,cursor:'pointer'}}>×</button>
            </div>

            {message.text && (
              <div style={{
                padding: '10px', borderRadius: 8, marginBottom: 16, fontSize: 13,
                background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#15803d' : '#b91c1c',
                border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`
              }}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Property Name *</label>
                  <input name="name" placeholder="e.g. 3-Bed Terrace Lekki" value={form.name} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                </div>

                <div style={{display:'flex', gap: 8}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Type *</label>
                    <select name="type" value={form.type} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}}>
                      <option value="House">House</option>
                      <option value="Land">Land</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Apartment">Apartment</option>
                    </select>
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Location *</label>
                    <input name="location" placeholder="Lekki, Lagos" value={form.location} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                </div>

                <div style={{display:'flex', gap: 8}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Bedrooms</label>
                    <input name="bedrooms" type="number" placeholder="3" value={form.bedrooms} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Price (₦) *</label>
                    <input name="price" type="number" placeholder="85000000" value={form.price} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                </div>

                <div>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Description</label>
                  <textarea name="description" placeholder="Property description..." value={form.description} onChange={handleChange} rows={3} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb', resize:'vertical'}} />
                </div>

                <div>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Images</label>
                  <div style={{border:'2px dashed #d1d5db', borderRadius:8, padding:16, textAlign:'center', background:'#f9fafb'}}>
                    <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={e => e.target.files && setImages(Array.from(e.target.files))} style={{fontSize:14}} />
                    {images.length > 0 && <p style={{fontSize:13,color:'#1A4FA0',marginTop:8, fontWeight:500}}>{images.length} image(s) selected</p>}
                  </div>
                </div>

                <div>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Video</label>
                  <div style={{border:'2px dashed #d1d5db', borderRadius:8, padding:16, textAlign:'center', background:'#f9fafb'}}>
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={e => e.target.files && setVideo(e.target.files[0])} style={{fontSize:14}} />
                    {video && <p style={{fontSize:13,color:'#1A4FA0',marginTop:8, fontWeight:500}}>{video.name}</p>}
                  </div>
                </div>

                <button type="submit" disabled={saving} style={{
                  marginTop: 8, width: '100%', padding: '14px', background: '#1A4FA0',
                  color: 'white', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
                  border: 'none', fontSize: 15, fontWeight: 600, boxShadow: '0 2px 8px rgba(26,79,160,0.3)'
                }}>
                  {saving ? 'Uploading...' : 'Upload Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
