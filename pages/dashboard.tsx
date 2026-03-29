import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

interface Form {
  id: string
  title: string
  mode: string
  created_at: string
  is_active: boolean
  response_count?: number
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      loadForms()
    }
    getUser()
  }, [])

  const loadForms = async () => {
    const { data: formsData } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })

    if (!formsData) {
      setLoading(false)
      return
    }

    const formsWithCounts = await Promise.all(
      formsData.map(async (form) => {
        const { count } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('form_id', form.id)
        return { ...form, response_count: count || 0 }
      })
    )

    setForms(formsWithCounts)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleActive = async (form: Form) => {
    await supabase
      .from('forms')
      .update({ is_active: !form.is_active })
      .eq('id', form.id)

    setForms(forms.map(f =>
      f.id === form.id ? { ...f, is_active: !f.is_active } : f
    ))
  }

  const deleteForm = async (formId: string) => {
    const confirmed = window.confirm('Delete this form? This cannot be undone.')
    if (!confirmed) return

    setDeletingId(formId)
    await supabase.from('forms').delete().eq('id', formId)
    setForms(forms.filter(f => f.id !== formId))
    setDeletingId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const modeLabel = (mode: string) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1)
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
        <h1 className="text-lg font-medium text-gray-900">Formr</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-medium text-gray-900">Your forms</h2>
            <p className="text-sm text-gray-400 mt-1">
              {forms.length} {forms.length === 1 ? 'form' : 'forms'}
            </p>
          </div>
          <button
            onClick={() => router.push('/forms/new')}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            Create form
          </button>
        </div>

        {forms.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-gray-400 text-sm">No forms yet.</p>
            <p className="text-gray-300 text-sm mt-1">Click "Create form" to get started.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className={`bg-white rounded-2xl border p-5 transition-colors ${
                form.is_active ? 'border-gray-100 hover:border-gray-300' : 'border-gray-100 opacity-60'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-2">
                <h3
                  className="text-sm font-medium text-gray-900 leading-snug cursor-pointer"
                  onClick={() => router.push(`/forms/${form.id}/share`)}
                >
                  {form.title}
                </h3>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg ml-2 shrink-0">
                  {modeLabel(form.mode)}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs text-gray-300">{formatDate(form.created_at)}</p>
                <span className="text-xs text-gray-300">·</span>
                <p className="text-xs text-gray-400">
                  {form.response_count} {form.response_count === 1 ? 'response' : 'responses'}
                </p>
              </div>

              {/* Active/inactive badge */}
              <div className="mb-4">
                <button
                  onClick={() => toggleActive(form)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    form.is_active
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {form.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Action links */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/forms/${form.id}/edit`)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => router.push(`/forms/${form.id}/responses`)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Responses
                  </button>
                  <button
                    onClick={() => router.push(`/forms/${form.id}/share`)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Share
                  </button>
                </div>
                <button
                  onClick={() => deleteForm(form.id)}
                  disabled={deletingId === form.id}
                  className="text-xs text-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === form.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}