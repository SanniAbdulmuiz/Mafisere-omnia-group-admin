'use client'

import { useState, useEffect } from 'react'
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
  bathrooms: number | null
  size: string | null
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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'House', location: '', bedrooms: '', bathrooms: '', size: '', price: '', description: ''
  })

  useEffect(() => { fetchProperties() }, [])

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
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        size: form.size || null,
        price: parseFloat(form.price),
        description: form.description || null,
        images: imageUrls,
        video_url: videoUrl,
        is_available: true
      }])

      if (error) throw error

      setMessage({ text: 'Property uploaded successfully!', type: 'success' })
      setForm({ name: '', type: 'House', location: '', bedrooms: '', bathrooms: '', size: '', price: '', description: '' })
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
      bathrooms: prop.bathrooms?.toString() || '',
      size: prop.size || '',
      price: prop.price.toString(),
      description: prop.description || ''
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingProperty(null)
    setForm({ name: '', type: 'House', location: '', bedrooms: '', bathrooms: '', size: '', price: '', description: '' })
    setMessage({text: '', type: 'success'})
    setVideoProgress(0)
  }

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Real Estate — All Listings</span>
        <button className="sec-btn" onClick={() => { setShowModal(true); setEditingProperty(null); setMessage({text: '', type: 'success'}); setForm({ name: '', type: 'House', location: '', bedrooms: '', bathrooms: '', size: '', price: '', description: '' }); setImages([]); setVideo(null); setVideoProgress(0); }}>+ Upload New Property</button>
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
                  <td>₦{p.price.toLocaleString()}</td>
                  <td><span className={`badge ${p.is_available ? 'b-live' : 'b-hidden'}`}>{p.is_available ? 'Live' : 'Hidden'}</span></td>
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
                      <button className="abtn a-tog" onClick={() => toggleStatus(p)}>{p.is_available ? 'Hide' : 'Show'}</button>
                      <button className="abtn a-del" onClick={() => deleteProperty(p.id)}>Del</button>
                    </div>

                    {openMenuId === p.id && (
                      <div className="action-dropdown" style={{
                        position: 'absolute', right: 0, top: '100%', zIndex: 50,
                        background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '140px', overflow: 'hidden', marginTop: '4px'
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
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Bathrooms</label>
                    <input name="bathrooms" type="number" placeholder="3" value={form.bathrooms} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                </div>

                <div style={{display:'flex', gap: 8}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Size</label>
                    <input name="size" placeholder="500sqm" value={form.size} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
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
                    <input type="file" accept="image/*" multiple onChange={e => e.target.files && setImages(Array.from(e.target.files))} style={{fontSize:14}} />
                    {images.length > 0 && <p style={{fontSize:13,color:'#1A4FA0',marginTop:8, fontWeight:500}}>{images.length} image(s) selected</p>}
                  </div>
                </div>

                <div>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Video (Optional)</label>
                  <div style={{border:'2px dashed #d1d5db', borderRadius:8, padding:16, textAlign:'center', background:'#f9fafb'}}>
                    <input type="file" accept="video/*" onChange={e => e.target.files && setVideo(e.target.files[0])} style={{fontSize:14}} />
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
