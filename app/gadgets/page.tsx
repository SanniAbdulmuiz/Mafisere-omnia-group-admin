'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadGadgetImage } from '@/lib/uploadImage'

export default function GadgetsPage() {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [form, setForm] = useState({
    name: '',
    category: 'iphone',
    condition: 'new',
    storage: '',
    price: '',
    description: ''
  })
  const [images, setImages] = useState<File[]>([])

  // Dummy data for the table - ensure this exists!
  const gadgets = [
    { name: 'iPhone 15 Pro Max', category: 'iPhone', condition: 'New', storage: '256GB', price: '₦1,350,000', status: 'Live' },
    { name: 'iPhone 14', category: 'iPhone', condition: 'Used', storage: '128GB', price: '₦750,000', status: 'Live' },
    { name: 'iPad Pro 12.9"', category: 'Tablet', condition: 'New', storage: '256GB', price: '₦980,000', status: 'Hidden' },
    { name: 'AirPods Pro 2nd Gen', category: 'Accessory', condition: 'New', storage: '—', price: '₦180,000', status: 'Live' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      setMessage({ text: 'Please fill in required fields', type: 'error' })
      return
    }

    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      const imageUrls: string[] = []
      if (images.length > 0) {
        for (const file of images) {
          const url = await uploadGadgetImage(file)
          imageUrls.push(url)
        }
      }

      // Inside handleSubmit...
const { error } = await supabase.from('gadgets').insert([{
  name: form.name.trim(),
  category: form.category.toLowerCase(), // This is fine (db expects 'iphone', etc.)
  
  // FIX: Capitalize the first letter to match 'New' or 'Used'
  condition: form.condition.charAt(0).toUpperCase() + form.condition.slice(1), 
  
  storage: form.storage || null,
  price: parseFloat(form.price),
  description: form.description || null,
  images: imageUrls,
  is_available: true
}])

      if (error) throw error

      setMessage({ text: 'Gadget uploaded successfully!', type: 'success' })
      setForm({ name: '', category: 'iphone', condition: 'new', storage: '', price: '', description: '' })
      setImages([])
      
      setTimeout(() => {
        setShowModal(false)
        setMessage({ text: '', type: '' })
      }, 2000)

    } catch (err: any) {
      // This will force the console to show the internal properties
      console.log("Full Error Object:", JSON.stringify(err, null, 2));
      console.error("Supabase Detailed Error:", {
        code: err.code,
        message: err.message,
        details: err.details,
        hint: err.hint
      });
      
      setMessage({ 
        text: `Error (${err.code || 'Unknown'}): ${err.message || 'Check console'}`, 
        type: 'error' 
      }); // Added semicolon here
    } finally { // The "}" before "finally" was missing
      setLoading(false);
    }
  }; // This closes the handleSubmit function

  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Gadgets — All Listings</span>
        <button className="sec-btn" onClick={() => setShowModal(true)}>+ Upload New Gadget</button>
      </div>

      <div className="card" style={{marginTop: 20}}>
        <table style={{tableLayout:'fixed',width:'100%'}}>
          <thead>
            <tr>
              <th style={{width:'28%'}}>Name</th>
              <th style={{width:'12%'}}>Type</th>
              <th style={{width:'11%'}}>Condition</th>
              <th style={{width:'10%'}}>Storage</th>
              <th style={{width:'14%'}}>Price</th>
              <th style={{width:'10%'}}>Status</th>
              <th style={{width:'15%'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gadgets.map((g, i) => (
              <tr key={i}>
                <td>{g.name}</td>
                <td><span className="badge b-gadget">{g.category}</span></td>
                <td><span className={`badge ${g.condition === 'New' ? 'b-new' : 'b-used'}`}>{g.condition}</span></td>
                <td>{g.storage}</td>
                <td>{g.price}</td>
                <td><span className={`badge ${g.status === 'Live' ? 'b-live' : 'b-hidden'}`}>{g.status}</span></td>
                <td>
                  <div className="row-acts">
                    <button className="abtn a-edit">Edit</button>
                    <button className="abtn a-del">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500,
            maxHeight: '90vh', overflowY: 'auto', color: '#333'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20}}>
              <h2 style={{fontSize: 18, fontWeight: 600}}>Upload New Gadget</h2>
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

            <div style={{display:'flex',flexDirection:'column',gap:15}}>
              <div>
                <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Product Name *</label>
                <input name="name" placeholder="e.g. iPhone 15 Pro Max" value={form.name} onChange={handleChange} className="form-input" style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
              </div>

              <div style={{display:'flex', gap: 10}}>
                <div style={{flex: 1}}>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="form-select" style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}}>
                    <option value="iphone">iPhone</option>
                    <option value="tablet">Tablet</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Condition</label>
                  <select name="condition" value={form.condition} onChange={handleChange} className="form-select" style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}}>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
              </div>

              <div style={{display:'flex', gap: 10}}>
                <div style={{flex: 1}}>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Storage</label>
                  <input name="storage" placeholder="256GB" value={form.storage} onChange={handleChange} className="form-input" style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                </div>
                <div style={{flex: 1}}>
                  <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Price (₦) *</label>
                  <input name="price" type="number" placeholder="1350000" value={form.price} onChange={handleChange} className="form-input" style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}} />
                </div>
              </div>

              <div>
                <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Description</label>
                <textarea name="description" placeholder="Product description..." value={form.description} onChange={handleChange} className="form-input" rows={3} style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd', resize:'vertical'}} />
              </div>

              <div>
                <label style={{display:'block', fontSize:12, marginBottom:5, fontWeight:500}}>Product Images</label>
                <input type="file" accept="image/*" multiple onChange={e => e.target.files && setImages(Array.from(e.target.files))} />
                {images.length > 0 && <p style={{fontSize:12,color:'#3b82f6',marginTop:6}}>{images.length} image(s) selected</p>}
              </div>

              <button onClick={handleSubmit} disabled={loading} className="sec-btn" style={{marginTop:10, width:'100%', padding: '12px', background: '#001f3f', color: 'white', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', border: 'none'}}>
                {loading ? 'Uploading...' : 'Upload Gadget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}