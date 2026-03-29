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

  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  const loadForm = async () => {
    const { data: form } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single()

    if (form) setTitle(form.title)

    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', id)
      .order('order_index')

    if (qs) setQuestions(qs)
    setLoading(false)
  }

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      order_index: questions.length,
      type,
      label: '',
      options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] : undefined
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const saveForm = async () => {
    setSaving(true)

    await supabase
      .from('forms')
      .update({ title })
      .eq('id', id)

    await supabase
      .from('questions')
      .delete()
      .eq('form_id', id)

    if (questions.length > 0) {
      await supabase
        .from('questions')
        .insert(questions.map((q, i) => ({
          form_id: id,
          order_index: i,
          type: q.type,
          label: q.label,
          options: q.options || null
        })))
    }

    setSaving(false)
    router.push(`/forms/${id}/share`)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={saveForm}
          disabled={saving}
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & continue'}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Form title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-medium text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-gray-200 pb-2 mb-8 transition-colors"
          placeholder="Form title"
        />

        {/* Questions */}
        <div className="space-y-4 mb-8">
          {questions.map((q, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {q.type.replace('_', ' ')}
                </span>
                <button
                  onClick={() => removeQuestion(i)}
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>

              <input
                type="text"
                value={q.label}
                onChange={(e) => updateQuestion(i, { label: e.target.value })}
                placeholder="Type your question here..."
                className="w-full text-sm text-gray-900 outline-none placeholder-gray-300"
              />

              {q.type === 'multiple_choice' && (
                <div className="mt-3 space-y-2">
                  {q.options?.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-gray-300" />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...(q.options || [])]
                          newOptions[oi] = e.target.value
                          updateQuestion(i, { options: newOptions })
                        }}
                        className="text-sm text-gray-600 outline-none flex-1"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateQuestion(i, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] })}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    + Add option
                  </button>
                </div>
              )}

              {q.type === 'rating' && (
                <div className="flex gap-2 mt-3">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                      {n}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'yes_no' && (
                <div className="flex gap-3 mt-3">
                  <div className="px-4 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-400">Yes</div>
                  <div className="px-4 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-400">No</div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Add question buttons */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
            Add question
          </p>
          <div className="flex flex-wrap gap-2">
            {(['text', 'rating', 'yes_no', 'multiple_choice'] as QuestionType[]).map(type => (
              <button
                key={type}
                onClick={() => addQuestion(type)}
                className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                + {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}