import { useRouter } from 'next/router'
import Logo from '../components/Logo'

export default function NotFound() {
  const router = useRouter()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .s1 { opacity: 0; animation: fadeUp 0.5s ease 0.1s forwards; }
        .s2 { opacity: 0; animation: fadeUp 0.5s ease 0.2s forwards; }
        .s3 { opacity: 0; animation: fadeUp 0.5s ease 0.3s forwards; }
        .s4 { opacity: 0; animation: fadeUp 0.5s ease 0.4s forwards; }

        .home-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1A7A4A; color: white; border: none;
          border-radius: 10px; padding: 12px 24px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .home-btn:hover {
          background: #155C38;
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(26,122,74,0.35);
        }

        .back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #A0A0A0; border-radius: 10px; padding: 12px 24px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .back-btn:hover { background: rgba(255,255,255,0.08); color: white; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="grid-bg" style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Orb */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Navbar */}
        <nav style={{ padding: '20px 32px' }}>
          <Logo onClick={() => router.push('/')} />
        </nav>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 1, textAlign: 'center' }}>

          {/* Floating 404 */}
          <div className="s1" style={{ animation: 'float 4s ease-in-out infinite', marginBottom: '32px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: '160px',
                fontWeight: '400',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(26,122,74,0.3)',
                lineHeight: '1',
                letterSpacing: '-8px',
                userSelect: 'none',
              }}>404</span>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '80px', height: '80px' }}>
                  <svg viewBox="0 0 22 22" fill="none" width="80" height="80">
                    <rect x="1" y="1" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5" opacity="0.6"/>
                    <rect x="3" y="3" width="4" height="4" rx="1" fill="#1A7A4A" opacity="0.6"/>
                    <rect x="13" y="1" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5" opacity="0.6"/>
                    <rect x="15" y="3" width="4" height="4" rx="1" fill="#1A7A4A" opacity="0.6"/>
                    <rect x="1" y="13" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5" opacity="0.6"/>
                    <rect x="3" y="15" width="4" height="4" rx="1" fill="#1A7A4A" opacity="0.6"/>
                    <rect x="13" y="13" width="4" height="4" rx="1" fill="#1A7A4A" opacity="0.3"/>
                    <rect x="18" y="13" width="3" height="3" rx="1" fill="#1A7A4A" opacity="0.3"/>
                    <rect x="13" y="18" width="8" height="3" rx="1" fill="#1A7A4A" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <h1 className="s2" style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', fontWeight: '400', color: 'white', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Page not found
          </h1>

          <p className="s3" style={{ fontSize: '15px', color: '#505050', marginBottom: '36px', maxWidth: '380px', lineHeight: '1.6' }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div className="s4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="home-btn" onClick={() => router.push('/')}>
              Go home
            </button>
            <button className="back-btn" onClick={() => router.back()}>
              ← Go back
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', color: '#333' }}>Formr</span>
        </div>

      </div>
    </>
  )
}