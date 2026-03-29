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

    const { data: responsesData } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', id)
      .order('created_at', { ascending: false })

    if (formData) setForm(formData)
    if (questionsData) setQuestions(questionsData)
    if (responsesData) setResponses(responsesData)
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
          onClick={() => router.push(`/forms/${id}/share`)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Share page
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Dashboard
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-gray-900">{form?.title}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'}
          </p>
        </div>

        {/* Empty state */}
        {responses.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-gray-400 text-sm">No responses yet.</p>
            <p className="text-gray-300 text-sm mt-1">Share your form to start collecting responses.</p>
          </div>
        )}

        {/* Responses list */}
        <div className="space-y-4">
          {responses.map((response, i) => (
            <div key={response.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Response {responses.length - i}
                </span>
                <span className="text-xs text-gray-300">
                  {formatDate(response.created_at)}
                </span>
              </div>

              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id}>
                    <p className="text-xs text-gray-400 mb-1">{q.label}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {response.answers[q.id] !== undefined
                        ? String(response.answers[q.id])
                        : <span className="text-gray-300 font-normal">No answer</span>
                      }
                    </p>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}