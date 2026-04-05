import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/router'
import Logo from '../../../components/Logo'
import Head from 'next/head'
import Loader from '../../../components/Loader'

interface Question {
  id: string
  label: string
  type: string
  order_index: number
}

interface Response {
  id: string
  created_at: string
  answers: Record<string, any>
}

export default function FormResponses() {
  const router = useRouter()
  const { id } = router.query
  const [form, setForm] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary')

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    const [{ data: formData }, { data: questionsData }, { data: responsesData }] = await Promise.all([
      supabase.from('forms').select('*').eq('id', id).single(),
      supabase.from('questions').select('*').eq('form_id', id).order('order_index'),
      supabase.from('responses').select('*').eq('form_id', id).order('created_at', { ascending: false }),
    ])
    if (formData) setForm(formData)
    if (questionsData) setQuestions(questionsData)
    if (responsesData) setResponses(responsesData)
    setLoading(false)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const exportCSV = () => {
    if (questions.length === 0 || responses.length === 0) return
    const headers = ['Response #', 'Date', ...questions.map(q => q.label)]
    const rows = responses.map((r, i) => [
      responses.length - i,
      new Date(r.created_at).toLocaleString(),
      ...questions.map(q => r.answers[q.id] ?? '')
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${form?.title || 'responses'}.csv`
    a.click()
  }

  const getAverageRating = (questionId: string) => {
    const vals = responses.map(r => r.answers[questionId]).filter(v => typeof v === 'number')
    if (vals.length === 0) return null
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }

  const getRatingDistribution = (questionId: string) => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    responses.forEach(r => {
      const v = r.answers[questionId]
      if (typeof v === 'number' && v >= 1 && v <= 5) dist[v]++
    })
    return dist
  }

  const getYesNoSplit = (questionId: string) => {
    const yes = responses.filter(r => r.answers[questionId] === 'Yes').length
    const no = responses.filter(r => r.answers[questionId] === 'No').length
    const total = yes + no
    return { yes, no, yesPct: total > 0 ? Math.round((yes / total) * 100) : 0, noPct: total > 0 ? Math.round((no / total) * 100) : 0 }
  }

  const getTextAnswers = (questionId: string) => {
    return responses.map(r => r.answers[questionId]).filter(v => typeof v === 'string' && v.trim().length > 0)
  }

  const getMultiChoiceSplit = (questionId: string) => {
    const counts: Record<string, number> = {}
    responses.forEach(r => {
      const v = r.answers[questionId]
      if (typeof v === 'string') counts[v] = (counts[v] || 0) + 1
    })
    return counts
  }

  const avgRatingOverall = () => {
    const ratingQs = questions.filter(q => q.type === 'rating')
    if (ratingQs.length === 0) return null
    const allRatings = ratingQs.flatMap(q =>
      responses.map(r => r.answers[q.id]).filter(v => typeof v === 'number')
    )
    if (allRatings.length === 0) return null
    return (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
  }

  if (loading) return <Loader label="Loading responses" />

  const completionRate = (() => {
    if (!form || !form.views || form.views === 0) return 0
    return Math.min(Math.round((responses.length / form.views) * 100), 100)
  })()
  const overallAvg = avgRatingOverall()

  return (
    <>
    <Head>
      <title>Responses — Formr</title>
    </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; color: white; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .back-btn {
          background: none; border: none; color: #505050; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px; border-radius: 8px; transition: all 0.2s;
        }
        .back-btn:hover { color: white; background: rgba(255,255,255,0.04); }

        .stat-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px 24px;
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }

        .analytics-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }

        .response-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
          transition: border-color 0.2s;
        }
        .response-card:hover { border-color: rgba(255,255,255,0.1); }

        .tab-btn {
          background: none; border: none;
          font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          padding: 8px 16px; border-radius: 8px;
          transition: all 0.2s;
          color: #505050;
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.06);
          color: white;
        }
        .tab-btn:hover:not(.active) { color: #A0A0A0; }

        .export-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 8px 14px;
          font-size: 12px; font-weight: 500; color: #A0A0A0;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .export-btn:hover { background: rgba(255,255,255,0.08); color: white; border-color: rgba(255,255,255,0.15); }

        .text-answer {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-left: 3px solid rgba(26,122,74,0.4);
          border-radius: 0 10px 10px 0;
          padding: 12px 16px;
          font-size: 13px; color: #A0A0A0; line-height: 1.6;
          font-style: italic;
        }

        .divider { height: 1px; background: rgba(255,255,255,0.05); }

        /* Layout classes */
        .resp-nav-inner {
          max-width: 1000px;
          margin: 0 auto;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .resp-nav-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .resp-nav-separator {
          color: rgba(255,255,255,0.15);
          font-size: 16px;
        }

        .resp-nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .resp-nav-dashboard {
          display: block;
        }

        .resp-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 32px;
        }

        .resp-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          font-weight: 400;
          color: white;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .resp-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }

        /* ========== MOBILE RESPONSIVE ========== */
        @media (max-width: 768px) {
          .resp-nav-inner {
            padding: 0 4px;
          }

          .resp-nav-separator,
          .resp-nav-share-btn {
            display: none;
          }

          .resp-nav-left {
            gap: 8px;
          }

          .resp-nav-dashboard {
            display: none;
          }

          .resp-content {
            padding: 24px 16px;
          }

          .resp-heading {
            font-size: 24px;
          }

          .resp-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 24px;
          }

          .stat-card {
            padding: 14px 16px;
          }

          .stat-card p:last-child {
            font-size: 22px !important;
          }

          .analytics-card {
            padding: 18px;
          }

          .response-card {
            padding: 16px;
          }

          .export-btn {
            padding: 6px 10px;
            font-size: 11px;
          }

          .tab-btn {
            padding: 6px 12px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .resp-content {
            padding: 20px 12px;
          }

          .resp-heading {
            font-size: 20px;
          }

          .stat-card p:last-child {
            font-size: 18px !important;
          }
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
          <div className="resp-nav-inner">
            <div className="resp-nav-left">
              <Logo onClick={() => router.push('/dashboard')} />
              <span className="resp-nav-separator">/</span>
              <button className="back-btn resp-nav-share-btn" style={{ padding: '4px 8px' }} onClick={() => router.push(`/forms/${id}/share`)}>
                ← Share page
              </button>
            </div>
            <div className="resp-nav-right">
              <button className="export-btn" onClick={exportCSV}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v7M3 5l3 3 3-3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export CSV
              </button>
              <button className="back-btn resp-nav-dashboard" onClick={() => router.push('/dashboard')}>Dashboard</button>
            </div>
          </div>
        </nav>

        <div className="resp-content">

          {/* Header */}
          <div style={{ marginBottom: '32px', opacity: 0, animation: 'fadeUp 0.4s ease 0.05s forwards' }}>
            <h1 className="resp-heading">
              {form?.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', color: '#505050' }}>
                {responses.length} {responses.length === 1 ? 'response' : 'responses'}
              </span>
              {responses.length > 0 && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                  <span style={{ fontSize: '13px', color: '#505050' }}>
                    Latest {new Date(responses[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Summary stats row */}
          <div className="resp-stats-grid">
            {[
              { label: 'Total responses', value: responses.length, delay: '0.1s' },
              { label: 'Avg rating', value: overallAvg ? `${overallAvg} / 5` : '—', delay: '0.15s', accent: !!overallAvg },
              { label: 'Completion rate', value: `${completionRate}%`, delay: '0.2s' },
              { label: 'Questions', value: questions.length, delay: '0.25s' },
            ].map((s) => (
              <div className="stat-card" key={s.label} style={{ animationDelay: s.delay }}>
                <p style={{ fontSize: '11px', color: '#505050', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{s.label}</p>
                <p style={{ fontSize: '28px', fontWeight: '600', color: s.accent ? '#1A7A4A' : 'white', lineHeight: '1' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
              <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
                Summary
              </button>
              <button className={`tab-btn ${activeTab === 'individual' ? 'active' : ''}`} onClick={() => setActiveTab('individual')}>
                Individual ({responses.length})
              </button>
            </div>
          </div>

          {/* Empty state */}
          {responses.length === 0 && (
            <div style={{ background: '#141414', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '20px', padding: '80px 32px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(26,122,74,0.08)', border: '1px solid rgba(26,122,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h8M3 15h5" stroke="#1A7A4A" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontSize: '15px', fontWeight: '500', color: 'white', marginBottom: '6px' }}>No responses yet</p>
              <p style={{ fontSize: '13px', color: '#505050', marginBottom: '20px' }}>Share your form to start collecting responses.</p>
              <button onClick={() => router.push(`/forms/${id}/share`)}
                style={{ background: '#1A7A4A', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Go to share page
              </button>
            </div>
          )}

          {/* SUMMARY TAB */}
          {activeTab === 'summary' && responses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, qi) => (
                <div className="analytics-card" key={q.id} style={{ animationDelay: `${qi * 0.06}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#505050', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Q{qi + 1}</p>
                      <p style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>{q.label}</p>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#1A7A4A', backgroundColor: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.2)', borderRadius: '6px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                      {q.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Rating */}
                  {q.type === 'rating' && (() => {
                    const avg = getAverageRating(q.id)
                    const dist = getRatingDistribution(q.id)
                    const max = Math.max(...Object.values(dist), 1)
                    return (
                      <div>
                        {avg && (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '48px', fontWeight: '600', color: '#1A7A4A', lineHeight: '1' }}>{avg}</span>
                            <span style={{ fontSize: '18px', color: '#505050' }}>/ 5</span>
                            <span style={{ fontSize: '13px', color: '#505050', marginLeft: '4px' }}>average</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[5,4,3,2,1].map(n => (
                            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '13px', color: '#505050', width: '20px', textAlign: 'right', flexShrink: 0 }}>{n}★</span>
                              <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  width: `${(dist[n] / max) * 100}%`,
                                  backgroundColor: n >= 4 ? '#1A7A4A' : n === 3 ? 'rgba(26,122,74,0.5)' : 'rgba(26,122,74,0.25)',
                                  borderRadius: '4px',
                                  transition: 'width 1s ease',
                                }} />
                              </div>
                              <span style={{ fontSize: '12px', color: '#505050', width: '20px', flexShrink: 0 }}>{dist[n]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Yes/No */}
                  {q.type === 'yes_no' && (() => {
                    const { yes, no, yesPct, noPct } = getYesNoSplit(q.id)
                    return (
                      <div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ flex: 1, background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                            <p style={{ fontSize: '32px', fontWeight: '600', color: '#1A7A4A', marginBottom: '4px' }}>{yes}</p>
                            <p style={{ fontSize: '12px', color: '#505050' }}>Yes · {yesPct}%</p>
                          </div>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                            <p style={{ fontSize: '32px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>{no}</p>
                            <p style={{ fontSize: '12px', color: '#505050' }}>No · {noPct}%</p>
                          </div>
                        </div>
                        <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                          <div style={{ width: `${yesPct}%`, backgroundColor: '#1A7A4A', transition: 'width 1s ease' }} />
                          <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Multiple choice */}
                  {q.type === 'multiple_choice' && (() => {
                    const counts = getMultiChoiceSplit(q.id)
                    const total = Object.values(counts).reduce((a, b) => a + b, 0)
                    const max = Math.max(...Object.values(counts), 1)
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([opt, count]) => (
                          <div key={opt}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', color: 'white' }}>{opt}</span>
                              <span style={{ fontSize: '12px', color: '#505050' }}>{count} · {total > 0 ? Math.round((count / total) * 100) : 0}%</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(count / max) * 100}%`, backgroundColor: '#1A7A4A', borderRadius: '3px', transition: 'width 1s ease' }} />
                            </div>
                          </div>
                        ))}
                        {Object.keys(counts).length === 0 && <p style={{ fontSize: '13px', color: '#505050' }}>No answers yet</p>}
                      </div>
                    )
                  })()}

                  {/* Text */}
                  {q.type === 'text' && (() => {
                    const texts = getTextAnswers(q.id)
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {texts.length === 0
                          ? <p style={{ fontSize: '13px', color: '#505050' }}>No text answers yet</p>
                          : texts.map((t, i) => (
                            <div key={i} className="text-answer">{t}</div>
                          ))
                        }
                      </div>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}

          {/* INDIVIDUAL TAB */}
          {activeTab === 'individual' && responses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {responses.map((response, i) => (
                <div key={response.id} className="response-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#1A7A4A' }}>{responses.length - i}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>Response {responses.length - i}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#505050' }}>{formatDate(response.created_at)}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {questions.map((q) => (
                      <div key={q.id}>
                        <p style={{ fontSize: '11px', color: '#505050', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{q.label}</p>
                        {response.answers[q.id] !== undefined ? (
                          q.type === 'rating' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {[1,2,3,4,5].map(n => (
                                  <div key={n} style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: n <= response.answers[q.id] ? 'rgba(26,122,74,0.3)' : 'rgba(255,255,255,0.04)', border: `1px solid ${n <= response.answers[q.id] ? 'rgba(26,122,74,0.5)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '500', color: n <= response.answers[q.id] ? '#1A7A4A' : '#333' }}>{n}</span>
                                  </div>
                                ))}
                              </div>
                              <span style={{ fontSize: '13px', color: '#1A7A4A', fontWeight: '500' }}>{response.answers[q.id]} / 5</span>
                            </div>
                          ) : q.type === 'yes_no' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: response.answers[q.id] === 'Yes' ? '#1A7A4A' : '#A0A0A0', backgroundColor: response.answers[q.id] === 'Yes' ? 'rgba(26,122,74,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${response.answers[q.id] === 'Yes' ? 'rgba(26,122,74,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '5px 12px' }}>
                              {response.answers[q.id]}
                            </span>
                          ) : (
                            <p style={{ fontSize: '14px', color: '#A0A0A0', lineHeight: '1.5' }}>{String(response.answers[q.id])}</p>
                          )
                        ) : (
                          <span style={{ fontSize: '13px', color: '#333', fontStyle: 'italic' }}>No answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}