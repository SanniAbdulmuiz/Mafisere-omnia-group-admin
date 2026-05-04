'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadImage, uploadMultipleImages, uploadVideoToCloudinary } from '@/lib/uploadMedia'

interface Auto {
  id: number
  name: string
  make: string
  model: string
  year: number
  condition: string
  mileage: string
  price: number
  description: string | null
  images: string[]
  video_url: string | null
  is_available: boolean
}

export default function AutosPage() {
  const [autos, setAutos] = useState<Auto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'}>({text: '', type: 'success'})
  const [form, setForm] = useState({
    name: '', make: '', model: '', year: '', condition: 'Foreign', mileage: '', price: '', description: ''
  })

  useEffect(() => { fetchAutos() }, [])

  async function fetchAutos() {
    const { data, error } = await supabase.from('autos').select('*').order('created_at', { ascending: false })
    if (!error && data) setAutos(data)
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.make || !form.price) {
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

      const { error } = await supabase.from('autos').insert([{
        name: form.name.trim(),
        make: form.make.trim(),
        model: form.model.trim() || null,
        year: parseInt(form.year) || null,
        condition: form.condition,
        mileage: form.mileage || null,
        price: parseFloat(form.price),
        description: form.description || null,
        images: imageUrls,
        video_url: videoUrl,
        is_available: true
      }])

      if (error) throw error

      setMessage({ text: 'Auto uploaded successfully!', type: 'success' })
      setForm({ name: '', make: '', model: '', year: '', condition: 'Foreign', mileage: '', price: '', description: '' })
      setImages([])
      setVideo(null)
      setShowModal(false)
      fetchAutos()
    } catch (err: any) {
      setMessage({ text: err.message || 'Upload failed', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(auto: Auto) {
    await supabase.from('autos').update({ is_available: !auto.is_available }).eq('id', auto.id)
    fetchAutos()
  }

  async function deleteAuto(id: number) {
    if (!confirm('Delete this auto?')) return
    await supabase.from('autos').delete().eq('id', id)
    fetchAutos()
  }

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Autos — All Listings</span>
        <button className="sec-btn" onClick={() => setShowModal(true)}>+ Upload New Auto</button>
      </div>
      <div className="card" style={{overflowX: 'auto'}}>
        {loading ? (
          <div style={{padding: 40, textAlign: 'center', color: '#666'}}>Loading...</div>
        ) : autos.length === 0 ? (
          <div style={{padding: 40, textAlign: 'center', color: '#666'}}>No autos listed yet</div>
        ) : (
          <table style={{tableLayout:'fixed',width:'100%'}}>
            <thead>
              <tr>
                <th style={{width:'25%'}}>Name</th>
                <th style={{width:'10%'}}>Year</th>
                <th style={{width:'10%'}}>Make</th>
                <th style={{width:'12%'}}>Condition</th>
                <th style={{width:'15%'}}>Price</th>
                <th style={{width:'10%'}}>Status</th>
                <th style={{width:'18%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {autos.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.year}</td>
                  <td>{a.make}</td>
                  <td><span className={`badge ${a.condition === 'Foreign' ? 'b-new' : 'b-used'}`}>{a.condition}</span></td>
                  <td>₦{a.price.toLocaleString()}</td>
                  <td><span className={`badge ${a.is_available ? 'b-live' : 'b-hidden'}`}>{a.is_available ? 'Live' : 'Hidden'}</span></td>
                  <td>
                    <div className="row-acts">
                      <button className="abtn a-edit">Edit</button>
                      <button className="abtn a-tog" onClick={() => toggleStatus(a)}>{a.is_available ? 'Hide' : 'Show'}</button>
                      <button className="abtn a-del" onClick={() => deleteAuto(a.id)}>Del</button>
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
              <h2 style={{fontSize: 18, fontWeight: 600}}>Upload New Auto</h2>
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
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Listing Name *</label>
                  <input name="name" placeholder="e.g. Toyota Camry Full Option" value={form.name} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                </div>

                <div style={{display:'flex', gap: 10}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Make *</label>
                    <input name="make" placeholder="Toyota" value={form.make} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Model</label>
                    <input name="model" placeholder="Camry" value={form.model} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                </div>

                <div style={{display:'flex', gap: 10}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Year</label>
                    <input name="year" type="number" placeholder="2020" value={form.year} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Condition</label>
                    <select name="condition" value={form.condition} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}}>
                      <option value="Foreign">Foreign</option>
                      <option value="Nigerian">Nigerian</option>
                    </select>
                  </div>
                </div>

                <div style={{display:'flex', gap: 10}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Mileage (km)</label>
                    <input name="mileage" placeholder="50000" value={form.mileage} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Price (₦) *</label>
                    <input name="price" type="number" placeholder="18500000" value={form.price} onChange={handleChange} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                  </div>
                </div>

                <div>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Description</label>
                  <textarea name="description" placeholder="Additional details..." value={form.description} onChange={handleChange} rows={3} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd', resize:'vertical'}} />
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
                  {saving ? 'Uploading...' : 'Upload Auto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
