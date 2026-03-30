import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = window.location.hash
          .substring(1)
          .split('&')
          .reduce((acc: Record<string, string>, part) => {
            const [key, value] = part.split('=')
            acc[key] = decodeURIComponent(value || '')
            return acc
          }, {})

        if (hashParams.access_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token,
          })
          if (data.session) {
            router.push('/dashboard')
            return
          }
        }

        // Fallback — check if already have session
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch (err) {
        router.push('/login')
      }
    }

    handleCallback()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F4EF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '28px',
          height: '28px',
          border: '2px solid #DDDDD6',
          borderTopColor: '#1A7A4A',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: '500', marginBottom: '4px' }}>Verifying your account...</p>
        <p style={{ fontSize: '12px', color: '#A8A89E' }}>You'll be redirected shortly</p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}