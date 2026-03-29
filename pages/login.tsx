import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { overflow: hidden; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-1.5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.03); }
          66% { transform: translate(20px, -15px) scale(0.98); }
        }
        @keyframes countup {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .fade-up { animation: fadeSlideUp 0.5s ease forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; }
        .d4 { animation-delay: 0.4s; }
        .d5 { animation-delay: 0.5s; }

        .glass-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1px solid rgba(221,221,214,0.8);
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(8px);
          font-size: 14px;
          color: #0A0A0A;
          outline: none;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .glass-input::placeholder { color: #A8A89E; }
        .glass-input:focus {
          border-color: #1A7A4A;
          box-shadow: 0 0 0 3px rgba(26,122,74,0.08);
        }

        .auth-btn {
          width: 100%;
          padding: 13px;
          background: #1A7A4A;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(26,122,74,0.3);
        }
        .auth-btn:hover {
          background: #155C38;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,122,74,0.35);
        }
        .auth-btn:active { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

        .float-card {
          position: absolute;
          background: rgba(15,15,15,0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px 20px;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}>

        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '12%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,122,74,0.18) 0%, transparent 65%)',
          animation: 'orb1 12s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,122,74,0.1) 0%, transparent 65%)',
          animation: 'orb2 15s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '20%',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,122,74,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Floating cards — background layer */}

        {/* QR card — top left */}
        <div className="float-card" style={{
          top: '12%', left: '6%',
          animation: 'float1 7s ease-in-out infinite',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            backgroundColor: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="1.5" fill="#0A0A0A"/>
              <rect x="17" y="2" width="9" height="9" rx="1.5" fill="#0A0A0A"/>
              <rect x="2" y="17" width="9" height="9" rx="1.5" fill="#0A0A0A"/>
              <rect x="4" y="4" width="5" height="5" rx="0.5" fill="white"/>
              <rect x="19" y="4" width="5" height="5" rx="0.5" fill="white"/>
              <rect x="4" y="19" width="5" height="5" rx="0.5" fill="white"/>
              <rect x="17" y="17" width="4" height="4" rx="0.5" fill="#0A0A0A"/>
              <rect x="23" y="17" width="3" height="4" rx="0.5" fill="#0A0A0A"/>
              <rect x="17" y="23" width="9" height="2" rx="0.5" fill="#0A0A0A"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'white', marginBottom: '2px' }}>QR code generated</p>
            <p style={{ fontSize: '11px', color: '#6B6B5E' }}>Print-ready · Instant share</p>
          </div>
        </div>

        {/* Response count — top right */}
        <div className="float-card" style={{
          top: '10%', right: '5%',
          animation: 'float2 6s ease-in-out infinite',
        }}>
          <p style={{ fontSize: '11px', color: '#6B6B5E', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Responses today</p>
          <p style={{ fontSize: '32px', fontWeight: '600', color: 'white', lineHeight: '1', marginBottom: '8px' }}>1,248</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A7A4A', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '11px', color: '#1A7A4A' }}>Live</span>
          </div>
        </div>

        {/* Mode selector — bottom left */}
        <div className="float-card" style={{
          bottom: '14%', left: '5%',
          animation: 'float3 8s ease-in-out infinite',
          minWidth: '200px',
        }}>
          <p style={{ fontSize: '11px', color: '#6B6B5E', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Form mode</p>
          {[
            { name: 'Quick', desc: 'Tap & done', active: false },
            { name: 'Form', desc: 'Standard', active: false },
            { name: 'Flow', desc: 'One by one', active: true },
          ].map((mode) => (
            <div key={mode.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: '8px', marginBottom: '4px',
              backgroundColor: mode.active ? 'rgba(26,122,74,0.15)' : 'transparent',
              border: `1px solid ${mode.active ? 'rgba(26,122,74,0.3)' : 'transparent'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: mode.active ? '#1A7A4A' : '#3a3a3a' }} />
                <span style={{ fontSize: '12px', fontWeight: mode.active ? '500' : '400', color: mode.active ? 'white' : '#6B6B5E' }}>{mode.name}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#6B6B5E' }}>{mode.desc}</span>
            </div>
          ))}
        </div>

        {/* Mini form preview — bottom right */}
        <div className="float-card" style={{
          bottom: '12%', right: '5%',
          animation: 'float4 9s ease-in-out infinite',
          width: '220px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>Rate your visit</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(26,122,74,0.15)', borderRadius: '20px', padding: '3px 8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#1A7A4A', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '10px', color: '#1A7A4A' }}>Active</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{
                width: '30px', height: '30px', borderRadius: '50%',
                backgroundColor: n <= 4 ? '#1A7A4A' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${n <= 4 ? '#1A7A4A' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '11px', color: n <= 4 ? 'white' : '#6B6B5E' }}>{n}</span>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', height: '3px' }}>
            <div style={{ width: '80%', height: '100%', backgroundColor: '#1A7A4A', borderRadius: '3px' }} />
          </div>
          <p style={{ fontSize: '10px', color: '#6B6B5E', marginTop: '4px' }}>4 of 5 answered</p>
        </div>

        {/* Center island — Auth form */}
        <div className="fade-up d1" style={{
          position: 'relative', zIndex: 10,
          backgroundColor: '#F5F4EF',
          borderRadius: '24px',
          padding: '48px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>

          {/* Logo */}
          <div className="fade-up d2" style={{ marginBottom: '32px' }}>
            <span
              onClick={() => router.push('/')}
              style={{ fontSize: '17px', fontWeight: '600', color: '#0A0A0A', cursor: 'pointer', letterSpacing: '-0.3px' }}
            >
              Formr
            </span>
          </div>

          <div className="fade-up d2">
            <h1 style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: '32px',
              fontWeight: '400',
              color: '#0A0A0A',
              marginBottom: '6px',
              letterSpacing: '-0.5px',
              lineHeight: '1.1',
            }}>
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B6B5E', marginBottom: '28px' }}>
              {isSignUp ? 'Free forever. No credit card needed.' : 'Sign in to your Formr account.'}
            </p>
          </div>

          <div className="fade-up d3" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            <input
              className="glass-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <input
              className="glass-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '12px',
              backgroundColor: error.includes('Check') ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${error.includes('Check') ? '#bbf7d0' : '#fecaca'}`,
            }}>
              <p style={{ fontSize: '12px', color: error.includes('Check') ? '#15803d' : '#dc2626' }}>
                {error}
              </p>
            </div>
          )}

          <div className="fade-up d4">
            <button className="auth-btn" onClick={handleAuth} disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </div>

          <div className="fade-up d5" style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#6B6B5E' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                style={{ background: 'none', border: 'none', color: '#1A7A4A', fontWeight: '500', cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, sans-serif', textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                {isSignUp ? 'Sign in' : 'Sign up free'}
              </button>
            </p>
          </div>

          {/* Trust bar */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #DDDDD6', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['No credit card', 'Free forever', 'Instant QR'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />
                <span style={{ fontSize: '10px', color: '#A8A89E' }}>{item}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </>
  )
}