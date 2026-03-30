import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

interface Question {
  id: string
  type: string
  label: string
  options?: string[]
  order_index: number
}

interface Form {
  id: string
  title: string
  mode: string
  is_active: boolean
}

export default function PublicForm() {
  const router = useRouter()
  const { id } = router.query
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  const loadForm = async () => {
    const { data: formData } = await supabase.from('forms').select('*').eq('id', id).single()
    const { data: questionsData } = await supabase.from('questions').select('*').eq('form_id', id).order('order_index')
    if (formData) setForm(formData)
    if (questionsData) setQuestions(questionsData)
    setLoading(false)
  }

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const submitForm = async () => {
    await supabase.from('responses').insert({ form_id: id, answers })
    setSubmitted(true)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#1A7A4A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!form) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ fontSize: '14px', color: '#505050' }}>Form not found.</p>
    </div>
  )

  if (!form.is_active) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '24px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v6M10 14v.5" stroke="#505050" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: 'white', marginBottom: '8px' }}>This form is closed</h2>
      <p style={{ fontSize: '14px', color: '#505050' }}>The host is no longer accepting responses.</p>
    </div>
  )

  if (submitted) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(26,122,74,0.15)', border: '1px solid rgba(26,122,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', animation: 'checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="#1A7A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: 'white', marginBottom: '8px', opacity: 0, animation: 'fadeUp 0.4s ease 0.2s forwards' }}>Thank you!</h2>
        <p style={{ fontSize: '14px', color: '#505050', opacity: 0, animation: 'fadeUp 0.4s ease 0.3s forwards' }}>Your response has been recorded.</p>
      </div>
    </>
  )

  // FLOW mode
  if (form.mode === 'flow') {
    const question = questions[currentStep]
    const isLast = currentStep === questions.length - 1
    const progress = ((currentStep) / questions.length) * 100

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0D0D0D; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

          .flow-option {
            width: 100%;
            padding: 16px 20px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            cursor: pointer;
            font-size: 14px;
            color: white;
            font-family: 'Inter', sans-serif;
            text-align: left;
            transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          }
          .flow-option:hover {
            background: rgba(26,122,74,0.08);
            border-color: rgba(26,122,74,0.25);
            transform: translateX(4px);
          }
          .flow-option.selected {
            background: rgba(26,122,74,0.12);
            border-color: rgba(26,122,74,0.4);
          }
          .flow-rating {
            width: 52px; height: 52px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.04);
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; font-weight: 500; color: #505050;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          }
          .flow-rating:hover, .flow-rating.selected {
            background: rgba(26,122,74,0.15);
            border-color: rgba(26,122,74,0.4);
            color: #1A7A4A;
            transform: scale(1.1);
          }
          .next-btn {
            width: 100%;
            padding: 14px;
            background: #1A7A4A; color: white; border: none;
            border-radius: 12px; font-size: 14px; font-weight: 500;
            cursor: pointer; font-family: 'Inter', sans-serif;
            transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
            margin-top: 24px;
          }
          .next-btn:hover { background: #155C38; transform: translateY(-2px); box-shadow: 0 0 20px rgba(26,122,74,0.3); }
          .back-link {
            background: none; border: none; color: #505050;
            font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif;
            margin-top: 16px; transition: color 0.2s;
          }
          .back-link:hover { color: white; }
          .text-area {
            width: 100%; padding: 14px 16px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px; font-size: 14px; color: white;
            outline: none; resize: none; font-family: 'Inter', sans-serif;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .text-area::placeholder { color: #333; }
          .text-area:focus { border-color: rgba(26,122,74,0.4); box-shadow: 0 0 0 3px rgba(26,122,74,0.08); }
        `}</style>

        <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

          {/* Background orb */}
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

          {/* Progress bar */}
          <div style={{ height: '2px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', backgroundColor: '#1A7A4A', width: `${progress}%`, transition: 'width 0.4s ease', boxShadow: '0 0 8px rgba(26,122,74,0.5)' }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 1 }}>

            <div style={{ width: '100%', maxWidth: '520px', animation: 'slideIn 0.4s ease forwards' }}>

              <p style={{ fontSize: '11px', color: '#505050', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {currentStep + 1} of {questions.length}
              </p>

              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', fontWeight: '400', color: 'white', marginBottom: '32px', lineHeight: '1.2', letterSpacing: '-0.3px' }}>
                {question?.label}
              </h2>

              {/* Answer input */}
              {question?.type === 'text' && (
                <textarea
                  className="text-area"
                  rows={4}
                  placeholder="Your answer..."
                  value={answers[question.id] || ''}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                />
              )}

              {question?.type === 'rating' && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} className={`flow-rating ${answers[question.id] === n ? 'selected' : ''}`} onClick={() => updateAnswer(question.id, n)}>
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {question?.type === 'yes_no' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Yes', 'No'].map(opt => (
                    <button key={opt} className={`flow-option ${answers[question.id] === opt ? 'selected' : ''}`} onClick={() => updateAnswer(question.id, opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {question?.type === 'multiple_choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {question.options?.map(opt => (
                    <button key={opt} className={`flow-option ${answers[question.id] === opt ? 'selected' : ''}`} onClick={() => updateAnswer(question.id, opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              <button className="next-btn" onClick={() => isLast ? submitForm() : setCurrentStep(currentStep + 1)}>
                {isLast ? 'Submit response' : 'Next →'}
              </button>

              {currentStep > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <button className="back-link" onClick={() => setCurrentStep(currentStep - 1)}>← Back</button>
                </div>
              )}
            </div>
          </div>

          {/* Branding */}
          <div style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', color: '#333' }}>Powered by Formr</span>
          </div>
        </div>
      </>
    )
  }

  // QUICK and FORM mode
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .q-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px;
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }
        .option-btn {
          width: 100%; padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; cursor: pointer;
          font-size: 14px; color: white; text-align: left;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .option-btn:hover { background: rgba(26,122,74,0.06); border-color: rgba(26,122,74,0.2); }
        .option-btn.selected { background: rgba(26,122,74,0.12); border-color: rgba(26,122,74,0.35); color: #1A7A4A; }
        .rating-btn {
          width: 44px; height: 44px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 500; color: #505050;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rating-btn:hover, .rating-btn.selected { background: rgba(26,122,74,0.15); border-color: rgba(26,122,74,0.4); color: #1A7A4A; transform: scale(1.1); }
        .submit-btn {
          width: 100%; padding: 14px;
          background: #1A7A4A; color: white; border: none;
          border-radius: 12px; font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .submit-btn:hover { background: #155C38; transform: translateY(-2px); box-shadow: 0 0 20px rgba(26,122,74,0.3); }
        .text-area {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; font-size: 14px; color: white;
          outline: none; resize: none; font-family: 'Inter', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .text-area::placeholder { color: #333; }
        .text-area:focus { border-color: rgba(26,122,74,0.4); box-shadow: 0 0 0 3px rgba(26,122,74,0.08); }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>

          <div style={{ marginBottom: '32px', opacity: 0, animation: 'fadeUp 0.4s ease 0.05s forwards' }}>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', fontWeight: '400', color: 'white', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              {form.title}
            </h1>
            <p style={{ fontSize: '13px', color: '#505050' }}>
              {form.mode === 'quick' ? 'Quick feedback — takes less than a minute' : 'Please fill out this form'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {questions.map((q, i) => (
              <div key={q.id} className="q-card" style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '16px', lineHeight: '1.4' }}>{q.label}</p>

                {q.type === 'text' && (
                  <textarea className="text-area" rows={3} placeholder="Your answer..." value={answers[q.id] || ''} onChange={(e) => updateAnswer(q.id, e.target.value)} />
                )}
                {q.type === 'rating' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} className={`rating-btn ${answers[q.id] === n ? 'selected' : ''}`} onClick={() => updateAnswer(q.id, n)}>{n}</button>
                    ))}
                  </div>
                )}
                {q.type === 'yes_no' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Yes', 'No'].map(opt => (
                      <button key={opt} className={`option-btn ${answers[q.id] === opt ? 'selected' : ''}`} onClick={() => updateAnswer(q.id, opt)}>{opt}</button>
                    ))}
                  </div>
                )}
                {q.type === 'multiple_choice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {q.options?.map(opt => (
                      <button key={opt} className={`option-btn ${answers[q.id] === opt ? 'selected' : ''}`} onClick={() => updateAnswer(q.id, opt)}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="submit-btn" onClick={submitForm}>Submit response</button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '11px', color: '#333' }}>Powered by Formr</span>
          </div>
        </div>
      </div>
    </>
  )
}