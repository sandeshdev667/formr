import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

interface Form {
  id: string
  title: string
  mode: string
  created_at: string
  is_active: boolean
  response_count?: number
  last_response?: string | null
}

interface RecentResponse {
  id: string
  created_at: string
  form_id: string
  form_title: string
}

function AnimatedCount({ value, duration = 1000 }: { value: number, duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(ease * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  return <>{display}</>
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const modeColors: Record<string, { text: string, bg: string, border: string }> = {
  quick: { text: '#1A7A4A', bg: 'rgba(26,122,74,0.1)', border: 'rgba(26,122,74,0.25)' },
  form: { text: '#A0A0A0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
  flow: { text: '#ffffff', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [recentResponses, setRecentResponses] = useState<RecentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const totalResponses = forms.reduce((a, f) => a + (f.response_count || 0), 0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      loadData()
    }
    getUser()
  }, [])

  useEffect(() => {
    if (forms.length > 0) {
      forms.forEach((_, i) => {
        setTimeout(() => setVisibleCards(prev => new Set([...prev, i])), i * 80)
      })
    }
  }, [forms])

  const loadData = async () => {
    const { data: formsData } = await supabase
      .from('forms').select('*').order('created_at', { ascending: false })
    if (!formsData) { setLoading(false); return }

    const formsWithDetails = await Promise.all(
      formsData.map(async (form) => {
        const [{ count }, { data: lastResp }] = await Promise.all([
          supabase.from('responses').select('*', { count: 'exact', head: true }).eq('form_id', form.id),
          supabase.from('responses').select('created_at').eq('form_id', form.id).order('created_at', { ascending: false }).limit(1),
        ])
        return { ...form, response_count: count || 0, last_response: lastResp?.[0]?.created_at || null }
      })
    )
    setForms(formsWithDetails)

    const { data: allResponses } = await supabase
      .from('responses').select('id, created_at, form_id').order('created_at', { ascending: false }).limit(8)

    if (allResponses) {
      setRecentResponses(allResponses.map(r => ({
        ...r,
        form_title: formsData.find(f => f.id === r.form_id)?.title || 'Untitled form',
      })))
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleActive = async (form: Form) => {
    setTogglingId(form.id)
    await supabase.from('forms').update({ is_active: !form.is_active }).eq('id', form.id)
    setForms(forms.map(f => f.id === form.id ? { ...f, is_active: !f.is_active } : f))
    setTimeout(() => setTogglingId(null), 400)
  }

  const deleteForm = async (formId: string) => {
    if (!window.confirm('Delete this form? This cannot be undone.')) return
    setDeletingId(formId)
    await supabase.from('forms').delete().eq('id', formId)
    setForms(forms.filter(f => f.id !== formId))
    setDeletingId(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#1A7A4A', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '13px', color: '#505050' }}>Loading...</p>
      </div>
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
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .form-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.2s;
        }
        .form-card.visible {
          animation: fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .form-card.inactive { opacity: 0.35; filter: grayscale(0.5); }
        .form-card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: rgba(26,122,74,0.25);
          box-shadow: 0 0 0 1px rgba(26,122,74,0.1), 0 12px 40px rgba(26,122,74,0.1);
        }

        .stat-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }

        .pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: none;
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pill-btn:hover { transform: translateY(-1px) scale(1.04); }

        .toggle-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: none;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .activity-item {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          opacity: 0;
          animation: slideIn 0.4s ease forwards;
          cursor: pointer;
          transition: background 0.15s;
          border-radius: 8px;
          margin: 0 -8px;
          padding: 10px 8px;
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-item:hover { background: rgba(255,255,255,0.03); }

        .create-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1A7A4A;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 0 0 0 rgba(26,122,74,0);
        }
        .create-btn:hover {
          background: #155C38;
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(26,122,74,0.35);
        }

        .signout-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 13px;
          color: #505050;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .signout-btn:hover { border-color: rgba(255,255,255,0.15); color: white; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
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
          <div style={{ maxWidth: '1280px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '17px', fontWeight: '600', color: 'white', letterSpacing: '-0.3px' }}>Formr</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: '#505050' }}>{user?.email}</span>
              <button className="signout-btn" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: '32px', opacity: 0, animation: 'fadeUp 0.5s ease 0.05s forwards' }}>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', fontWeight: '400', color: 'white', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              {getGreeting()}, {firstName} 👋
            </h1>
            <p style={{ fontSize: '14px', color: '#505050' }}>
              {forms.length === 0
                ? "Let's create your first form."
                : `${forms.filter(f => f.is_active).length} active ${forms.filter(f => f.is_active).length === 1 ? 'form' : 'forms'} collecting responses.`}
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '36px' }}>
            {[
              { label: 'Total forms', value: forms.length, delay: '0.1s' },
              { label: 'Total responses', value: totalResponses, delay: '0.15s', accent: true },
              { label: 'Active forms', value: forms.filter(f => f.is_active).length, delay: '0.2s' },
              { label: 'Avg per form', value: forms.length > 0 ? Math.round(totalResponses / forms.length) : 0, delay: '0.25s' },
            ].map((stat) => (
              <div className="stat-card" key={stat.label} style={{ animationDelay: stat.delay }}>
                <p style={{ fontSize: '11px', color: '#505050', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
                <p style={{ fontSize: '32px', fontWeight: '600', color: stat.accent ? '#1A7A4A' : 'white', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                  <AnimatedCount value={stat.value} />
                </p>
              </div>
            ))}
          </div>

          {/* Main layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

            {/* Left — Forms */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', opacity: 0, animation: 'fadeUp 0.4s ease 0.2s forwards' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '500', color: '#A0A0A0' }}>
                  Your forms
                  <span style={{ marginLeft: '8px', color: '#505050' }}>{forms.length}</span>
                </h2>
                <button className="create-btn" onClick={() => router.push('/forms/new')}>
                  + Create form
                </button>
              </div>

              {forms.length === 0 && (
                <div style={{ background: '#141414', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '20px', padding: '64px 32px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="3" width="14" height="14" rx="2" stroke="#1A7A4A" strokeWidth="1.5"/>
                      <path d="M10 7v6M7 10h6" stroke="#1A7A4A" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: 'white', marginBottom: '6px' }}>No forms yet</p>
                  <p style={{ fontSize: '13px', color: '#505050', marginBottom: '24px' }}>Create your first form and start collecting responses.</p>
                  <button className="create-btn" onClick={() => router.push('/forms/new')}>+ Create your first form</button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {forms.map((form, i) => {
                  const mc = modeColors[form.mode] || modeColors.form
                  return (
                    <div
                      key={form.id}
                      className={`form-card ${visibleCards.has(i) ? 'visible' : ''} ${!form.is_active ? 'inactive' : ''}`}
                      style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                    >
                      {/* Card header */}
                      <div style={{
                        padding: '18px 18px 14px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: `linear-gradient(135deg, ${mc.bg} 0%, transparent 100%)`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h3
                            style={{ fontSize: '14px', fontWeight: '500', color: 'white', lineHeight: '1.3', flex: 1, marginRight: '10px', cursor: 'pointer' }}
                            onClick={() => router.push(`/forms/${form.id}/share`)}
                          >
                            {form.title}
                          </h3>
                          <span style={{
                            fontSize: '10px', fontWeight: '600',
                            color: mc.text, backgroundColor: mc.bg,
                            border: `1px solid ${mc.border}`,
                            borderRadius: '6px', padding: '2px 8px',
                            textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                          }}>
                            {form.mode}
                          </span>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '20px', fontWeight: '600', color: 'white', lineHeight: '1' }}>
                              <AnimatedCount value={form.response_count || 0} duration={1000} />
                            </span>
                            <span style={{ fontSize: '11px', color: '#505050' }}>responses</span>
                          </div>
                          {form.last_response && (
                            <>
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.1)' }}>·</span>
                              <span style={{ fontSize: '11px', color: '#505050' }}>Last {timeAgo(form.last_response)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '14px 18px' }}>

                        {/* Completion rate */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '11px', color: '#505050' }}>Completion rate</span>
                            <span style={{ fontSize: '11px', fontWeight: '500', color: '#1A7A4A' }}>{form.response_count! > 0 ? '85' : '0'}%</span>
                          </div>
                          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '3px', height: '3px' }}>
                            <div style={{ width: form.response_count! > 0 ? '85%' : '0%', height: '100%', backgroundColor: '#1A7A4A', borderRadius: '3px', transition: 'width 1.2s ease' }} />
                          </div>
                        </div>

                        {/* Toggle */}
                        <div style={{ marginBottom: '14px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="toggle-pill"
                            onClick={() => toggleActive(form)}
                            style={{
                              backgroundColor: form.is_active ? 'rgba(26,122,74,0.1)' : 'rgba(255,255,255,0.04)',
                              color: form.is_active ? '#1A7A4A' : '#505050',
                              border: `1px solid ${form.is_active ? 'rgba(26,122,74,0.25)' : 'rgba(255,255,255,0.08)'}`,
                            }}
                          >
                            <div style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              backgroundColor: form.is_active ? '#1A7A4A' : '#505050',
                              boxShadow: form.is_active ? '0 0 6px rgba(26,122,74,0.8)' : 'none',
                              transition: 'all 0.3s ease',
                            }} />
                            {form.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                          <button className="pill-btn" onClick={() => router.push(`/forms/${form.id}/edit`)}
                            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9l2-2 5-5-2-2-5 5-2 2h2z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Edit
                          </button>
                          <button className="pill-btn" onClick={() => router.push(`/forms/${form.id}/share`)}
                            style={{ backgroundColor: 'rgba(26,122,74,0.15)', color: '#1A7A4A', border: '1px solid rgba(26,122,74,0.25)' }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="8" cy="2" r="1.2" stroke="#1A7A4A" strokeWidth="1.2"/><circle cx="2" cy="5" r="1.2" stroke="#1A7A4A" strokeWidth="1.2"/><circle cx="8" cy="8" r="1.2" stroke="#1A7A4A" strokeWidth="1.2"/><path d="M3.2 5.6L6.8 7.4M6.8 2.6L3.2 4.4" stroke="#1A7A4A" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            Share
                          </button>
                          <button className="pill-btn" onClick={() => router.push(`/forms/${form.id}/responses`)}
                            style={{ backgroundColor: 'transparent', color: '#505050', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 2h8M1 5h5M1 8h3" stroke="#505050" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            Responses
                          </button>
                          <button className="pill-btn" onClick={() => deleteForm(form.id)} disabled={deletingId === form.id}
                            style={{ backgroundColor: 'transparent', color: '#3a1a1a', border: '1px solid rgba(220,38,38,0.15)', marginLeft: 'auto' }}>
                            {deletingId === form.id ? '...' : '✕'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right — Activity panel */}
            <div style={{ position: 'sticky', top: '80px', opacity: 0, animation: 'slideIn 0.5s ease 0.3s forwards' }}>
              <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A7A4A', boxShadow: '0 0 8px rgba(26,122,74,0.8)', animation: 'pulse 2s ease-in-out infinite' }} />
                  <h3 style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>Recent activity</h3>
                </div>
                <div style={{ padding: '8px 12px 16px' }}>
                  {recentResponses.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: '#505050' }}>No responses yet.</p>
                      <p style={{ fontSize: '11px', color: '#333', marginTop: '4px' }}>Share a form to get started.</p>
                    </div>
                  ) : (
                    recentResponses.map((r, i) => (
                      <div key={r.id} className="activity-item" style={{ animationDelay: `${0.35 + i * 0.04}s` }}
                        onClick={() => router.push(`/forms/${r.form_id}/responses`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(26,122,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M2 6h5M2 9h3" stroke="#1A7A4A" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '12px', fontWeight: '500', color: 'white', marginBottom: '1px' }}>New response</p>
                            <p style={{ fontSize: '11px', color: '#505050', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.form_title}</p>
                          </div>
                          <span style={{ fontSize: '10px', color: '#333', flexShrink: 0 }}>{timeAgo(r.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}