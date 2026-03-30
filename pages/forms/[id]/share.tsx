import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/router'
import { QRCodeSVG } from 'qrcode.react'

export default function ShareForm() {
  const router = useRouter()
  const { id } = router.query
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/f/${id}`

  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  const loadForm = async () => {
    const { data } = await supabase.from('forms').select('*').eq('id', id).single()
    if (data) setForm(data)
    setLoading(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(formUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      ctx?.drawImage(img, 0, 0, 400, 400)
      const a = document.createElement('a')
      a.download = `${form?.title || 'formr'}-qr.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#1A7A4A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; color: white; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes checkIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        .back-btn {
          background: none; border: none;
          color: #505050; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px; border-radius: 8px;
          transition: all 0.2s;
        }
        .back-btn:hover { color: white; background: rgba(255,255,255,0.04); }

        .copy-btn {
          background: none; border: none;
          color: #505050; font-size: 12px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          padding: 6px 12px; border-radius: 8px;
          transition: all 0.2s; white-space: nowrap;
        }
        .copy-btn:hover { color: white; background: rgba(255,255,255,0.06); }

        .download-btn {
          width: 100%;
          background: #1A7A4A; color: white; border: none;
          border-radius: 12px; padding: 14px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 0 0 0 rgba(26,122,74,0);
        }
        .download-btn:hover {
          background: #155C38;
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(26,122,74,0.35);
        }

        .action-link {
          background: none; border: none;
          color: #505050; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: color 0.2s; padding: 0;
          display: flex; align-items: center; gap: 6px;
        }
        .action-link:hover { color: white; }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', fontFamily: 'Inter, sans-serif' }}>

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: 'rgba(13,13,13,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0 32px',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button className="back-btn" onClick={() => router.push(`/forms/${id}/edit`)}>
              ← Edit form
            </button>
            <button className="back-btn" onClick={() => router.push('/dashboard')}>
              Dashboard
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '64px 24px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px', opacity: 0, animation: 'fadeUp 0.5s ease 0.1s forwards' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.2)', borderRadius: '20px', padding: '4px 12px', marginBottom: '16px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A7A4A', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '500' }}>{form?.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', fontWeight: '400', color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {form?.title}
            </h1>
            <p style={{ fontSize: '14px', color: '#505050' }}>
              Share this QR code or link to start collecting responses
            </p>
          </div>

          {/* QR Code */}
          <div style={{ opacity: 0, animation: 'fadeUp 0.5s ease 0.2s forwards' }}>
            <div style={{
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              padding: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow behind QR */}
              <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', position: 'relative', zIndex: 1 }}>
                <QRCodeSVG
                  id="qr-code"
                  value={formUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0D0D0D"
                  level="H"
                />
              </div>
            </div>

            {/* Link row */}
            <div style={{
              backgroundColor: '#141414',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '12px', color: '#505050', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {formUrl}
              </span>
              <button className="copy-btn" onClick={copyLink}>
                {copied ? (
                  <span style={{ color: '#1A7A4A', animation: 'checkIn 0.2s ease' }}>✓ Copied</span>
                ) : 'Copy'}
              </button>
            </div>

            {/* Download button */}
            <button className="download-btn" onClick={downloadQR}>
              Download QR code
            </button>

            {/* Secondary actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
              <button className="action-link" onClick={() => router.push(`/forms/${id}/responses`)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3h10M2 7h6M2 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                View responses
              </button>
              <button className="action-link" onClick={() => window.open(formUrl, '_blank')}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M6 2H2v10h10V8M8 2h4v4M8 6l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Preview form
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}