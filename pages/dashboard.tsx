import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

interface Form {
  id: string
  title: string
  mode: string
  created_at: string
  is_active: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

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
    const { data } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setForms(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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

        {/* Empty state */}
        {forms.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-gray-400 text-sm">No forms yet.</p>
            <p className="text-gray-300 text-sm mt-1">Click "Create form" to get started.</p>
          </div>
        )}

        {/* Forms grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => router.push(`/forms/${form.id}/share`)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 leading-snug">
                  {form.title}
                </h3>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg ml-2 shrink-0">
                  {modeLabel(form.mode)}
                </span>
              </div>

              <p className="text-xs text-gray-300">{formatDate(form.created_at)}</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/forms/${form.id}/edit`)
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/forms/${form.id}/responses`)
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Responses
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/forms/${form.id}/share`)
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}