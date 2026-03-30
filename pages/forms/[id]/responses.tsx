import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/router'

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
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

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

        .back-btn {
          background: none; border: none;
          color: #505050; font-size: 13px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px; border-radius: 8px;
          transition: all 0.2s;
        }
        .back-btn:hover { color: white; background: rgba(255,255,255,0.04); }

        .answer-value {
          font-size: 14px;
          font-weight: 500;
          color: white;
          padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          display: inline-block;
        }
        .answer-value.rating {
          background: rgba(26,122,74,0.1);
          border-color: rgba(26,122,74,0.2);
          color: #1A7A4A;
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
          <div style={{ maxWidth: '900px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button className="back-btn" onClick={() => router.push(`/forms/${id}/share`)}>
              ← Share page
            </button>
            <button className="back-btn" onClick={() => router.push('/dashboard')}>
              Dashboard
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px', opacity: 0, animation: 'fadeUp 0.4s ease 0.05s forwards' }}>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', fontWeight: '400', color: 'white', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              {form?.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <button
                onClick={() => router.push(`/forms/${id}/share`)}
                style={{ background: '#1A7A4A', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Go to share page
              </button>
            </div>
          )}

          {/* Responses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {responses.map((response, i) => (
              <div key={response.id} className="response-card" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>

                {/* Response header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#1A7A4A' }}>{responses.length - i}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>Response {responses.length - i}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#505050' }}>{formatDate(response.created_at)}</span>
                </div>

                {/* Answers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {questions.map((q) => (
                    <div key={q.id}>
                      <p style={{ fontSize: '11px', color: '#505050', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {q.label}
                      </p>
                      {response.answers[q.id] !== undefined ? (
                        <span className={`answer-value ${q.type === 'rating' ? 'rating' : ''}`}>
                          {q.type === 'rating' ? `★ ${response.answers[q.id]} / 5` : String(response.answers[q.id])}
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#333', fontStyle: 'italic' }}>No answer</span>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}