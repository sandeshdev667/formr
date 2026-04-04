import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/router'
import Logo from '../../../components/Logo'
import Head from 'next/head'

type QuestionType = 'text' | 'rating' | 'yes_no' | 'multiple_choice'

interface Question {
  id?: string
  form_id?: string
  order_index: number
  type: QuestionType
  label: string
  options?: string[]
}

const modeConfig: Record<string, {
  label: string
  color: string
  bg: string
  border: string
  description: string
  tips: { title: string, desc: string }[]
  allowedTypes: QuestionType[]
  typeWarnings: Record<string, string>
}> = {
  quick: {
    label: 'Quick',
    color: '#1A7A4A',
    bg: 'rgba(26,122,74,0.08)',
    border: 'rgba(26,122,74,0.2)',
    description: 'Minimal tap-and-done experience. Respondents see large buttons, best for in-person use.',
    tips: [
      { title: 'Keep it under 3', desc: 'More than 3 questions kills completion rate in Quick mode.' },
      { title: 'Avoid long text', desc: 'Typing is friction. Use rating or yes/no instead.' },
      { title: 'Think physical', desc: 'This will be scanned at a counter or table. Make it instant.' },
    ],
    allowedTypes: ['rating', 'yes_no'],
    typeWarnings: {
      text: 'Text questions reduce completion in Quick mode',
      multiple_choice: 'Multiple choice works better in Form or Flow mode',
    },
  },
  form: {
    label: 'Form',
    color: '#A0A0A0',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.1)',
    description: 'All questions visible at once. Familiar layout, great for surveys and registrations.',
    tips: [
      { title: '5–7 questions', desc: 'The sweet spot for completion rate in standard form mode.' },
      { title: 'Mix types', desc: 'Combine rating, yes/no, and text for richer responses.' },
      { title: 'End with text', desc: 'A freeform question at the end captures nuance other types miss.' },
    ],
    allowedTypes: ['text', 'rating', 'yes_no', 'multiple_choice'],
    typeWarnings: {},
  },
  flow: {
    label: 'Flow',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
    description: 'One question at a time, full screen. Highest completion rates. Order matters most.',
    tips: [
      { title: 'Order is everything', desc: 'Start easy — rating or yes/no first to build momentum.' },
      { title: 'Each question stands alone', desc: 'No context from previous questions. Make each self-explanatory.' },
      { title: 'End strong', desc: 'Save the open-ended text question for last when trust is built.' },
    ],
    allowedTypes: ['text', 'rating', 'yes_no', 'multiple_choice'],
    typeWarnings: {},
  },
}

