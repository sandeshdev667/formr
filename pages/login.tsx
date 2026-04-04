import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Logo from '../components/Logo'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  //for login page to dashboard handing if loggedin
  useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) router.push('/dashboard')
  }
  checkSession()
}, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const shapes: any[] = []
    const count = 12

    for (let i = 0; i < count; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 40 + Math.random() * 120,
        sides: Math.floor(3 + Math.random() * 5),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: 0.03 + Math.random() * 0.06,
        color: Math.random() > 0.6 ? '#1A7A4A' : '#ffffff',
        morphSpeed: 0.002 + Math.random() * 0.003,
        morphOffset: Math.random() * Math.PI * 2,
      })
    }

    let animId: number
    let t = 0

    const drawPolygon = (x: number, y: number, sides: number, size: number, rotation: number, morphT: number, opacity: number, color: string) => {
      ctx.beginPath()
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation
        const morphedSize = size + Math.sin(morphT + i) * size * 0.15
        const px = x + Math.cos(angle) * morphedSize
        const py = y + Math.sin(angle) * morphedSize
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.strokeStyle = color === '#1A7A4A'
        ? `rgba(26,122,74,${opacity})`
        : `rgba(255,255,255,${opacity})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.01

      shapes.forEach(s => {
        s.x += s.vx
        s.y += s.vy
        s.rotation += s.rotSpeed

        if (s.x < -200) s.x = canvas.width + 200
        if (s.x > canvas.width + 200) s.x = -200
        if (s.y < -200) s.y = canvas.height + 200
        if (s.y > canvas.height + 200) s.y = -200

        drawPolygon(s.x, s.y, s.sides, s.size, s.rotation, t * s.morphSpeed * 100 + s.morphOffset, s.opacity, s.color)
      })

      animId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
          data: { full_name: name, phone }
        }
      })
      if (error) setError(error.message)
      else setError('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback` }
    })
  }

  return (
    <>
      <Head>
        <title>Formr — Login</title>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes islandIn {
          from { opacity: 0; transform: scale(0.96) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .s1 { opacity:0; animation: fadeSlideUp 0.5s ease 0.1s forwards; }
        .s2 { opacity:0; animation: fadeSlideUp 0.5s ease 0.2s forwards; }
        .s3 { opacity:0; animation: fadeSlideUp 0.5s ease 0.3s forwards; }
        .s4 { opacity:0; animation: fadeSlideUp 0.5s ease 0.4s forwards; }
        .s5 { opacity:0; animation: fadeSlideUp 0.5s ease 0.5s forwards; }

        .island {
          background: #161616;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          animation: islandIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
          position: relative;
          z-index: 10;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          color: white;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .google-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .divider-text {
          font-size: 11px;
          color: #505050;
          white-space: nowrap;
        }

        .dark-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 14px;
          color: white;
          outline: none;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dark-input::placeholder { color: #404040; }
        .dark-input:focus {
          border-color: rgba(26,122,74,0.5);
          box-shadow: 0 0 0 3px rgba(26,122,74,0.08);
        }

        .sign-btn {
          width: 100%;
          padding: 13px;
          background: #1A7A4A;
          color: white; border: none;
          border-radius: 12px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 0 0 0 rgba(26,122,74,0);
        }
        .sign-btn:hover {
          background: #155C38;
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(26,122,74,0.35);
        }
        .sign-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .toggle-btn {
          background: none; border: none;
          color: #1A7A4A; font-weight: 500;
          cursor: pointer; font-size: 13px;
          font-family: 'Inter', sans-serif;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: opacity 0.2s;
        }
        .toggle-btn:hover { opacity: 0.8; }

        .graph-line {
          animation: drawLine 2s ease forwards;
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Green orbs */}
      <div style={{ position: 'fixed', top: '15%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '8%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.05) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 2 }}>

        <div className="island">

          {/* Logo */}
          <div className="s1" style={{ marginBottom: '28px' }}>
            <Logo onClick={() => router.push('/')} />
          </div>

          {/* Heading */}
          <div className="s2" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', fontWeight: '400', color: 'white', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: '13px', color: '#505050' }}>
              {isSignUp ? 'Free forever. No credit card needed.' : 'Sign in to continue building forms.'}
            </p>
          </div>

          {/* Google button */}
          <div className="s3">
            <button className="google-btn" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="divider s3">
            <div className="divider-line" />
            <span className="divider-text">or continue with email</span>
            <div className="divider-line" />
          </div>

          {/* Form fields */}
          <div className="s4" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {isSignUp && (
              <>
                <input className="dark-input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                <input className="dark-input" type="tel" placeholder="Phone number (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
              </>
            )}
            <input className="dark-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} />
            <input className="dark-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', backgroundColor: error.includes('Check') ? 'rgba(26,122,74,0.1)' : 'rgba(220,38,38,0.08)', border: `1px solid ${error.includes('Check') ? 'rgba(26,122,74,0.25)' : 'rgba(220,38,38,0.2)'}` }}>
              <p style={{ fontSize: '12px', color: error.includes('Check') ? '#1A7A4A' : '#f87171' }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="s4">
            <button className="sign-btn" onClick={handleAuth} disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </div>

          {/* Toggle */}
          <div className="s5" style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#505050' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button className="toggle-btn" onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
                {isSignUp ? 'Sign in' : 'Sign up free'}
              </button>
            </p>
          </div>

          {/* Trust bar */}
          <div className="s5" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['No credit card', 'Free forever', 'Instant QR'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />
                <span style={{ fontSize: '10px', color: '#404040' }}>{item}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}