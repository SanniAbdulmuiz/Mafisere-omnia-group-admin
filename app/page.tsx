'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    const data = await res.json()

    if (data.success) {
      sessionStorage.setItem('admin_auth', 'true')
      router.push('/dashboard')
    } else {
      setError('Incorrect password. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f5f7fc', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '40px 36px',
        width: '100%', maxWidth: 400,
        border: '1px solid rgba(26,79,160,0.1)',
        boxShadow: '0 8px 32px rgba(26,79,160,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#1A4FA0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 14px',
            fontSize: 22, fontWeight: 900, color: 'white', fontFamily: 'Georgia, serif'
          }}>M</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0d1b2e', margin: 0 }}>
            Mafisere Admin
          </h1>
          <p style={{ fontSize: 13, color: '#5a6a85', marginTop: 6 }}>
            Sign in to manage your listings
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fce4ec', color: '#c62828', padding: '10px 14px',
            borderRadius: 8, fontSize: 13, marginBottom: 16
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{
              fontSize: 11, fontWeight: 500, color: '#5a6a85',
              display: 'block', marginBottom: 6,
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', padding: '11px 14px',
                border: '1px solid rgba(26,79,160,0.2)',
                borderRadius: 8, fontSize: 14,
                fontFamily: 'sans-serif', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: '12px', background: loading ? '#93b4d9' : '#1A4FA0',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'sans-serif', marginTop: 4
            }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#5a6a85', textAlign: 'center', marginTop: 24 }}>
          Mafisere Omnia Group Ltd &mdash; Staff Only
        </p>
      </div>
    </div>
  )
}