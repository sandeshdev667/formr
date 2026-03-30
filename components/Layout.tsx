import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  showNav?: boolean
  navType?: 'app' | 'marketing'
  userEmail?: string
  onSignOut?: () => void
}

export default function Layout({ children, showNav = true, navType = 'app', userEmail, onSignOut }: LayoutProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          background-color: #0D0D0D;
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* Page fade transition */
        .page-wrapper {
          opacity: 0;
          animation: pageFadeIn 0.4s ease forwards;
        }
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Stagger utility classes */
        .stagger-1 { opacity: 0; animation: fadeUp 0.5s ease forwards; animation-delay: 0.05s; }
        .stagger-2 { opacity: 0; animation: fadeUp 0.5s ease forwards; animation-delay: 0.1s; }
        .stagger-3 { opacity: 0; animation: fadeUp 0.5s ease forwards; animation-delay: 0.15s; }
        .stagger-4 { opacity: 0; animation: fadeUp 0.5s ease forwards; animation-delay: 0.2s; }
        .stagger-5 { opacity: 0; animation: fadeUp 0.5s ease forwards; animation-delay: 0.25s; }
        .stagger-6 { opacity: 0; animation: fadeUp 0.5s ease forwards; animation-delay: 0.3s; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -15px) scale(1.03); }
          66% { transform: translate(-15px, 10px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-20px, 15px) scale(1.02); }
          66% { transform: translate(15px, -10px) scale(0.98); }
        }

        /* Button styles */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1A7A4A;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 0 0 rgba(26,122,74,0);
        }
        .btn-primary:hover {
          background: #155C38;
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(26,122,74,0.4), 0 4px 12px rgba(26,122,74,0.3);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          color: #A0A0A0;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          border-color: rgba(255,255,255,0.2);
        }

        .btn-ghost {
          background: none;
          border: none;
          color: #505050;
          font-size: 13px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .btn-ghost:hover { color: white; background: rgba(255,255,255,0.06); }

        /* Input styles */
        .input-dark {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 14px;
          color: white;
          outline: none;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .input-dark::placeholder { color: #505050; }
        .input-dark:focus {
          border-color: rgba(26,122,74,0.5);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(26,122,74,0.1), 0 0 12px rgba(26,122,74,0.05);
        }

        /* Card styles */
        .card-dark {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .card-dark:hover {
          border-color: rgba(26,122,74,0.2);
          box-shadow: 0 0 0 1px rgba(26,122,74,0.1), 0 8px 32px rgba(26,122,74,0.08);
          transform: translateY(-2px);
        }

        /* Grid background pattern */
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0D0D0D; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #222; }
      `}</style>

      <div className="page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
        {showNav && (
          <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            backgroundColor: 'rgba(13,13,13,0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '0 32px',
          }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                onClick={() => router.push(navType === 'app' ? '/dashboard' : '/')}
                style={{ fontSize: '17px', fontWeight: '600', color: 'white', cursor: 'pointer', letterSpacing: '-0.3px' }}
              >
                Formr
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {navType === 'app' && userEmail && (
                  <span style={{ fontSize: '13px', color: '#505050' }}>{userEmail}</span>
                )}
                {navType === 'marketing' && (
                  <button className="btn-ghost" onClick={() => router.push('/login')}>Sign in</button>
                )}
                {navType === 'app' && onSignOut && (
                  <button className="btn-secondary" onClick={onSignOut} style={{ padding: '7px 14px' }}>
                    Sign out
                  </button>
                )}
                {navType === 'marketing' && (
                  <button className="btn-primary" onClick={() => router.push('/login')} style={{ padding: '9px 18px' }}>
                    Get started
                  </button>
                )}
              </div>
            </div>
          </nav>
        )}
        {children}
      </div>
    </>
  )
}