'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadMultipleAutoImages, uploadVideoToCloudinary } from '@/lib/uploadMedia'
import LoadingSpinner from '@/components/LoadingSpinner'
import { EllipsisVerticalIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline'

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
  const [uploading, setUploading] = useState('')
  const [videoProgress, setVideoProgress] = useState(0)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [editingAuto, setEditingAuto] = useState<Auto | null>(null)
  const [form, setForm] = useState({
    name: '', make: '', model: '', year: '', condition: 'Foreign', mileage: '', price: '', description: ''
  })

  useEffect(() => { fetchAutos() }, [])

  useEffect(() => {
    if (!openMenuId) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.action-dropdown')) setOpenMenuId(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openMenuId])

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
        imageUrls = await uploadMultipleAutoImages(images)
      }

      let videoUrl: string | null = null
      if (video) {
        setUploading('Uploading video...')
        const videoData = await uploadVideoToCloudinary(video, (percent) => setVideoProgress(percent))
        videoUrl = videoData.url
      }

      if (editingAuto) {
        const { error } = await supabase.from('autos').update({
          name: form.name.trim(),
          make: form.make.trim(),
          model: form.model.trim() || null,
          year: parseInt(form.year) || null,
          condition: form.condition,
          mileage: form.mileage || null,
          price: parseFloat(form.price),
          description: form.description || null,
          video_url: videoUrl || editingAuto.video_url
        }).eq('id', editingAuto.id)
        if (error) throw error
        setMessage({ text: 'Auto updated successfully!', type: 'success' })
      } else {
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
      }
      
      setTimeout(() => {
        closeModal()
        fetchAutos()
      }, 1500)
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

  function openEditModal(auto: Auto) {
    setEditingAuto(auto)
    setForm({
      name: auto.name,
      make: auto.make || '',
      model: auto.model || '',
      year: auto.year?.toString() || '',
      condition: auto.condition || 'Foreign',
      mileage: auto.mileage || '',
      price: auto.price.toString(),
      description: auto.description || ''
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingAuto(null)
    setForm({ name: '', make: '', model: '', year: '', condition: 'Foreign', mileage: '', price: '', description: '' })
    setMessage({text: '', type: 'success'})
    setVideoProgress(0)
  }

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Autos — All Listings</span>
        <button className="sec-btn" onClick={() => { setShowModal(true); setEditingAuto(null); setMessage({text: '', type: 'success'}); setForm({ name: '', make: '', model: '', year: '', condition: 'Foreign', mileage: '', price: '', description: '' }); setImages([]); setVideo(null); setVideoProgress(0); }}>+ Upload New Auto</button>
      </div>
      <div className="card" style={{overflowX: 'auto'}}>
        {loading ? (
          <LoadingSpinner message="Loading autos..." />
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
                  <td>₦{a.price >= 1000000 ? (a.price / 1000000).toFixed(1) + 'M' : a.price.toLocaleString()}</td>
                  <td><span className={`badge ${a.is_available ? 'b-live' : 'b-hidden'}`}>{a.is_available ? 'Available' : 'Sold'}</span></td>
                  <td style={{position: 'relative'}}>
                    <button 
                      className="mobile-menu-btn"
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpenMenuId(openMenuId === a.id ? null : a.id) }}
                      style={{background: 'none', border: 'none', cursor: 'pointer', padding: '4px'}}
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" style={{color: '#6b7280'}} />
                    </button>
                    
                    <div className="desktop-actions" style={{display: 'flex', gap: '8px'}}>
                      <button className="abtn a-edit" onClick={() => openEditModal(a)}>Edit</button>
                      <button className="abtn a-tog" onClick={() => toggleStatus(a)}>{a.is_available ? 'Mark Sold' : 'Mark Available'}</button>
                      <button className="abtn a-del" onClick={() => deleteAuto(a.id)}>Del</button>
                    </div>

                    {openMenuId === a.id && (
                      <>
                      <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999}} onClick={() => setOpenMenuId(null)} />
                      <div className="action-dropdown" style={{
                        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000,
                        background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        minWidth: '160px', overflow: 'hidden', padding: '8px 0'
                      }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { openEditModal(a); setOpenMenuId(null) }} 
                          style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: 500}}>
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => { toggleStatus(a); setOpenMenuId(null) }}
                          style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: 500}}>
                          <EyeIcon className="w-4 h-4" /> {a.is_available ? 'Mark Sold' : 'Mark Available'}
                        </button>
                        <button onClick={() => { deleteAuto(a.id); setOpenMenuId(null) }}
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
              <h2 style={{fontSize: 18, fontWeight: 600}}>{editingAuto ? 'Edit Auto' : 'Upload New Auto'}</h2>
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
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Listing Name *</label>
                  <input name="name" placeholder="e.g. Toyota Camry Full Option" value={form.name} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                </div>

                <div style={{display:'flex', gap: 8}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Make *</label>
                    <input name="make" placeholder="Toyota" value={form.make} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Model</label>
                    <input name="model" placeholder="Camry" value={form.model} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                </div>

                <div style={{display:'flex', gap: 8}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Year</label>
                    <input name="year" type="number" placeholder="2020" value={form.year} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Condition</label>
                    <select name="condition" value={form.condition} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}}>
                      <option value="Foreign">Foreign</option>
                      <option value="Nigerian">Nigerian</option>
                    </select>
                  </div>
                </div>

                <div style={{display:'flex', gap: 8}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Mileage (km)</label>
                    <input name="mileage" placeholder="50000" value={form.mileage} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Price (₦) *</label>
                    <input name="price" type="number" placeholder="18500000" value={form.price} onChange={handleChange} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb'}} />
                  </div>
                </div>

                <div>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Description</label>
                  <textarea name="description" placeholder="Additional details..." value={form.description} onChange={handleChange} rows={3} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:14, background:'#f9fafb', resize:'vertical'}} />
                </div>

                <div>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Images</label>
                  <div style={{border:'2px dashed #d1d5db', borderRadius:8, padding:16, textAlign:'center', background:'#f9fafb'}}>
                    <input type="file" accept="image/*" multiple onChange={e => e.target.files && setImages(Array.from(e.target.files))} style={{fontSize:14}} />
                    {images.length > 0 && <p style={{fontSize:13,color:'#1A4FA0',marginTop:8, fontWeight:500}}>{images.length} image(s) selected</p>}
                  </div>
                </div>

                <div>
                  <label style={{display:'block', fontSize:13, marginBottom:4, fontWeight:500, color:'#374151'}}>Video</label>
                  <div style={{border:'2px dashed #d1d5db', borderRadius:8, padding:16, textAlign:'center', background:'#f9fafb'}}>
                    <input type="file" accept="video/*" onChange={e => e.target.files && setVideo(e.target.files[0])} style={{fontSize:14}} />
                    {video && !uploading && <p style={{fontSize:13,color:'#1A4FA0',marginTop:8, fontWeight:500}}>{video.name}</p>}
                  </div>
                </div>

                {videoProgress > 0 && videoProgress < 100 && (
                  <div style={{marginTop: 8}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                      <span style={{fontSize:12, color:'#374151'}}>Uploading video...</span>
                      <span style={{fontSize:12, color:'#1A4FA0', fontWeight:500}}>{videoProgress}%</span>
                    </div>
                    <div style={{width:'100%', height:6, background:'#e5e7eb', borderRadius:3, overflow:'hidden'}}>
                      <div style={{width:`${videoProgress}%`, height:'100%', background:'#1A4FA0', borderRadius:3, transition:'width 0.3s'}} />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={saving} style={{
                  marginTop: 8, width: '100%', padding: '14px', background: '#1A4FA0',
                  color: 'white', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
                  border: 'none', fontSize: 15, fontWeight: 600, boxShadow: '0 2px 8px rgba(26,79,160,0.3)'
                }}>
                  {saving ? 'Saving...' : editingAuto ? 'Save Changes' : 'Upload Auto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
