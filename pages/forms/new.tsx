import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'
import Logo from '../../components/Logo'
import Head from 'next/head'
import Loader from '../../components/Loader'

const purposes = [
  {
    key: 'feedback',
    label: 'Feedback',
    desc: 'Collect opinions and reviews',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" stroke="#1A7A4A" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'survey',
    label: 'Survey',
    desc: 'Gather structured responses',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h8M2 12h5" stroke="#1A7A4A" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'registration',
    label: 'Registration',
    desc: 'Sign ups and event forms',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="#1A7A4A" strokeWidth="1.2"/>
        <path d="M5 8h6M8 5v6" stroke="#1A7A4A" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'info',
    label: 'Info gathering',
    desc: 'Collect data from people',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="#1A7A4A" strokeWidth="1.2"/>
        <path d="M8 7v4M8 5.5v.5" stroke="#1A7A4A" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const modes = [
  {
    key: 'quick',
    label: 'Quick',
    desc: 'Tap & done',
    fill: 'rgba(26,122,74,0.06)',
    activeFill: 'rgba(26,122,74,0.18)',
    border: 'rgba(26,122,74,0.15)',
    activeBorder: 'rgba(26,122,74,0.5)',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
        <div style={{ width: '24px', height: '2px', borderRadius: '2px', backgroundColor: 'rgba(26,122,74,0.6)' }} />
        <div style={{ width: '16px', height: '2px', borderRadius: '2px', backgroundColor: 'rgba(26,122,74,0.3)' }} />
      </div>
    ),
  },
  {
    key: 'form',
    label: 'Form',
    desc: 'All visible',
    fill: 'rgba(26,122,74,0.1)',
    activeFill: 'rgba(26,122,74,0.22)',
    border: 'rgba(26,122,74,0.2)',
    activeBorder: 'rgba(26,122,74,0.55)',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
        <div style={{ width: '24px', height: '2px', borderRadius: '2px', backgroundColor: 'rgba(26,122,74,0.6)' }} />
        <div style={{ width: '20px', height: '2px', borderRadius: '2px', backgroundColor: 'rgba(26,122,74,0.4)' }} />
        <div style={{ width: '16px', height: '2px', borderRadius: '2px', backgroundColor: 'rgba(26,122,74,0.2)' }} />
      </div>
    ),
  },
  {
    key: 'flow',
    label: 'Flow',
    desc: 'One by one',
    fill: 'rgba(26,122,74,0.15)',
    activeFill: 'rgba(26,122,74,0.28)',
    border: 'rgba(26,122,74,0.28)',
    activeBorder: 'rgba(26,122,74,0.65)',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
        <div style={{ width: '24px', height: '2px', borderRadius: '2px', backgroundColor: 'rgba(26,122,74,0.6)' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid rgba(26,122,74,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(26,122,74,0.8)' }} />
        </div>
      </div>
    ),
  },
]

const templates: Record<string, { label: string, type: 'text' | 'rating' | 'yes_no' | 'multiple_choice' }[]> = {
  feedback: [
    { label: 'How would you rate your experience?', type: 'rating' },
    { label: 'Would you recommend us?', type: 'yes_no' },
    { label: 'Any additional comments?', type: 'text' },
  ],
  survey: [
    { label: 'How satisfied are you overall?', type: 'rating' },
    { label: 'What did you enjoy most?', type: 'text' },
    { label: 'What could we improve?', type: 'text' },
  ],
  registration: [
    { label: 'Full name', type: 'text' },
    { label: 'Email address', type: 'text' },
    { label: 'Any notes or special requests?', type: 'text' },
  ],
  info: [
    { label: 'What is your name?', type: 'text' },
    { label: 'What is your role or organization?', type: 'text' },
    { label: 'What information would you like to share?', type: 'text' },
  ],
}

export default function NewForm() {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  const handlePurposeClick = (key: string) => {
    setExpanded(expanded === key ? null : key)
    setSelectedMode(null)
  }

  const handleModeSelect = async (purposeKey: string, modeKey: string) => {
    setSelectedMode(modeKey)
    setTimeout(async () => {
      await createForm(purposeKey, modeKey)
    }, 300)
  }

  const createForm = async (purposeKey: string, modeKey: string) => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data: form, error } = await supabase
      .from('forms')
      .insert({ title: 'Untitled form', mode: modeKey, owner_id: session.user.id })
      .select()
      .single()

    if (error || !form) { setLoading(false); return }

    const templateQuestions = templates[purposeKey] || []
    if (templateQuestions.length > 0) {
      await supabase.from('questions').insert(
        templateQuestions.map((q, i) => ({
          form_id: form.id,
          order_index: i,
          type: q.type,
          label: q.label,
          options: null,
        }))
      )
    }

    router.push(`/forms/${form.id}/edit`)
  }

  if (loading) return <Loader label="Setting up your form" />

  return (
    <>
    <Head>
      <title>New form — Formr</title>
    </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; color: white; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandIn {
          from { opacity: 0; transform: translateY(-8px); max-height: 0; }
          to { opacity: 1; transform: translateY(0); max-height: 200px; }
        }

        .purpose-card {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          overflow: hidden;
          transition: border-color 0.2s ease;
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }
        .purpose-card.active {
          border-color: rgba(26,122,74,0.35);
          background: rgba(26,122,74,0.04);
        }

        .purpose-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .purpose-header:hover { background: rgba(26,122,74,0.05); }

        .mode-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 0 16px 16px;
          animation: fadeUp 0.3s ease forwards;
        }

        .mode-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 14px 10px;
          border-radius: 10px;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mode-btn:hover { transform: translateY(-2px); }
        .mode-btn.selected { transform: scale(0.96); }

        .back-btn {
          background: none; border: none;
          color: #505050; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px; border-radius: 8px;
          transition: all 0.2s;
        }
        .back-btn:hover { color: white; background: rgba(255,255,255,0.04); }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .chevron {
          transition: transform 0.3s ease;
        }
        .chevron.open { transform: rotate(180deg); }

        .new-form-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 40px;
          font-weight: 400;
          color: white;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .new-form-nav {
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .new-form-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          position: relative;
          z-index: 1;
        }

        /* ========== MOBILE RESPONSIVE ========== */
        @media (max-width: 768px) {
          .new-form-heading {
            font-size: 28px;
          }

          .new-form-nav {
            padding: 16px 16px;
          }

          .new-form-content {
            padding: 20px 16px;
            justify-content: flex-start;
          }

          .purpose-header {
            padding: 14px 16px;
            gap: 12px;
          }

          .mode-row {
            padding: 0 12px 12px;
            gap: 6px;
          }

          .mode-btn {
            padding: 12px 6px;
            gap: 6px;
          }
        }

        @media (max-width: 480px) {
          .new-form-heading {
            font-size: 24px;
          }

          .new-form-content {
            padding: 16px 12px;
          }
        }
      `}</style>

      <div className="grid-bg" style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Orb */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,122,74,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Navbar */}
        <div className="new-form-nav">
          <Logo onClick={() => router.push('/dashboard')} />
          <button className="back-btn" onClick={() => router.push('/dashboard')}>← Dashboard</button>
        </div>

        {/* Content */}
        <div className="new-form-content">

          <div style={{ width: '100%', maxWidth: '520px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '36px', opacity: 0, animation: 'fadeUp 0.4s ease 0.05s forwards' }}>
              <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                New form
              </p>
              <h1 className="new-form-heading">
                What do you need<br />the form for?
              </h1>
              <p style={{ fontSize: '14px', color: '#505050' }}>
                Select a purpose and pick your form mode.
              </p>
            </div>

            {/* Purpose cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {purposes.map((p, i) => (
                <div
                  key={p.key}
                  className={`purpose-card ${expanded === p.key ? 'active' : ''}`}
                  style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                >
                  {/* Header row */}
                  <div className="purpose-header" onClick={() => handlePurposeClick(p.key)}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      backgroundColor: expanded === p.key ? 'rgba(26,122,74,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${expanded === p.key ? 'rgba(26,122,74,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.2s',
                    }}>
                      {p.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '2px' }}>{p.label}</p>
                      <p style={{ fontSize: '12px', color: '#505050' }}>{p.desc}</p>
                    </div>
                    <svg className={`chevron ${expanded === p.key ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Mode buttons — expands on click */}
                  {expanded === p.key && (
                    <div className="mode-row">
                      {modes.map((m) => (
                        <button
                          key={m.key}
                          className={`mode-btn ${selectedMode === m.key ? 'selected' : ''}`}
                          style={{
                            backgroundColor: selectedMode === m.key ? m.activeFill : m.fill,
                            borderColor: selectedMode === m.key ? m.activeBorder : m.border,
                          }}
                          onClick={() => handleModeSelect(p.key, m.key)}
                        >
                          {/* Visual */}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            backgroundColor: 'rgba(26,122,74,0.08)',
                            border: '1px solid rgba(26,122,74,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {m.visual}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>{m.label}</p>
                            <p style={{ fontSize: '10px', color: '#505050', marginTop: '1px' }}>{m.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
