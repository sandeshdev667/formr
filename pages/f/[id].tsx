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
    const { data: formData } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single()

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', id)
      .order('order_index')

    if (formData) setForm(formData)
    if (questionsData) setQuestions(questionsData)
    setLoading(false)
  }

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const submitForm = async () => {
    await supabase.from('responses').insert({
      form_id: id,
      answers: answers
    })
    setSubmitted(true)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )

  if (!form) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Form not found.</p>
    </div>
  )

  /// Addition of active/inactive status feature 
  
  if (!form.is_active) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <h2 className="text-xl font-medium text-gray-900 mb-2">This form is closed</h2>
      <p className="text-sm text-gray-400">The host is no longer accepting responses.</p>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mb-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10l4.5 4.5L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="text-2xl font-medium text-gray-900 mb-2">Thank you!</h2>
      <p className="text-sm text-gray-400">Your response has been recorded.</p>
    </div>
  )

  // FLOW mode — one question at a time
  if (form.mode === 'flow') {
    const question = questions[currentStep]
    const isLast = currentStep === questions.length - 1

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        
        {/* Progress */}
        <div className="flex gap-1.5 mb-12">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-colors ${
                i <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-md">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
            {currentStep + 1} of {questions.length}
          </p>
          <h3 className="text-xl font-medium text-gray-900 mb-8">
            {question?.label}
          </h3>

          <QuestionInput
            question={question}
            value={answers[question?.id]}
            onChange={(val) => updateAnswer(question?.id, val)}
          />

          <button
            onClick={() => {
              if (isLast) submitForm()
              else setCurrentStep(currentStep + 1)
            }}
            className="w-full mt-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            {isLast ? 'Submit' : 'Next →'}
          </button>

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Back
            </button>
          )}
        </div>
      </div>
    )
  }

  // QUICK and FORM mode — all questions visible
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-12">

        <h2 className="text-2xl font-medium text-gray-900 mb-1">{form.title}</h2>
        <p className="text-sm text-gray-400 mb-8">
          {form.mode === 'quick' ? 'Quick feedback' : 'Please fill out this form'}
        </p>

        <div className="space-y-4 mb-8">
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-medium text-gray-900 mb-4">{q.label}</p>
              <QuestionInput
                question={q}
                value={answers[q.id]}
                onChange={(val) => updateAnswer(q.id, val)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={submitForm}
          className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          Submit
        </button>

      </div>
    </div>
  )
}

function QuestionInput({ question, value, onChange }: {
  question: Question
  value: any
  onChange: (val: any) => void
}) {
  if (!question) return null

  if (question.type === 'text') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your answer..."
        className="w-full text-sm text-gray-700 outline-none resize-none border border-gray-100 rounded-xl p-3 focus:border-gray-300 transition-colors"
        rows={3}
      />
    )
  }

  if (question.type === 'rating') {
    return (
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-full border text-sm font-medium transition-colors ${
              value === n
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-400 hover:border-gray-400'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'yes_no') {
    return (
      <div className="flex gap-3">
        {['Yes', 'No'].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-6 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              value === opt
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'multiple_choice') {
    return (
      <div className="space-y-2">
        {question.options?.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
              value === opt
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  return null
}