export default function EditForm() {
  const router = useRouter()
  const { id } = router.query
  const [title, setTitle] = useState('Untitled form')
  const [editingTitle, setEditingTitle] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  const [mode, setMode] = useState<string>('form')

  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  const loadForm = async () => {
    const { data: form } = await supabase.from('forms').select('*').eq('id', id).single()
    if (form) { setTitle(form.title); setMode(form.mode) }
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
          form_id: id, order_index: i,
          type: q.type, label: q.label,
          options: q.options || null
        }))
      )
    }
    setSaving(false)
    router.push(`/forms/${id}/share`)
  }

  const config = modeConfig[mode] || modeConfig.form

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#1A7A4A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <>
    <Head>
        <title>Edit form — Formr</title>
    </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; color: white; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }

        .question-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s ease;
          animation: slideIn 0.3s ease forwards;
          opacity: 0;
          cursor: pointer;
        }
        .question-card:hover { border-color: rgba(255,255,255,0.12); }
        .question-card.active {
          border-color: ${config.border};
          box-shadow: 0 0 0 1px ${config.bg};
        }

        .question-label-display {
          font-size: 15px;
          font-weight: 500;
          color: white;
          cursor: text;
          padding: 4px 0;
          border-bottom: 1px dashed transparent;
          transition: border-color 0.2s;
          min-height: 28px;
        }
        .question-label-display:hover {
          border-bottom-color: rgba(255,255,255,0.2);
        }
        .question-label-display.empty {
          color: #333;
        }

        .question-input {
          background: none;
          border: none;
          border-bottom: 1px solid rgba(26,122,74,0.4);
          font-size: 15px;
          font-weight: 500;
          color: white;
          outline: none;
          width: 100%;
          font-family: 'Inter', sans-serif;
          padding: 4px 0;
          transition: border-color 0.2s;
        }
        .question-input::placeholder { color: #333; }
        .question-input:focus { border-bottom-color: #1A7A4A; }

        .title-display {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: white;
          cursor: text;
          padding-bottom: 8px;
          border-bottom: 1px dashed transparent;
          transition: border-color 0.2s;
          margin-bottom: 24px;
        }
        .title-display:hover { border-bottom-color: rgba(255,255,255,0.2); }

        .title-input {
          background: none;
          border: none;
          border-bottom: 1px solid rgba(26,122,74,0.5);
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: white;
          outline: none;
          width: 100%;
          padding-bottom: 8px;
          margin-bottom: 24px;
          font-weight: 400;
        }
        .title-input::placeholder { color: #333; }

        .add-question-btn {
          background: rgba(255,255,255,0.03);
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
          position: relative;
        }
        .add-question-btn:hover {
          background: rgba(26,122,74,0.1);
          border-color: rgba(26,122,74,0.25);
          color: #1A7A4A;
          transform: translateY(-1px);
        }
        .add-question-btn.warned {
          border-color: rgba(234,179,8,0.3);
          color: #ca8a04;
        }
        .add-question-btn.warned:hover {
          background: rgba(234,179,8,0.08);
          border-color: rgba(234,179,8,0.4);
          color: #ca8a04;
        }

        .save-btn {
          background: #1A7A4A; color: white; border: none;
          border-radius: 10px; padding: 10px 20px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .save-btn:hover { background: #155C38; transform: translateY(-1px); box-shadow: 0 0 16px rgba(26,122,74,0.35); }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .back-btn {
          background: none; border: none; color: #505050;
          font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px; border-radius: 8px; transition: all 0.2s;
        }
        .back-btn:hover { color: white; background: rgba(255,255,255,0.04); }

        .remove-btn {
          background: none; border: none; color: #333;
          font-size: 11px; cursor: pointer; font-family: 'Inter', sans-serif;
          padding: 4px 8px; border-radius: 6px; transition: all 0.2s;
        }
        .remove-btn:hover { color: #dc2626; background: rgba(220,38,38,0.08); }

        .option-input {
          background: none; border: none;
          font-size: 13px; color: #A0A0A0;
          outline: none; flex: 1; font-family: 'Inter', sans-serif;
        }
        .option-input:focus { color: white; }

        .tip-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 12px 14px;
          transition: all 0.2s;
        }
        .tip-card:hover {
          background: ${config.bg};
          border-color: ${config.border};
        }

        .edit-hint {
          font-size: 11px;
          color: #505050;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
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
          <div style={{ maxWidth: '960px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Logo onClick={() => router.push('/dashboard')} />
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '16px' }}>/</span>
              <button className="back-btn" style={{ padding: '4px 8px' }} onClick={() => router.push('/dashboard')}>
                Dashboard
              </button>
            </div>
            <button className="save-btn" onClick={saveForm} disabled={saving}>
              {saving ? 'Saving...' : 'Save & continue →'}
            </button>
          </div>
        </nav>

        {/* Mode banner */}
        <div style={{
          backgroundColor: config.bg,
          borderBottom: `1px solid ${config.border}`,
          padding: '10px 32px',
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '10px', fontWeight: '600', color: config.color,
              backgroundColor: `${config.bg}`,
              border: `1px solid ${config.border}`,
              borderRadius: '6px', padding: '2px 10px',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {config.label} mode
            </span>
            <p style={{ fontSize: '12px', color: '#505050' }}>{config.description}</p>
          </div>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 32px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px', alignItems: 'start' }}>

          {/* Main editor */}
          <div style={{ opacity: 0, animation: 'fadeUp 0.5s ease 0.1s forwards' }}>

            {/* Title */}
            <div style={{ marginBottom: '8px' }}>
              <p className="edit-hint">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9l2-2 5-5-2-2-5 5-2 2h2z" stroke="#505050" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Click title to edit
              </p>
              {editingTitle ? (
                <input
                  className="title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                  autoFocus
                  placeholder="Form title"
                />
              ) : (
                <div className="title-display" onClick={() => setEditingTitle(true)}>
                  {title || <span style={{ color: '#333' }}>Form title</span>}
                </div>
              )}
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {questions.map((q, i) => (
                <div
                  key={i}
                  className={`question-card ${activeQuestion === i ? 'active' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => setActiveQuestion(i)}
                >
                  {/* Card top bar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px 0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#333', fontWeight: '600' }}>Q{i + 1}</span>
                      <span style={{
                        fontSize: '10px', fontWeight: '600',
                        color: config.color,
                        backgroundColor: config.bg,
                        border: `1px solid ${config.border}`,
                        borderRadius: '5px', padding: '1px 7px',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {q.type.replace('_', ' ')}
                      </span>
                      {modeConfig[mode]?.typeWarnings[q.type] && (
                        <span style={{ fontSize: '10px', color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          ⚠ {modeConfig[mode].typeWarnings[q.type]}
                        </span>
                      )}
                    </div>
                    <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeQuestion(i) }}>Remove</button>
                  </div>

                  {/* Question label — inline edit */}
                  <div style={{ padding: '8px 14px 14px' }}>
                    <p className="edit-hint" style={{ marginBottom: '4px' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9l2-2 5-5-2-2-5 5-2 2h2z" stroke="#505050" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Click to edit question
                    </p>
                    {activeQuestion === i ? (
                      <input
                        className="question-input"
                        value={q.label}
                        onChange={(e) => updateQuestion(i, { label: e.target.value })}
                        placeholder="Type your question here..."
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <div
                        className={`question-label-display ${!q.label ? 'empty' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveQuestion(i) }}
                      >
                        {q.label || 'Click to write your question...'}
                      </div>
                    )}

                    {/* Type-specific preview */}
                    {q.type === 'rating' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} style={{ width: '34px', height: '34px', borderRadius: '50%', border: `1px solid ${config.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#505050' }}>{n}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'yes_no' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        {['Yes', 'No'].map(opt => (
                          <div key={opt} style={{ padding: '7px 20px', borderRadius: '8px', border: `1px solid ${config.border}`, backgroundColor: config.bg }}>
                            <span style={{ fontSize: '13px', color: '#505050' }}>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'multiple_choice' && (
                      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {q.options?.map((opt, oi) => (
                          <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${config.border}`, backgroundColor: config.bg }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `1px solid ${config.color}`, flexShrink: 0 }} />
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
                              <button onClick={(e) => { e.stopPropagation(); updateQuestion(i, { options: q.options?.filter((_, idx) => idx !== oi) }) }}
                                style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: '12px', transition: 'color 0.2s' }}>✕</button>
                            )}
                          </div>
                        ))}
                        <button onClick={(e) => { e.stopPropagation(); updateQuestion(i, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }) }}
                          style={{ background: 'none', border: 'none', color: '#505050', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: '4px 0', textAlign: 'left', transition: 'color 0.2s' }}>
                          + Add option
                        </button>
                      </div>
                    )}

                    {q.type === 'text' && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${config.border}`, backgroundColor: config.bg }}>
                        <span style={{ fontSize: '12px', color: '#333' }}>Short text answer...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add question */}
            <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px' }}>
              <p style={{ fontSize: '11px', color: '#505050', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Add question</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {([
                  { type: 'text' as QuestionType, label: '+ Text', warned: !!modeConfig[mode]?.typeWarnings['text'] },
                  { type: 'rating' as QuestionType, label: '+ Rating', warned: false },
                  { type: 'yes_no' as QuestionType, label: '+ Yes / No', warned: false },
                  { type: 'multiple_choice' as QuestionType, label: '+ Multiple choice', warned: !!modeConfig[mode]?.typeWarnings['multiple_choice'] },
                ]).map(({ type, label, warned }) => (
                  <button
                    key={type}
                    className={`add-question-btn ${warned ? 'warned' : ''}`}
                    onClick={() => addQuestion(type)}
                    title={warned ? modeConfig[mode]?.typeWarnings[type] : ''}
                  >
                    {label}
                    {warned && <span style={{ fontSize: '10px' }}>⚠</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ position: 'sticky', top: '120px', opacity: 0, animation: 'fadeUp 0.5s ease 0.2s forwards' }}>

            {/* Mode tips */}
            <div style={{
              background: '#141414',
              border: `1px solid ${config.border}`,
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: config.color }} />
                <p style={{ fontSize: '11px', color: config.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {config.label} mode tips
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {config.tips.map((t) => (
                  <div key={t.title} className="tip-card">
                    <p style={{ fontSize: '12px', fontWeight: '500', color: 'white', marginBottom: '3px' }}>{t.title}</p>
                    <p style={{ fontSize: '11px', color: '#505050', lineHeight: '1.5' }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form info */}
            <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
              <p style={{ fontSize: '11px', color: '#505050', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Form info</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Questions', value: `${questions.length}` },
                  { label: 'Est. completion', value: `${questions.length * 15}s` },
                  { label: 'Mode', value: config.label },
                  { label: 'Recommended', value: mode === 'quick' ? '≤3 questions' : mode === 'flow' ? '3–6 questions' : '5–7 questions' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#505050' }}>{s.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: s.label === 'Mode' ? config.color : 'white' }}>{s.value}</span>
                  </div>
                ))}
                {mode === 'quick' && questions.length > 3 && (
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', marginTop: '4px' }}>
                    <p style={{ fontSize: '11px', color: '#ca8a04' }}>⚠ Quick mode works best with 3 or fewer questions</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}