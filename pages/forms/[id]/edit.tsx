import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/router'

type QuestionType = 'text' | 'rating' | 'yes_no' | 'multiple_choice'

interface Question {
  id?: string
  form_id?: string
  order_index: number
  type: QuestionType
  label: string
  options?: string[]
}

export default function EditForm() {
  const router = useRouter()
  const { id } = router.query
  const [title, setTitle] = useState('Untitled form')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  const loadForm = async () => {
    const { data: form } = await supabase.from('forms').select('*').eq('id', id).single()
    if (form) setTitle(form.title)
    const { data: qs } = await supabase.from('questions').select('*').eq('form_id', id).order('order_index')
    if (qs) setQuestions(qs)
    setLoading(false)
  }

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      order_index: questions.length,
      type,
      label: '',
      options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] : undefined
    }
    setQuestions([...questions, newQ])
    setActiveQuestion(questions.length)
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
    setActiveQuestion(null)
  }

  const saveForm = async () => {
    setSaving(true)
    await supabase.from('forms').update({ title }).eq('id', id)
    await supabase.from('questions').delete().eq('form_id', id)
    if (questions.length > 0) {
      await supabase.from('questions').insert(
        questions.map((q, i) => ({
          form_id: id,
          order_index: i,
          type: q.type,
          label: q.label,
          options: q.options || null
        }))
      )
    }
    setSaving(false)
    router.push(`/forms/${id}/share`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
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
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .title-input {
          background: none;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: white;
          outline: none;
          width: 100%;
          padding-bottom: 12px;
          margin-bottom: 32px;
          transition: border-color 0.2s;
        }
        .title-input:focus { border-bottom-color: rgba(26,122,74,0.5); }
        .title-input::placeholder { color: #333; }

        .question-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 18px;
          transition: all 0.2s ease;
          animation: slideIn 0.3s ease forwards;
          opacity: 0;
        }
        .question-card.active {
          border-color: rgba(26,122,74,0.3);
          box-shadow: 0 0 0 1px rgba(26,122,74,0.1);
        }
        .question-card:hover { border-color: rgba(255,255,255,0.1); }

        .question-input {
          background: none;
          border: none;
          font-size: 14px;
          color: white;
          outline: none;
          width: 100%;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .question-input::placeholder { color: #333; }

        .option-input {
          background: none;
          border: none;
          font-size: 13px;
          color: #A0A0A0;
          outline: none;
          flex: 1;
          font-family: 'Inter', sans-serif;
        }
        .option-input:focus { color: white; }

        .add-question-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 500;
          color: #505050;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .add-question-btn:hover {
          background: rgba(26,122,74,0.1);
          border-color: rgba(26,122,74,0.25);
          color: #1A7A4A;
          transform: translateY(-1px);
        }

        .save-btn {
          background: #1A7A4A;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 0 0 0 rgba(26,122,74,0);
        }
        .save-btn:hover {
          background: #155C38;
          transform: translateY(-1px);
          box-shadow: 0 0 16px rgba(26,122,74,0.35);
        }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .back-btn {
          background: none;
          border: none;
          color: #505050;
          font-size: 13px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .back-btn:hover { color: white; background: rgba(255,255,255,0.04); }

        .remove-btn {
          background: none;
          border: none;
          color: #333;
          font-size: 12px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .remove-btn:hover { color: #dc2626; background: rgba(220,38,38,0.08); }

        .type-badge {
          font-size: 10px;
          font-weight: 600;
          color: #505050;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          padding: 2px 8px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
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
            <button className="back-btn" onClick={() => router.push('/dashboard')}>
              ← Dashboard
            </button>
            <button className="save-btn" onClick={saveForm} disabled={saving}>
              {saving ? 'Saving...' : 'Save & continue →'}
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: '32px', alignItems: 'start' }}>

          {/* Main editor */}
          <div style={{ opacity: 0, animation: 'fadeUp 0.5s ease 0.1s forwards' }}>

            <input
              className="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Form title"
            />

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {questions.map((q, i) => (
                <div
                  key={i}
                  className={`question-card ${activeQuestion === i ? 'active' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => setActiveQuestion(i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#333', fontWeight: '500' }}>{i + 1}</span>
                      <span className="type-badge">{q.type.replace('_', ' ')}</span>
                    </div>
                    <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeQuestion(i) }}>Remove</button>
                  </div>

                  <input
                    className="question-input"
                    value={q.label}
                    onChange={(e) => updateQuestion(i, { label: e.target.value })}
                    placeholder="Type your question here..."
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Question type previews */}
                  {q.type === 'rating' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#505050' }}>{n}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'yes_no' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      {['Yes', 'No'].map(opt => (
                        <div key={opt} style={{ padding: '7px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '13px', color: '#505050' }}>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'multiple_choice' && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {q.options?.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                          <input
                            className="option-input"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(q.options || [])]
                              newOpts[oi] = e.target.value
                              updateQuestion(i, { options: newOpts })
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {(q.options?.length || 0) > 2 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); updateQuestion(i, { options: q.options?.filter((_, idx) => idx !== oi) }) }}
                              style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: '12px', transition: 'color 0.2s' }}
                            >✕</button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); updateQuestion(i, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }) }}
                        style={{ background: 'none', border: 'none', color: '#505050', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: '4px 0', textAlign: 'left', transition: 'color 0.2s' }}
                      >
                        + Add option
                      </button>
                    </div>
                  )}

                  {q.type === 'text' && (
                    <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ fontSize: '12px', color: '#333' }}>Short text answer...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add question */}
            <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px' }}>
              <p style={{ fontSize: '11px', color: '#505050', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Add question</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {([
                  { type: 'text', label: '+ Text', icon: '≡' },
                  { type: 'rating', label: '+ Rating', icon: '★' },
                  { type: 'yes_no', label: '+ Yes / No', icon: '◎' },
                  { type: 'multiple_choice', label: '+ Multiple choice', icon: '⊕' },
                ] as { type: QuestionType, label: string, icon: string }[]).map(({ type, label, icon }) => (
                  <button key={type} className="add-question-btn" onClick={() => addQuestion(type)}>
                    <span style={{ fontSize: '14px' }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right sidebar — tips */}
          <div style={{ position: 'sticky', top: '80px', opacity: 0, animation: 'fadeUp 0.5s ease 0.2s forwards' }}>
            <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Tips</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { tip: 'Keep it short', desc: '3–5 questions get the best completion rates.' },
                  { tip: 'Start simple', desc: 'Lead with an easy question to build momentum.' },
                  { tip: 'End with text', desc: 'A freeform question at the end captures nuance.' },
                ].map((t) => (
                  <div key={t.tip}>
                    <p style={{ fontSize: '12px', fontWeight: '500', color: 'white', marginBottom: '2px' }}>{t.tip}</p>
                    <p style={{ fontSize: '11px', color: '#505050', lineHeight: '1.5' }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
              <p style={{ fontSize: '11px', color: '#505050', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Form info</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#505050' }}>Questions</span>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'white' }}>{questions.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#505050' }}>Est. completion</span>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'white' }}>{questions.length * 15}s</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}