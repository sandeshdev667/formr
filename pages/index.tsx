import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; color: white; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.04); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-15px,20px) scale(1.02); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .s1 { opacity:0; animation: fadeUp 0.6s ease 0.1s forwards; }
        .s2 { opacity:0; animation: fadeUp 0.6s ease 0.2s forwards; }
        .s3 { opacity:0; animation: fadeUp 0.6s ease 0.3s forwards; }
        .s4 { opacity:0; animation: fadeUp 0.6s ease 0.4s forwards; }
        .s5 { opacity:0; animation: fadeUp 0.6s ease 0.5s forwards; }
        .s6 { opacity:0; animation: fadeUp 0.6s ease 0.6s forwards; }

        .nav-link {
          background: none; border: none;
          color: #505050; font-size: 14px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          padding: 8px 12px; border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-link:hover { color: white; background: rgba(255,255,255,0.06); }

        .btn-green {
          background: #1A7A4A; color: white; border: none;
          border-radius: 10px; padding: 11px 22px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 0 0 0 rgba(26,122,74,0);
        }
        .btn-green:hover {
          background: #155C38;
          transform: translateY(-2px);
          box-shadow: 0 0 24px rgba(26,122,74,0.4);
        }

        .btn-ghost {
          background: none; border: none;
          color: #505050; font-size: 14px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .btn-ghost:hover { color: white; }

        .feature-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .feature-card:hover {
          border-color: rgba(26,122,74,0.25);
          box-shadow: 0 0 0 1px rgba(26,122,74,0.1), 0 8px 32px rgba(26,122,74,0.08);
          transform: translateY(-3px);
        }

        .mode-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        .mode-card:hover {
          border-color: rgba(26,122,74,0.2);
          box-shadow: 0 0 20px rgba(26,122,74,0.06);
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #1A7A4A 40%, #fff 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .divider { height: 1px; background: rgba(255,255,255,0.06); }
      `}</style>

      <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: 'rgba(13,13,13,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0 32px',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '17px', fontWeight: '600', color: 'white', letterSpacing: '-0.3px' }}>Formr</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="nav-link" onClick={() => router.push('/login')}>Sign in</button>
              <button className="btn-green" onClick={() => router.push('/login')} style={{ padding: '9px 18px', fontSize: '13px' }}>
                Get started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="grid-bg" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Orbs */}
          <div style={{ position: 'absolute', top: '10%', left: '20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.12) 0%, transparent 65%)', animation: 'orbFloat1 12s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '30%', right: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.07) 0%, transparent 65%)', animation: 'orbFloat2 16s ease-in-out infinite', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

            <div className="s1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.25)', borderRadius: '100px', padding: '6px 14px', marginBottom: '32px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A7A4A', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '12px', color: '#1A7A4A', fontWeight: '500' }}>Simple forms. Real responses.</span>
            </div>

            <h1 className="s2" style={{ fontFamily: 'DM Serif Display, serif', fontSize: '72px', fontWeight: '400', color: 'white', lineHeight: '1.05', marginBottom: '24px', letterSpacing: '-2px' }}>
              The cleanest way to<br />
              <span className="shimmer-text">collect feedback</span>
            </h1>

            <p className="s3" style={{ fontSize: '18px', color: '#505050', marginBottom: '40px', lineHeight: '1.7', maxWidth: '520px', margin: '0 auto 40px' }}>
              Create beautiful forms in minutes, generate a QR code, and start collecting responses — no clutter, no complexity.
            </p>

            <div className="s4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <button className="btn-green" onClick={() => router.push('/login')} style={{ padding: '14px 28px', fontSize: '15px' }}>
                Start for free
              </button>
              <button className="btn-ghost" onClick={() => router.push('/login')} style={{ fontSize: '15px', padding: '14px 16px' }}>
                See how it works →
              </button>
            </div>

            {/* Trust bar */}
            <div className="s5" style={{ marginTop: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
              {['Always free', 'No credit card', 'Instant QR codes'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="#1A7A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '13px', color: '#505050' }}>{item}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="divider" />

        {/* How it works */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>How it works</p>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '44px', fontWeight: '400', color: 'white', letterSpacing: '-0.5px' }}>
              Three steps to your first response
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { step: '01', title: 'Create your form', desc: 'Answer 3 quick questions and land on the perfect starting point. No blank canvas.' },
              { step: '02', title: 'Share via QR or link', desc: 'Get a print-ready QR code and a shareable link instantly. Perfect for physical spaces.' },
              { step: '03', title: 'Collect responses', desc: 'Watch responses come in on your dashboard. Clean, simple, actionable.' },
            ].map((item) => (
              <div key={item.step} className="feature-card">
                <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', letterSpacing: '0.08em', marginBottom: '16px' }}>{item.step}</p>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'white', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#505050', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Three modes */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Three modes</p>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '44px', fontWeight: '400', color: 'white', letterSpacing: '-0.5px' }}>
              Pick the experience that fits
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { name: 'Quick', tag: 'Fast', desc: 'Minimal questions, big tap targets. Done in seconds. Perfect for receipts and table cards.', color: '#1A7A4A' },
              { name: 'Form', tag: 'Standard', desc: 'All questions visible, clean layout. Familiar and comfortable for surveys and info gathering.', color: '#A0A0A0' },
              { name: 'Flow', tag: 'Immersive', desc: 'One question at a time, full screen. Focused and engaging — highest completion rates.', color: 'white' },
            ].map((mode) => (
              <div key={mode.name} className="mode-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '500', color: mode.color }}>{mode.name}</h4>
                  <span style={{ fontSize: '11px', color: '#505050', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '3px 10px' }}>{mode.tag}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#505050', lineHeight: '1.6' }}>{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Coming soon */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #141414 0%, #0f1a14 100%)',
            border: '1px solid rgba(26,122,74,0.2)',
            borderRadius: '24px',
            padding: '64px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px', position: 'relative', zIndex: 1 }}>Coming soon</p>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '44px', fontWeight: '400', color: 'white', marginBottom: '16px', letterSpacing: '-0.5px', maxWidth: '500px', lineHeight: '1.15', position: 'relative', zIndex: 1 }}>
              The form is just the beginning.
            </h3>
            <p style={{ fontSize: '15px', color: '#505050', lineHeight: '1.7', maxWidth: '480px', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
              We're building response analytics so you don't just collect feedback — you understand it. Charts, trends, averages, and insights that actually tell you something.
            </p>
            <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
              {['Response trends', 'Rating averages', 'Completion rates'].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />
                  <span style={{ fontSize: '13px', color: '#505050' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Testimonial */}
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', fontWeight: '400', color: 'white', lineHeight: '1.5', marginBottom: '28px', fontStyle: 'italic' }}>
            "Finally a form tool that doesn't get in the way. Set up in 2 minutes, QR code ready instantly."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(26,122,74,0.2)', border: '1px solid rgba(26,122,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A7A4A' }}>S</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Early user</p>
              <p style={{ fontSize: '12px', color: '#505050' }}>Restaurant owner, Texas</p>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* CTA */}
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '96px 32px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '52px', fontWeight: '400', color: 'white', marginBottom: '16px', letterSpacing: '-1px', lineHeight: '1.05' }}>
            Ready to get started?
          </h3>
          <p style={{ fontSize: '16px', color: '#505050', marginBottom: '36px', lineHeight: '1.6' }}>
            Create your first form in under 2 minutes. Completely free, no credit card required.
          </p>
          <button className="btn-green" onClick={() => router.push('/login')} style={{ padding: '16px 36px', fontSize: '15px' }}>
            Create your first form
          </button>
        </div>

        {/* Footer */}
        <div className="divider" />
        <div style={{ padding: '24px 32px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>Formr</span>
            <span style={{ fontSize: '12px', color: '#505050' }}>Built with Next.js & Supabase</span>
          </div>
        </div>

      </div>
    </>
  )
}