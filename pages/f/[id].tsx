import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Loader from '../../components/Loader'

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
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  const loadForm = async () => {
    const { data: formData } = await supabase.from('forms').select('*').eq('id', id).single()
    const { data: questionsData } = await supabase.from('questions').select('*').eq('form_id', id).order('order_index')
    if (formData) setForm(formData)
    if (questionsData) setQuestions(questionsData)
    if (id) {
      await supabase.rpc('increment_views', { form_id: id })
    }
    setLoading(false)
  }

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const submitForm = async () => {
    setSubmitting(true)
    await supabase.from('responses').insert({ form_id: id, answers })
    setSubmitted(true)
    setSubmitting(false)
  }

  const answeredCount = Object.keys(answers).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  if (loading) return <Loader label="Getting your form ready" />

  if (!form) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '24px' }}>
      <p style={{ fontSize: '14px', color: '#505050' }}>Form not found.</p>
    </div>
  )

  if (!form.is_active) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }
      `}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 5v7M11 15v.5" stroke="#505050" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', color: 'white', marginBottom: '8px' }}>This form is closed</h2>
        <p style={{ fontSize: '14px', color: '#505050' }}>The host is no longer accepting responses.</p>
      </div>
    </>
  )

  if (submitted) return (
    <>
      <Head>
        <title>{form?.title || 'Form'} — Formr</title>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }
        @keyframes checkPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes orbFloat { 0%, 100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.05); } }
      `}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.1) 0%, transparent 65%)', animation: 'orbFloat 6s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(26,122,74,0.15)', border: '1px solid rgba(26,122,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', animation: 'checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards', position: 'relative', zIndex: 1 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14l6 6L22 8" stroke="#1A7A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', color: 'white', marginBottom: '10px', opacity: 0, animation: 'fadeUp 0.4s ease 0.2s forwards', position: 'relative', zIndex: 1 }}>
          Thank you!
        </h2>
        <p style={{ fontSize: '15px', color: '#505050', opacity: 0, animation: 'fadeUp 0.4s ease 0.3s forwards', position: 'relative', zIndex: 1, marginBottom: '32px' }}>
          Your response has been recorded.
        </p>
        <div style={{ opacity: 0, animation: 'fadeUp 0.4s ease 0.4s forwards', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '12px', color: '#333' }}>Powered by Formr</p>
        </div>
      </div>
    </>
  )

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0D0D0D; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.92); } }

    .grid-bg {
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .q-card {
      background: #141414;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 18px;
      padding: 24px;
      opacity: 0;
      animation: fadeUp 0.4s ease forwards;
      transition: border-color 0.2s;
    }
    .q-card.answered { border-color: rgba(26,122,74,0.25); }

    .rating-btn {
      width: 52px; height: 52px; border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 500; color: #505050;
      cursor: pointer; font-family: 'Inter', sans-serif;
      transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    }
    .rating-btn:hover { background: rgba(26,122,74,0.1); border-color: rgba(26,122,74,0.3); color: #1A7A4A; transform: scale(1.08); }
    .rating-btn.selected { background: rgba(26,122,74,0.2); border-color: #1A7A4A; color: #1A7A4A; transform: scale(1.12); box-shadow: 0 0 12px rgba(26,122,74,0.3); }

    .option-btn {
      width: 100%; padding: 14px 18px;
      background: rgba(255,255,255,0.04);
      border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: 12px; cursor: pointer;
      font-size: 14px; color: white; text-align: left;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s ease;
      display: flex; align-items: center; gap: 12px;
    }
    .option-btn:hover { background: rgba(26,122,74,0.06); border-color: rgba(26,122,74,0.25); }
    .option-btn.selected { background: rgba(26,122,74,0.12); border-color: rgba(26,122,74,0.45); color: white; }

    .text-area {
      width: 100%; padding: 14px 16px;
      background: rgba(255,255,255,0.04);
      border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: 12px; font-size: 14px; color: white;
      outline: none; resize: none; font-family: 'Inter', sans-serif;
      transition: border-color 0.2s, box-shadow 0.2s;
      line-height: 1.6;
    }
    .text-area::placeholder { color: #333; }
    .text-area:focus { border-color: rgba(26,122,74,0.4); box-shadow: 0 0 0 3px rgba(26,122,74,0.08); }

    .submit-btn {
      width: 100%; padding: 16px;
      background: #1A7A4A; color: white; border: none;
      border-radius: 14px; font-size: 15px; font-weight: 500;
      cursor: pointer; font-family: 'Inter', sans-serif;
      transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .submit-btn:hover { background: #155C38; transform: translateY(-2px); box-shadow: 0 0 24px rgba(26,122,74,0.35); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

    .flow-next-btn {
      width: 100%; padding: 16px;
      background: #1A7A4A; color: white; border: none;
      border-radius: 14px; font-size: 15px; font-weight: 500;
      cursor: pointer; font-family: 'Inter', sans-serif;
      transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
      margin-top: 24px;
    }
    .flow-next-btn:hover { background: #155C38; transform: translateY(-2px); box-shadow: 0 0 24px rgba(26,122,74,0.3); }

    .back-link {
      background: none; border: none; color: #505050;
      font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif;
      margin-top: 14px; transition: color 0.2s; display: block; text-align: center;
    }
    .back-link:hover { color: white; }

    /* Public form heading */
    .public-form-title {
      font-family: 'DM Serif Display', serif;
      font-size: 36px;
      font-weight: 400;
      color: white;
      margin-bottom: 6px;
      letter-spacing: -0.3px;
      line-height: 1.1;
    }

    /* Flow heading */
    .flow-question-heading {
      font-family: 'DM Serif Display', serif;
      font-size: 34px;
      font-weight: 400;
      color: white;
      margin-bottom: 32px;
      line-height: 1.2;
      letter-spacing: -0.3px;
    }

    /* Public form content wrapper */
    .public-form-content {
      max-width: 600px;
      margin: 0 auto;
      padding: 48px 24px 80px;
      position: relative;
      z-index: 1;
    }

    /* Flow content wrapper */
    .flow-content {
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
    @media (max-width: 480px) {
      .public-form-title {
        font-size: 26px;
      }

      .flow-question-heading {
        font-size: 24px;
        margin-bottom: 24px;
      }

      .public-form-content {
        padding: 32px 16px 60px;
      }

      .flow-content {
        padding: 20px 16px;
      }

      .q-card {
        padding: 18px;
        border-radius: 14px;
      }

      .rating-btn {
        width: 44px;
        height: 44px;
        font-size: 14px;
      }
    }
  `

  // FLOW mode
  if (form.mode === 'flow') {
    const question = questions[currentStep]
    const isLast = currentStep === questions.length - 1
    const flowProgress = ((currentStep) / questions.length) * 100

    return (
      <>
        <style>{sharedStyles}</style>
        <div className="grid-bg" style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative' }}>
            <div style={{ height: '100%', backgroundColor: '#1A7A4A', width: `${flowProgress}%`, transition: 'width 0.5s ease', boxShadow: '0 0 8px rgba(26,122,74,0.5)' }} />
          </div>

          <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  width: i === currentStep ? '20px' : '6px',
                  height: '6px', borderRadius: '3px',
                  backgroundColor: i < currentStep ? '#1A7A4A' : i === currentStep ? '#1A7A4A' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  boxShadow: i === currentStep ? '0 0 6px rgba(26,122,74,0.5)' : 'none',
                }} />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#505050' }}>{currentStep + 1} of {questions.length}</span>
          </div>

          <div className="flow-content">
            <div style={{ width: '100%', maxWidth: '560px', animation: 'slideIn 0.35s ease forwards' }} key={currentStep}>

              <h2 className="flow-question-heading">
                {question?.label}
              </h2>

              {question?.type === 'text' && (
                <textarea className="text-area" rows={5} placeholder="Your answer..." value={answers[question.id] || ''} onChange={(e) => updateAnswer(question.id, e.target.value)} />
              )}

              {question?.type === 'rating' && (
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} className={`rating-btn ${answers[question.id] === n ? 'selected' : ''}`} onClick={() => updateAnswer(question.id, n)}>{n}</button>
                  ))}
                </div>
              )}

              {question?.type === 'yes_no' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Yes', 'No'].map(opt => (
                    <button key={opt} className={`option-btn ${answers[question.id] === opt ? 'selected' : ''}`} onClick={() => updateAnswer(question.id, opt)}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${answers[question.id] === opt ? '#1A7A4A' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {answers[question.id] === opt && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {question?.type === 'multiple_choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {question.options?.map(opt => (
                    <button key={opt} className={`option-btn ${answers[question.id] === opt ? 'selected' : ''}`} onClick={() => updateAnswer(question.id, opt)}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${answers[question.id] === opt ? '#1A7A4A' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {answers[question.id] === opt && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              <button className="flow-next-btn" onClick={() => isLast ? submitForm() : setCurrentStep(currentStep + 1)}>
                {isLast ? 'Submit response' : 'Next →'}
              </button>

              {currentStep > 0 && (
                <button className="back-link" onClick={() => setCurrentStep(currentStep - 1)}>← Back</button>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', color: '#333' }}>Powered by Formr</span>
          </div>
        </div>
      </>
    )
  }

  // QUICK + FORM mode
  return (
    <>
      <style>{sharedStyles}</style>
      <div className="grid-bg" style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '300px', background: 'linear-gradient(180deg, rgba(26,122,74,0.06) 0%, transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,74,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
          <div style={{ height: '100%', backgroundColor: '#1A7A4A', width: `${progress}%`, transition: 'width 0.4s ease', boxShadow: '0 0 8px rgba(26,122,74,0.5)' }} />
        </div>

        <div className="public-form-content">

          <div style={{ marginBottom: '36px', opacity: 0, animation: 'fadeUp 0.4s ease 0.05s forwards' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(26,122,74,0.08)', border: '1px solid rgba(26,122,74,0.15)', borderRadius: '20px', padding: '4px 12px', marginBottom: '16px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />
              <span style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '500' }}>
                {form.mode === 'quick' ? 'Quick response — under 1 minute' : 'Please fill out this form'}
              </span>
            </div>
            <h1 className="public-form-title">
              {form.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <span style={{ fontSize: '13px', color: '#505050' }}>{questions.length} questions</span>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
              <span style={{ fontSize: '13px', color: answeredCount > 0 ? '#1A7A4A' : '#505050' }}>
                {answeredCount} answered
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {questions.map((q, i) => (
              <div
                key={q.id}
                className={`q-card ${answers[q.id] !== undefined ? 'answered' : ''}`}
                style={{ animationDelay: `${0.1 + i * 0.07}s` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: 'white', lineHeight: '1.4', flex: 1, paddingRight: '12px' }}>{q.label}</p>
                  {answers[q.id] !== undefined && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(26,122,74,0.2)', border: '1px solid rgba(26,122,74,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#1A7A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                {q.type === 'text' && (
                  <textarea className="text-area" rows={3} placeholder="Your answer..." value={answers[q.id] || ''} onChange={(e) => updateAnswer(q.id, e.target.value)} />
                )}

                {q.type === 'rating' && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} className={`rating-btn ${answers[q.id] === n ? 'selected' : ''}`} onClick={() => updateAnswer(q.id, n)}>{n}</button>
                    ))}
                  </div>
                )}

                {q.type === 'yes_no' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['Yes', 'No'].map(opt => (
                      <button key={opt} className={`option-btn ${answers[q.id] === opt ? 'selected' : ''}`} onClick={() => updateAnswer(q.id, opt)}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${answers[q.id] === opt ? '#1A7A4A' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                          {answers[q.id] === opt && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />}
                        </div>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'multiple_choice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options?.map(opt => (
                      <button key={opt} className={`option-btn ${answers[q.id] === opt ? 'selected' : ''}`} onClick={() => updateAnswer(q.id, opt)}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${answers[q.id] === opt ? '#1A7A4A' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                          {answers[q.id] === opt && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />}
                        </div>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="submit-btn" onClick={submitForm} disabled={submitting}>
            {submitting ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Submitting...
              </>
            ) : 'Submit response'}
          </button>

          {questions.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p style={{ fontSize: '12px', color: '#505050' }}>
                {answeredCount === questions.length
                  ? 'All questions answered'
                  : `${questions.length - answeredCount} question${questions.length - answeredCount > 1 ? 's' : ''} remaining`}
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <span style={{ fontSize: '11px', color: '#333' }}>Powered by Formr</span>
          </div>
        </div>
      </div>
    </>
  )
}