import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

const steps = [
  {
    key: 'purpose',
    question: 'What do you need the form for?',
    options: ['Feedback', 'Survey', 'Registration', 'Info gathering']
  },
  {
    key: 'who',
    question: 'Who are you?',
    options: ['Business', 'Organization', 'Team', 'Personal']
  },
  {
    key: 'mode',
    question: 'How should it feel?',
    options: ['Quick', 'Form', 'Flow'],
    descriptions: [
      'Minimal questions, done in seconds',
      'Standard layout, all questions visible',
      'One question at a time, full screen'
    ]
  }
]

export default function NewForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const currentStep = steps[step]

  const handleSelect = async (option: string) => {
    const newAnswers = { ...answers, [currentStep.key]: option }
    setAnswers(newAnswers)

    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      await createForm(newAnswers)
    }
  }

  const createForm = async (finalAnswers: Record<string, string>) => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('forms')
      .insert({
        title: 'Untitled form',
        mode: finalAnswers.mode.toLowerCase(),
        owner_id: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    router.push(`/forms/${data.id}/edit`)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Setting up your form...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-gray-900' : i < step ? 'bg-gray-400' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <h2 className="text-2xl font-medium text-gray-900 mb-8 text-center">
        {currentStep.question}
      </h2>

      {/* Options */}
      <div className="w-full max-w-sm space-y-3">
        {currentStep.options.map((option, i) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className="w-full px-5 py-4 text-left rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
          >
            <p className="text-sm font-medium text-gray-900">{option}</p>
            {currentStep.descriptions && (
              <p className="text-xs text-gray-400 mt-0.5">
                {currentStep.descriptions[i]}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-8 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Back
        </button>
      )}

    </div>
  )
}