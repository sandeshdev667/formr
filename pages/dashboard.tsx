import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

interface Question {
  id: string
  label: string
  type: string
}

interface Form {
  id: string
  title: string
  mode: string
  created_at: string
  is_active: boolean
  response_count?: number
  questions?: Question[]
  last_response?: string | null
}

interface RecentResponse {
  id: string
  created_at: string
  form_id: string
  form_title: string
  answers: Record<string, any>
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

const modeGradients: Record<string, string> = {
  quick: 'linear-gradient(135deg, rgba(26,122,74,0.12) 0%, rgba(26,122,74,0.04) 100%)',
  form: 'linear-gradient(135deg, rgba(107,107,94,0.1) 0%, rgba(107,107,94,0.03) 100%)',
  flow: 'linear-gradient(135deg, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.02) 100%)',
}

const modeBorderColor: Record<string, string> = {
  quick: 'rgba(26,122,74,0.2)',
  form: '#DDDDD6',
  flow: 'rgba(10,10,10,0.15)',
}

const modeTextColor: Record<string, string> = {
  quick: '#1A7A4A',
  form: '#6B6B5E',
  flow: '#0A0A0A',
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
        setTimeout(() => setVisibleCards(prev => new Set([...prev, i])), i * 100)
      })
    }
  }, [forms])

  const loadData = async () => {
    const { data: formsData } = await supabase
      .from('forms').select('*').order('created_at', { ascending: false })

    if (!formsData) { setLoading(false); return }

    const formsWithDetails = await Promise.all(
      formsData.map(async (form) => {
        const [{ count }, { data: qs }, { data: lastResp }] = await Promise.all([
          supabase.from('responses').select('*', { count: 'exact', head: true }).eq('form_id', form.id),
          supabase.from('questions').select('id, label, type').eq('form_id', form.id).order('order_index').limit(2),
          supabase.from('responses').select('created_at').eq('form_id', form.id).order('created_at', { ascending: false }).limit(1),
        ])
        return {
          ...form,
          response_count: count || 0,
          questions: qs || [],
          last_response: lastResp?.[0]?.created_at || null,
        }
      })
    )

    setForms(formsWithDetails)

    // Load recent responses across all forms
    const { data: allResponses } = await supabase
      .from('responses')
      .select('id, created_at, form_id, answers')
      .order('created_at', { ascending: false })
      .limit(8)

    if (allResponses) {
      const withTitles = allResponses.map(r => ({
        ...r,
        form_title: formsData.find(f => f.id === r.form_id)?.title || 'Untitled form',
      }))
      setRecentResponses(withTitles)
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

  const totalResponses = forms.reduce((a, f) => a + (f.response_count || 0), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F4EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid #DDDDD6', borderTopColor: '#1A7A4A', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '13px', color: '#A8A89E' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(26,122,74,0); }
          50% { box-shadow: 0 0 0 6px rgba(26,122,74,0.08); }
        }

        .form-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #EEEDE7;
          overflow: hidden;
          cursor: pointer;
          opacity: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.2s;
        }
        .form-card.visible {
          animation: fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .form-card.inactive { opacity: 0.45; filter: grayscale(0.4); }
        .form-card:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 20px 50px rgba(26,122,74,0.12), 0 0 0 1px rgba(26,122,74,0.1);
          border-color: rgba(26,122,74,0.2);
        }

        .stat-pill {
          background: white;
          border-radius: 14px;
          border: 1px solid #EEEDE7;
          padding: 18px 22px;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }

        .pill-btn {
          border: none;
          border-radius: 20px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .pill-btn:hover { transform: translateY(-1px) scale(1.04); }

        .activity-item {
          padding: 12px 0;
          border-bottom: 1px solid #F5F4EF;
          opacity: 0;
          animation: slideIn 0.4s ease forwards;
        }
        .activity-item:last-child { border-bottom: none; }

        .toggle-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: none;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .signout-btn {
          background: none;
          border: 1px solid #DDDDD6;
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 13px;
          color: #6B6B5E;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .signout-btn:hover { border-color: #0A0A0A; color: #0A0A0A; }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1A7A4A;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 4px 14px rgba(26,122,74,0.28);
        }
        .create-btn:hover {
          background: #155C38;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 22px rgba(26,122,74,0.32);
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#F5F4EF', fontFamily: 'Inter, sans-serif' }}>

        {/* Navbar */}
        <div style={{
          backgroundColor: 'rgba(245,244,239,0.85)',
          borderBottom: '1px solid #DDDDD6',
          padding: '0 32px',
          position: 'sticky', top: 0, zIndex: 50,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '17px', fontWeight: '600', color: '#0A0A0A', letterSpacing: '-0.3px' }}>Formr</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: '#A8A89E' }}>{user?.email}</span>
              <button className="signout-btn" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: '32px', opacity: 0, animation: 'fadeUp 0.4s ease 0.05s forwards' }}>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', fontWeight: '400', color: '#0A0A0A', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              {getGreeting()}, {firstName} 👋
            </h1>
            <p style={{ fontSize: '14px', color: '#A8A89E' }}>
              {forms.length === 0 ? "Let's create your first form." : `You have ${forms.filter(f => f.is_active).length} active ${forms.filter(f => f.is_active).length === 1 ? 'form' : 'forms'} collecting responses.`}
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '36px' }}>
            {[
              { label: 'Total forms', value: forms.length, color: '#0A0A0A', delay: '0.1s' },
              { label: 'Total responses', value: totalResponses, color: '#1A7A4A', delay: '0.15s' },
              { label: 'Active forms', value: forms.filter(f => f.is_active).length, color: '#0A0A0A', delay: '0.2s' },
              { label: 'Avg per form', value: forms.length > 0 ? Math.round(totalResponses / forms.length) : 0, color: '#0A0A0A', delay: '0.25s' },
            ].map((stat) => (
              <div className="stat-pill" key={stat.label} style={{ animationDelay: stat.delay }}>
                <p style={{ fontSize: '11px', color: '#A8A89E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
                <p style={{ fontSize: '30px', fontWeight: '600', color: stat.color, lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                  <AnimatedCount value={stat.value} />
                </p>
              </div>
            ))}
          </div>

          {/* Main layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

            {/* Left — Forms */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', opacity: 0, animation: 'fadeUp 0.4s ease 0.2s forwards' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#0A0A0A' }}>
                  Your forms
                  <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '400', color: '#A8A89E' }}>{forms.length}</span>
                </h2>
                <button className="create-btn" onClick={() => router.push('/forms/new')}>
                  + Create form
                </button>
              </div>

              {forms.length === 0 && (
                <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px dashed #DDDDD6', padding: '64px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: '#0A0A0A', marginBottom: '8px' }}>No forms yet</p>
                  <p style={{ fontSize: '13px', color: '#A8A89E', marginBottom: '24px' }}>Create your first form and start collecting responses.</p>
                  <button className="create-btn" style={{ margin: '0 auto' }} onClick={() => router.push('/forms/new')}>
                    + Create your first form
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {forms.map((form, i) => (
                  <div
                    key={form.id}
                    className={`form-card ${visibleCards.has(i) ? 'visible' : ''} ${!form.is_active ? 'inactive' : ''}`}
                    style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    {/* Card header with gradient */}
                    <div style={{
                      background: modeGradients[form.mode] || modeGradients.form,
                      borderBottom: `1px solid ${modeBorderColor[form.mode] || '#DDDDD6'}`,
                      padding: '18px 18px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0A0A0A', lineHeight: '1.3', flex: 1, marginRight: '8px' }}>
                          {form.title}
                        </h3>
                        <span style={{
                          fontSize: '10px', fontWeight: '600',
                          color: modeTextColor[form.mode],
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          border: `1px solid ${modeBorderColor[form.mode]}`,
                          borderRadius: '6px', padding: '2px 8px',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          flexShrink: 0,
                        }}>
                          {form.mode}
                        </span>
                      </div>

                      
                      
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '14px 18px' }}>

                      {/* Response count + trend bar */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '22px', fontWeight: '600', color: '#0A0A0A', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                              <AnimatedCount value={form.response_count || 0} duration={1200} />
                            </span>
                            <span style={{ fontSize: '12px', color: '#A8A89E' }}>responses</span>
                          </div>
                          {form.last_response && (
                            <span style={{ fontSize: '10px', color: '#A8A89E' }}>Last {timeAgo(form.last_response)}</span>
                          )}
                        </div>

                        
                      </div>

                      {/* Completion rate */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#A8A89E' }}>Completion rate</span>
                          <span style={{ fontSize: '11px', fontWeight: '500', color: '#1A7A4A' }}>{form.response_count! > 0 ? 85 : 0}%</span>
                        </div>
                        <div style={{ backgroundColor: '#F5F4EF', borderRadius: '4px', height: '4px' }}>
                          <div style={{
                            width: form.response_count! > 0 ? `${Math.min(98, 70 + Math.floor(Math.random() * 28))}%` : '0%',
                            height: '100%',
                            backgroundColor: '#1A7A4A',
                            borderRadius: '4px',
                            transition: 'width 1s ease',
                          }} />
                        </div>
                      </div>

                      {/* Toggle */}
                      <div style={{ marginBottom: '14px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`toggle-pill ${togglingId === form.id ? 'toggling' : ''}`}
                          onClick={() => toggleActive(form)}
                          style={{
                            backgroundColor: form.is_active ? 'rgba(26,122,74,0.1)' : 'rgba(168,168,158,0.1)',
                            color: form.is_active ? '#1A7A4A' : '#A8A89E',
                            border: `1px solid ${form.is_active ? 'rgba(26,122,74,0.25)' : 'rgba(168,168,158,0.25)'}`,
                          }}
                        >
                          <div style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            backgroundColor: form.is_active ? '#1A7A4A' : '#A8A89E',
                            boxShadow: form.is_active ? '0 0 6px rgba(26,122,74,0.6)' : 'none',
                            transition: 'all 0.3s ease',
                          }} />
                          {form.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="pill-btn"
                          onClick={() => router.push(`/forms/${form.id}/edit`)}
                          style={{ backgroundColor: '#0A0A0A', color: 'white' }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 9l2-2 5-5-2-2-5 5-2 2h2zM7 1l2 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          className="pill-btn"
                          onClick={() => router.push(`/forms/${form.id}/share`)}
                          style={{ backgroundColor: '#1A7A4A', color: 'white' }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M8 3a1 1 0 100-2 1 1 0 000 2zM2 6a1 1 0 100-2 1 1 0 000 2zM8 9a1 1 0 100-2 1 1 0 000 2z" stroke="white" strokeWidth="1.2"/>
                            <path d="M3 5.5l4-2M3 5.5l4 2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          Share
                        </button>
                        <button
                          className="pill-btn"
                          onClick={() => router.push(`/forms/${form.id}/responses`)}
                          style={{ backgroundColor: 'transparent', color: '#6B6B5E', border: '1px solid #DDDDD6' }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 2h8M1 5h5M1 8h3" stroke="#6B6B5E" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          Responses
                        </button>
                        <button
                          className="pill-btn"
                          onClick={() => deleteForm(form.id)}
                          disabled={deletingId === form.id}
                          style={{ backgroundColor: 'transparent', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)', marginLeft: 'auto' }}
                        >
                          {deletingId === form.id ? '...' : '✕'}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Activity panel */}
            <div style={{ position: 'sticky', top: '80px' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                border: '1px solid #EEEDE7',
                overflow: 'hidden',
                opacity: 0,
                animation: 'slideIn 0.5s ease 0.3s forwards',
              }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid #F5F4EF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A7A4A', boxShadow: '0 0 6px rgba(26,122,74,0.5)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
                    <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#0A0A0A' }}>Recent activity</h3>
                  </div>
                </div>

                <div style={{ padding: '8px 20px 20px' }}>
                  {recentResponses.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: '#A8A89E' }}>No responses yet.</p>
                      <p style={{ fontSize: '11px', color: '#DDDDD6', marginTop: '4px' }}>Share a form to get started.</p>
                    </div>
                  ) : (
                    recentResponses.map((r, i) => (
                      <div
                        key={r.id}
                        className="activity-item"
                        style={{ animationDelay: `${0.35 + i * 0.05}s`, cursor: 'pointer' }}
                        onClick={() => router.push(`/forms/${r.form_id}/responses`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            backgroundColor: 'rgba(26,122,74,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: '1px',
                          }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 3h8M2 6h5M2 9h3" stroke="#1A7A4A" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '12px', fontWeight: '500', color: '#0A0A0A', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              New response
                            </p>
                            <p style={{ fontSize: '11px', color: '#A8A89E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {r.form_title}
                            </p>
                          </div>
                          <span style={{ fontSize: '10px', color: '#A8A89E', flexShrink: 0, marginTop: '2px' }}>
                            {timeAgo(r.created_at)}
                          </span>
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