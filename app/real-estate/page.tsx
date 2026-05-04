'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadImage, uploadMultipleImages, uploadVideoToCloudinary } from '@/lib/uploadMedia'

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
        imageUrls = await uploadMultipleImages(images)
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

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Real Estate — All Listings</span>
        <button className="sec-btn" onClick={() => setShowModal(true)}>+ Upload New Property</button>
      </div>
      <div className="card" style={{overflowX: 'auto'}}>
        {loading ? (
          <div style={{padding: 40, textAlign: 'center', color: '#666'}}>Loading...</div>
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
                  <td>
                    <div className="row-acts">
                      <button className="abtn a-edit">Edit</button>
                      <button className="abtn a-tog" onClick={() => toggleStatus(p)}>{p.is_available ? 'Hide' : 'Show'}</button>
                      <button className="abtn a-del" onClick={() => deleteProperty(p.id)}>Del</button>
                    </div>
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
            background: 'white', borderRadius: 12, padding: 20, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflowY: 'auto', color: '#333', margin: '16px'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20}}>
              <h2 style={{fontSize: 18, fontWeight: 600}}>Upload New Property</h2>
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
              <div style={{display:'flex',flexDirection:'column',gap:15}}>
                <div>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Property Name *</label>
                  <input name="name" placeholder="e.g. 3-Bed Terrace Lekki" value={form.name} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                </div>

                <div style={{display:'flex', gap: 10}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Type *</label>
                    <select name="type" value={form.type} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}}>
                      <option value="House">House</option>
                      <option value="Land">Land</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Apartment">Apartment</option>
                    </select>
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Location *</label>
                    <input name="location" placeholder="Lekki, Lagos" value={form.location} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                </div>

                <div style={{display:'flex', gap: 10}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Bedrooms</label>
                    <input name="bedrooms" type="number" placeholder="3" value={form.bedrooms} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Bathrooms</label>
                    <input name="bathrooms" type="number" placeholder="3" value={form.bathrooms} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                </div>

                <div style={{display:'flex', gap: 10}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Size</label>
                    <input name="size" placeholder="500sqm" value={form.size} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Price (₦) *</label>
                    <input name="price" type="number" placeholder="85000000" value={form.price} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                </div>

                <div>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Description</label>
                  <textarea name="description" placeholder="Property description..." value={form.description} onChange={handleChange} rows={3} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd', resize:'vertical'}} />
                </div>

                <div>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Images</label>
                  <input type="file" accept="image/*" multiple onChange={e => e.target.files && setImages(Array.from(e.target.files))} />
                  {images.length > 0 && <p style={{fontSize:12,color:'#3b82f6',marginTop:6}}>{images.length} image(s) selected</p>}
                </div>

                <div>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Video (Optional)</label>
                  <input type="file" accept="video/*" onChange={e => e.target.files && setVideo(e.target.files[0])} />
                </div>

                <button type="submit" disabled={saving} style={{
                  padding: '12px', borderRadius: 8, border: 'none', background: '#1A4FA0',
                  color: 'white', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
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
