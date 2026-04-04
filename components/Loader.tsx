export default function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }

        @keyframes drawStroke {
          from { stroke-dashoffset: 100; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes fillBlock {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }

        .qr-rect {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          opacity: 0;
        }
        .qr-fill {
          opacity: 0;
          transform-origin: center;
          transform: scale(0.5);
        }

        .r1 { animation: drawStroke 0.4s ease 0.1s forwards; }
        .r2 { animation: drawStroke 0.4s ease 0.25s forwards; }
        .r3 { animation: drawStroke 0.4s ease 0.4s forwards; }
        .r4 { animation: drawStroke 0.4s ease 0.2s forwards; }
        .r5 { animation: drawStroke 0.4s ease 0.35s forwards; }

        .f1 { animation: fillBlock 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.45s forwards; }
        .f2 { animation: fillBlock 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.55s forwards; }
        .f3 { animation: fillBlock 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.65s forwards; }
        .f4 { animation: fillBlock 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.72s forwards; }
        .f5 { animation: fillBlock 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.79s forwards; }
        .f6 { animation: fillBlock 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.86s forwards; }

        .wordmark { opacity: 0; animation: fadeUp 0.4s ease 0.9s forwards; }
        .sublabel { opacity: 0; animation: fadeUp 0.4s ease 1.0s forwards; }
        .dot { animation: pulse 1.5s ease-in-out infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background orb */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,122,74,0.08) 0%, transparent 65%)',
          animation: 'orbFloat 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Animated QR Logo */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
          <svg width="72" height="72" viewBox="0 0 22 22" fill="none">

            {/* Top-left square — draws first */}
            <rect className="qr-rect r1" x="1" y="1" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5"/>
            <rect className="qr-fill f1" x="3" y="3" width="4" height="4" rx="1" fill="#1A7A4A"/>

            {/* Top-right square — draws second */}
            <rect className="qr-rect r2" x="13" y="1" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5"/>
            <rect className="qr-fill f2" x="15" y="3" width="4" height="4" rx="1" fill="#1A7A4A"/>

            {/* Bottom-left square — draws third */}
            <rect className="qr-rect r3" x="1" y="13" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5"/>
            <rect className="qr-fill f3" x="3" y="15" width="4" height="4" rx="1" fill="#1A7A4A"/>

            {/* Bottom-right dots — fill last */}
            <rect className="qr-fill f4" x="13" y="13" width="4" height="4" rx="1" fill="#1A7A4A" opacity="0.4"/>
            <rect className="qr-fill f5" x="18" y="13" width="3" height="3" rx="1" fill="#1A7A4A" opacity="0.4"/>
            <rect className="qr-fill f6" x="13" y="18" width="8" height="3" rx="1" fill="#1A7A4A" opacity="0.4"/>

          </svg>

          {/* Green glow behind logo */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,122,74,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: -1,
          }} />
        </div>

        {/* Wordmark */}
        <div className="wordmark" style={{ marginBottom: '16px' }}>
          <span style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '28px',
            fontWeight: '400',
            color: 'white',
            letterSpacing: '-0.5px',
          }}>
            Formr
          </span>
        </div>

        {/* Animated dots */}
        <div className="sublabel" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#505050' }}>{label}</span>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="dot"
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#1A7A4A',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </>
  )
}