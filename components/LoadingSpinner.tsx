'use client'

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: '16px',
      padding: '40px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e8f0fb',
        borderTop: '3px solid #1A4FA0',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{
        fontSize: '13px',
        color: '#5a6a85',
        fontFamily: "'DM Sans', sans-serif"
      }}>{message}</span>
    </div>
  )
}