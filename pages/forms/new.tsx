import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

const steps = [
  {
    key: 'purpose',
    question: 'What do you need the form for?',
    subtitle: 'We\'ll suggest the best starting point for you.',
    options: [
      { label: 'Feedback', desc: 'Collect opinions and reviews', icon: '◎' },
      { label: 'Survey', desc: 'Gather structured responses', icon: '≡' },
      { label: 'Registration', desc: 'Sign ups and event forms', icon: '✦' },
      { label: 'Info gathering', desc: 'Collect data from people', icon: '◈' },
    ]
  },
  {
    key: 'who',
    question: 'Who are you?',
    subtitle: 'Help us tailor the experience to your needs.',
    options: [
      { label: 'Business', desc: 'Restaurant, salon, retail', icon: '⊞' },
      { label: 'Organization', desc: 'School org, nonprofit', icon: '◉' },
      { label: 'Team', desc: 'Work or project team', icon: '⊕' },
      { label: 'Personal', desc: 'Just for myself', icon: '◇' },
    ]
  },
  {
    key: 'mode',
    question: 'How should it feel?',
    subtitle: 'Pick the experience your respondents will have.',
    options: [
      { label: 'Quick', desc: 'Minimal, tap and done. Best for in-person.', icon: '▸' },
      { label: 'Form', desc: 'All questions visible, clean layout.', icon: '☰' },
      { label: 'Flow', desc: 'One question at a time, full screen.', icon: '→' },
    ]
  }
]

export default function NewForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const currentStep = steps[step]

  const handleSelect = async (option: string) => {
    setSelected(option)
    setTimeout(async () => {
      const newAnswers = { ...answers, [currentStep.key]: option }
      setAnswers(newAnswers)
      setSelected(null)

      if (step < steps.length - 1) {
        setStep(step + 1)
      } else {
        await createForm(newAnswers)
      }
    }, 300)
  }

  const createForm = async (finalAnswers: Record<string, string>) => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('forms')
      .insert({
        title: 'Untitled form',
        mode: finalAnswers.mode.toLowerCase(),
        owner_id: session.user.id,
      })
      .select()
      .single()

    if (error) { console.error(error); setLoading(false); return }
    router.push(`/forms/${data.id}/edit`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#1A7A4A', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '14px', color: '#6B6B5E' }}>Setting up your form...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes selectPulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }

        .option-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
        .option-card:hover {
          background: rgba(26,122,74,0.08);
          border-color: rgba(26,122,74,0.3);
          transform: translateX(4px);
        }
        .option-card.selected {
          background: rgba(26,122,74,0.15);
          border-color: rgba(26,122,74,0.5);
          animation: selectPulse 0.3s ease;
        }
        .back-btn {
          background: none;
          border: none;
          color: #6B6B5E;
          font-size: 13px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
          padding: 0;
        }
        .back-btn:hover { color: white; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background orb */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,122,74,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Navbar */}
        <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <span
            onClick={() => router.push('/dashboard')}
            style={{ fontSize: '17px', fontWeight: '600', color: 'white', cursor: 'pointer', letterSpacing: '-0.3px' }}
          >
            Formr
          </span>
          <button className="back-btn" onClick={() => router.push('/dashboard')}>
            ← Dashboard
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 1 }}>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '48px', animation: 'fadeIn 0.4s ease forwards' }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  height: '3px',
                  width: i === step ? '24px' : '8px',
                  borderRadius: '2px',
                  backgroundColor: i < step ? '#1A7A4A' : i === step ? '#1A7A4A' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                  opacity: i > step ? 0.4 : 1,
                }}
              />
            ))}
          </div>

          {/* Question */}
          <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeUp 0.4s ease forwards' }}>
            <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Step {step + 1} of {steps.length}
            </p>
            <h1 style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: '40px',
              fontWeight: '400',
              color: 'white',
              marginBottom: '10px',
              letterSpacing: '-0.5px',
              lineHeight: '1.1',
            }}>
              {currentStep.question}
            </h1>
            <p style={{ fontSize: '14px', color: '#6B6B5E' }}>
              {currentStep.subtitle}
            </p>
          </div>

          {/* Options */}
          <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentStep.options.map((option, i) => (
              <div
                key={option.label}
                className={`option-card ${selected === option.label ? 'selected' : ''}`}
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => handleSelect(option.label)}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: selected === option.label ? 'rgba(26,122,74,0.2)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${selected === option.label ? 'rgba(26,122,74,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', color: selected === option.label ? '#1A7A4A' : '#6B6B5E',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}>
                  {option.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '2px' }}>
                    {option.label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B6B5E' }}>
                    {option.desc}
                  </p>
                </div>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: `1.5px solid ${selected === option.label ? '#1A7A4A' : 'rgba(255,255,255,0.1)'}`,
                  backgroundColor: selected === option.label ? '#1A7A4A' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}>
                  {selected === option.label && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Back button */}
          {step > 0 && (
            <button
              className="back-btn"
              onClick={() => setStep(step - 1)}
              style={{ marginTop: '28px' }}
            >
              ← Back
            </button>
          )}

        </div>
      </div>
    </>
  )
}