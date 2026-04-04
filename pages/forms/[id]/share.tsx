import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/router'
import { QRCodeSVG } from 'qrcode.react'
import Logo from '../../../components/Logo'
import Head from 'next/head'
import Loader from '../../../components/Loader'

export default function ShareForm() {
  const router = useRouter()
  const { id } = router.query
  const [form, setForm] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [responseCount, setResponseCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)

  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/f/${id}`

  const modeConfig: Record<string, { color: string, bg: string, border: string }> = {
    quick: { color: '#1A7A4A', bg: 'rgba(26,122,74,0.1)', border: 'rgba(26,122,74,0.25)' },
    form: { color: '#A0A0A0', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
    flow: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)' },
  }

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    const [{ data: formData }, { data: questionsData }, { count }] = await Promise.all([
      supabase.from('forms').select('*').eq('id', id).single(),
      supabase.from('questions').select('*').eq('form_id', id),
      supabase.from('responses').select('*', { count: 'exact', head: true }).eq('form_id', id),
    ])
    if (formData) setForm(formData)
    if (questionsData) setQuestions(questionsData)
    setResponseCount(count || 0)
    setLoading(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(formUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleActive = async () => {
    setToggling(true)
    await supabase.from('forms').update({ is_active: !form.is_active }).eq('id', id)
    setForm({ ...form, is_active: !form.is_active })
    setTimeout(() => setToggling(false), 400)
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

  const printQR = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const svg = document.getElementById('qr-code')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR — ${form?.title}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Inter, sans-serif; background: white; }
            .qr-wrap { background: white; padding: 32px; border-radius: 16px; text-align: center; }
            h2 { margin: 16px 0 4px; font-size: 20px; color: #0D0D0D; }
            p { margin: 0; font-size: 13px; color: #666; }
            .brand { margin-top: 12px; font-size: 12px; color: #1A7A4A; font-weight: 600; letter-spacing: 0.05em; }
          </style>
        </head>
        <body>
          <div class="qr-wrap">
            ${svgData}
            <h2>${form?.title}</h2>
            <p>Scan to respond</p>
            <p class="brand">Formr</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (loading) return <Loader label="Loading share page" />

  const mc = modeConfig[form?.mode] || modeConfig.form

  return (
    <>
    <Head>
      <title>Share form — Formr</title>
    </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; color: white; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }

        .back-btn {
          background: none; border: none; color: #505050; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px; border-radius: 8px; transition: all 0.2s;
        }
        .back-btn:hover { color: white; background: rgba(255,255,255,0.04); }

        .download-btn {
          width: 100%; background: #1A7A4A; color: white; border: none;
          border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .download-btn:hover { background: #155C38; transform: translateY(-2px); box-shadow: 0 0 20px rgba(26,122,74,0.35); }

        .secondary-btn {
          width: 100%; background: rgba(255,255,255,0.04); color: white;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 13px;
          font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .secondary-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }

        .toggle-btn {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s ease;
        }
        .toggle-btn:hover { background: rgba(255,255,255,0.06); }
        .toggle-btn.active { background: rgba(26,122,74,0.08); border-color: rgba(26,122,74,0.25); }

        .share-icon-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 10px; border-radius: 12px; cursor: pointer;
          transition: all 0.2s ease; flex: 1; min-width: 64px;
          font-family: 'Inter', sans-serif; border: 1px solid;
        }
        .share-icon-btn:hover { transform: translateY(-2px); }

        .info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .info-row:last-child { border-bottom: none; padding-bottom: 0; }

        .action-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px; border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          transition: all 0.2s; border: 1px solid;
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: 'rgba(13,13,13,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0 32px',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Logo onClick={() => router.push('/dashboard')} />
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '16px' }}>/</span>
              <button className="back-btn" style={{ padding: '4px 8px' }} onClick={() => router.push(`/forms/${id}/edit`)}>
                ← Edit form
              </button>
            </div>
            <button className="back-btn" onClick={() => router.push('/dashboard')}>Dashboard</button>
          </div>
        </nav>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' }}>

          {/* Header */}
          <div style={{ marginBottom: '40px', opacity: 0, animation: 'fadeUp 0.4s ease 0.05s forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', fontWeight: '400', color: 'white', letterSpacing: '-0.5px' }}>
                {form?.title}
              </h1>
              <span style={{
                fontSize: '10px', fontWeight: '600', color: mc.color,
                backgroundColor: mc.bg, border: `1px solid ${mc.border}`,
                borderRadius: '6px', padding: '2px 10px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {form?.mode}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#505050' }}>
              Share your QR code or link to start collecting responses
            </p>
          </div>

          {/* Two column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

            {/* Left — QR + Share */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0, animation: 'fadeUp 0.5s ease 0.1s forwards' }}>

              {/* QR Card */}
              <div style={{
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 20px 14px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <QRCodeSVG
                    id="qr-code"
                    value={formUrl}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#0D0D0D"
                    level="H"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingTop: '8px', borderTop: '1px solid #f0f0f0', width: '100%', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 22 22" fill="none">
                      <rect x="1" y="1" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5"/>
                      <rect x="3" y="3" width="4" height="4" rx="1" fill="#1A7A4A"/>
                      <rect x="13" y="1" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5"/>
                      <rect x="15" y="3" width="4" height="4" rx="1" fill="#1A7A4A"/>
                      <rect x="1" y="13" width="8" height="8" rx="2" stroke="#1A7A4A" strokeWidth="1.5"/>
                      <rect x="3" y="15" width="4" height="4" rx="1" fill="#1A7A4A"/>
                      <rect x="13" y="13" width="4" height="4" rx="1" fill="#1A7A4A" opacity="0.4"/>
                      <rect x="18" y="13" width="3" height="3" rx="1" fill="#1A7A4A" opacity="0.4"/>
                      <rect x="13" y="18" width="8" height="3" rx="1" fill="#1A7A4A" opacity="0.4"/>
                    </svg>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#1A7A4A', letterSpacing: '0.05em' }}>Formr</span>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#505050', marginTop: '16px', position: 'relative', zIndex: 1 }}>Scan to open the form</p>
              </div>

              {/* Share icons */}
              <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                <p style={{ fontSize: '11px', color: '#505050', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Share via</p>
                <div style={{ display: 'flex', gap: '10px' }}>

                  {/* WhatsApp */}
                  <button
                    className="share-icon-btn"
                    onClick={() => window.open(`https://wa.me/?text=Fill out my form: ${encodeURIComponent(formUrl)}`, '_blank')}
                    style={{ background: 'rgba(37,211,102,0.08)', borderColor: 'rgba(37,211,102,0.2)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.08)')}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span style={{ fontSize: '10px', color: '#25D366', fontWeight: '500' }}>WhatsApp</span>
                  </button>

                  {/* Telegram */}
                  <button
                    className="share-icon-btn"
                    onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(formUrl)}&text=Fill out my form`, '_blank')}
                    style={{ background: 'rgba(40,168,225,0.08)', borderColor: 'rgba(40,168,225,0.2)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(40,168,225,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(40,168,225,0.08)')}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#28A8E1">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.032 9.57c-.144.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.26 14.4l-2.95-.924c-.64-.203-.654-.64.136-.948l11.532-4.448c.533-.194 1-.12.584.168z"/>
                    </svg>
                    <span style={{ fontSize: '10px', color: '#28A8E1', fontWeight: '500' }}>Telegram</span>
                  </button>

                  {/* X/Twitter */}
                  <button
                    className="share-icon-btn"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=Fill out my form&url=${encodeURIComponent(formUrl)}`, '_blank')}
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span style={{ fontSize: '10px', color: '#A0A0A0', fontWeight: '500' }}>X</span>
                  </button>

                  {/* Email */}
                  <button
                    className="share-icon-btn"
                    onClick={() => window.open(`mailto:?subject=Please fill out this form&body=Hi, please fill out this form: ${encodeURIComponent(formUrl)}`, '_blank')}
                    style={{ background: 'rgba(234,67,53,0.08)', borderColor: 'rgba(234,67,53,0.2)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(234,67,53,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(234,67,53,0.08)')}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="3" fill="#EA4335"/>
                      <path d="M2 8l10 6 10-6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: '10px', color: '#EA4335', fontWeight: '500' }}>Email</span>
                  </button>

                  {/* More / Native share */}
                  <button
                    className="share-icon-btn"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: form?.title, text: 'Fill out my form', url: formUrl })
                      } else { copyLink() }
                    }}
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  >
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="2.5" cy="7" r="1.5" fill="white"/>
                        <circle cx="7" cy="7" r="1.5" fill="white"/>
                        <circle cx="11.5" cy="7" r="1.5" fill="white"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '10px', color: '#A0A0A0', fontWeight: '500' }}>More</span>
                  </button>

                </div>
              </div>
            </div>

            {/* Right — Actions + Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', opacity: 0, animation: 'fadeUp 0.5s ease 0.2s forwards' }}>

              {/* Active toggle */}
              <button
                className={`toggle-btn ${form?.is_active ? 'active' : ''}`}
                onClick={toggleActive}
                disabled={toggling}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: form?.is_active ? '#1A7A4A' : '#505050',
                    boxShadow: form?.is_active ? '0 0 8px rgba(26,122,74,0.8)' : 'none',
                    animation: form?.is_active ? 'pulse 2s ease-in-out infinite' : 'none',
                    transition: 'all 0.3s',
                  }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: 'white', marginBottom: '1px' }}>
                      {form?.is_active ? 'Accepting responses' : 'Not accepting responses'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#505050' }}>
                      {form?.is_active ? 'Click to pause' : 'Click to activate'}
                    </p>
                  </div>
                </div>
                <div style={{
                  width: '36px', height: '20px', borderRadius: '10px',
                  backgroundColor: form?.is_active ? '#1A7A4A' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'all 0.3s', flexShrink: 0,
                }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    backgroundColor: 'white', position: 'absolute', top: '3px',
                    left: form?.is_active ? '19px' : '3px',
                    transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  }} />
                </div>
              </button>

              {/* Copy link */}
              <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#505050', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {formUrl}
                </span>
                <button
                  onClick={copyLink}
                  style={{ background: copied ? 'rgba(26,122,74,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(26,122,74,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: '500', color: copied ? '#1A7A4A' : 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                >
                  {copied ? '✓ Copied' : 'Copy link'}
                </button>
              </div>

              {/* Download + Print */}
              <button className="download-btn" onClick={downloadQR}>Download QR code</button>
              <button className="secondary-btn" onClick={printQR}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="5" width="10" height="7" rx="1" stroke="white" strokeWidth="1.2"/>
                  <path d="M4 5V3a1 1 0 011-1h4a1 1 0 011 1v2" stroke="white" strokeWidth="1.2"/>
                  <path d="M4 9h6M4 11h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Print QR code
              </button>

              {/* Form details */}
              <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                <p style={{ fontSize: '11px', color: '#505050', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Form details</p>
                {[
                  { label: 'Mode', value: form?.mode, accent: true },
                  { label: 'Questions', value: `${questions.length}` },
                  { label: 'Responses', value: `${responseCount}` },
                  { label: 'Status', value: form?.is_active ? 'Active' : 'Paused' },
                  { label: 'Created', value: new Date(form?.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                ].map((row) => (
                  <div className="info-row" key={row.label}>
                    <span style={{ fontSize: '12px', color: '#505050' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: row.accent ? mc.color : row.label === 'Status' ? (form?.is_active ? '#1A7A4A' : '#505050') : 'white', textTransform: row.accent ? 'capitalize' : 'none' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* View responses + Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  className="action-btn"
                  onClick={() => router.push(`/forms/${id}/responses`)}
                  style={{ background: 'rgba(26,122,74,0.08)', borderColor: 'rgba(26,122,74,0.2)', color: '#1A7A4A' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,122,74,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(26,122,74,0.08)')}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3h10M2 7h6M2 11h4" stroke="#1A7A4A" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Responses
                </button>
                <button
                  className="action-btn"
                  onClick={() => window.open(formUrl, '_blank')}
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M6 2H2v10h10V8M8 2h4v4M8 6l4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Preview
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}