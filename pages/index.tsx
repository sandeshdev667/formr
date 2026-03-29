import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <div className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <h1 className="text-lg font-medium text-gray-900">Formr</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            Get started
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-block bg-gray-50 border border-gray-100 text-xs text-gray-500 px-3 py-1.5 rounded-full mb-8">
          Simple forms. Real responses.
        </div>
        <h2 className="text-5xl font-medium text-gray-900 leading-tight mb-6">
          The cleanest way to<br />collect feedback
        </h2>
        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Create beautiful forms in minutes, generate a QR code, and start collecting responses — no clutter, no complexity.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            Start for free
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            See how it works →
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-50">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest text-center mb-12">
          How it works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Create your form',
              desc: 'Answer 3 quick questions and land on the perfect starting point for your form.'
            },
            {
              step: '02',
              title: 'Share via QR or link',
              desc: 'Get a print-ready QR code and a shareable link instantly. No setup required.'
            },
            {
              step: '03',
              title: 'Collect responses',
              desc: 'Watch responses come in on your dashboard. Clean, simple, actionable.'
            }
          ].map((item) => (
            <div key={item.step}>
              <p className="text-xs text-gray-300 font-medium mb-3">{item.step}</p>
              <h3 className="text-base font-medium text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modes */}
      <div className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-50">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest text-center mb-4">
          Three modes
        </p>
        <h3 className="text-2xl font-medium text-gray-900 text-center mb-12">
          Pick the experience that fits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Quick',
              desc: 'Minimal questions, big tap targets. Done in seconds. Perfect for receipts and table cards.',
              tag: 'Fast'
            },
            {
              name: 'Form',
              desc: 'All questions visible, clean layout. Familiar and comfortable for surveys and info gathering.',
              tag: 'Standard'
            },
            {
              name: 'Flow',
              desc: 'One question at a time, full screen. Focused and engaging — highest completion rates.',
              tag: 'Immersive'
            }
          ].map((mode) => (
            <div
              key={mode.name}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-medium text-gray-900">{mode.name}</h4>
                <span className="text-xs text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded-lg">
                  {mode.tag}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{mode.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h3 className="text-3xl font-medium text-gray-900 mb-4">
          Ready to get started?
        </h3>
        <p className="text-gray-400 text-sm mb-8">
          Create your first form in under 2 minutes. No credit card required.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          Create your first form
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-50 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">Formr</p>
          <p className="text-xs text-gray-300">Built with Next.js & Supabase</p>
        </div>
      </div>

    </div>
  )
}