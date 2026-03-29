import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <div style={{ backgroundColor: '#F5F4EF', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid #DDDDD6' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#0A0A0A', letterSpacing: '-0.3px' }}>Formr</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.push('/login')}
              style={{ background: 'none', border: 'none', fontSize: '14px', color: '#6B6B5E', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{ backgroundColor: '#1A7A4A', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#EEEDE7', border: '1px solid #DDDDD6', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', color: '#6B6B5E', marginBottom: '32px', letterSpacing: '0.02em' }}>
          Simple forms. Real responses.
        </div>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '64px', fontWeight: '400', color: '#0A0A0A', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
          The cleanest way to<br />collect feedback
        </h1>
        <p style={{ fontSize: '18px', color: '#6B6B5E', marginBottom: '40px', lineHeight: '1.7', maxWidth: '520px', margin: '0 auto 40px' }}>
          Create beautiful forms in minutes, generate a QR code, and start collecting responses — no clutter, no complexity.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/login')}
            style={{ backgroundColor: '#1A7A4A', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 28px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Start for free
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{ background: 'none', border: 'none', fontSize: '15px', color: '#6B6B5E', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            See how it works →
          </button>
        </div>
      </div>

      {/* Free badge */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#EEEDE7', border: '1px solid #DDDDD6', borderRadius: '12px', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          {[
            { label: 'Always free', desc: 'No credit card required' },
            { label: 'Unlimited forms', desc: 'Create as many as you need' },
            { label: 'Instant QR codes', desc: 'Share anywhere, anytime' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {i > 0 && <div style={{ width: '1px', height: '32px', backgroundColor: '#DDDDD6' }} />}
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A7A4A', marginBottom: '2px' }}>{item.label}</p>
                <p style={{ fontSize: '12px', color: '#A8A89E' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ borderTop: '1px solid #DDDDD6', backgroundColor: '#EEEDE7' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' }}>
          <p style={{ fontSize: '11px', color: '#A8A89E', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: '48px' }}>
            How it works
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
            {[
              { step: '01', title: 'Create your form', desc: 'Answer 3 quick questions and land on the perfect starting point for your form.' },
              { step: '02', title: 'Share via QR or link', desc: 'Get a print-ready QR code and a shareable link instantly. No setup required.' },
              { step: '03', title: 'Collect responses', desc: 'Watch responses come in on your dashboard. Clean, simple, actionable.' },
            ].map((item) => (
              <div key={item.step}>
                <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.05em' }}>{item.step}</p>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0A0A0A', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#6B6B5E', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three modes */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ fontSize: '11px', color: '#A8A89E', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: '12px' }}>
          Three modes
        </p>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '40px', fontWeight: '400', color: '#0A0A0A', textAlign: 'center', marginBottom: '48px', letterSpacing: '-0.5px' }}>
          Pick the experience that fits
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { name: 'Quick', tag: 'Fast', desc: 'Minimal questions, big tap targets. Done in seconds. Perfect for receipts and table cards.' },
            { name: 'Form', tag: 'Standard', desc: 'All questions visible, clean layout. Familiar and comfortable for surveys and info gathering.' },
            { name: 'Flow', tag: 'Immersive', desc: 'One question at a time, full screen. Focused and engaging — highest completion rates.' },
          ].map((mode) => (
            <div key={mode.name} style={{ backgroundColor: '#EEEDE7', borderRadius: '16px', padding: '28px', border: '1px solid #DDDDD6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0A0A0A' }}>{mode.name}</h4>
                <span style={{ fontSize: '11px', color: '#6B6B5E', backgroundColor: '#F5F4EF', border: '1px solid #DDDDD6', borderRadius: '6px', padding: '3px 10px' }}>{mode.tag}</span>
              </div>
              <p style={{ fontSize: '14px', color: '#6B6B5E', lineHeight: '1.6' }}>{mode.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coming soon */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ backgroundColor: '#0A0A0A', borderRadius: '20px', padding: '64px', color: 'white' }}>
          <p style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
            Coming soon
          </p>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '40px', fontWeight: '400', color: 'white', marginBottom: '16px', letterSpacing: '-0.5px', maxWidth: '500px', lineHeight: '1.2' }}>
            The form is just the beginning.
          </h3>
          <p style={{ fontSize: '15px', color: '#A8A89E', lineHeight: '1.7', maxWidth: '480px', marginBottom: '32px' }}>
            We're building response analytics so you don't just collect feedback — you understand it. Charts, trends, averages, and insights that actually tell you something.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Response trends', 'Rating averages', 'Completion rates'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A7A4A' }} />
                <span style={{ fontSize: '13px', color: '#6B6B5E' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div style={{ borderTop: '1px solid #DDDDD6', borderBottom: '1px solid #DDDDD6', backgroundColor: '#EEEDE7' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', fontWeight: '400', color: '#0A0A0A', lineHeight: '1.4', marginBottom: '24px' }}>
            "Finally a form tool that doesn't get in the way. Set up in 2 minutes, QR code ready instantly."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A7A4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>S</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#0A0A0A' }}>Early user</p>
              <p style={{ fontSize: '12px', color: '#A8A89E' }}>Restaurant owner, Texas</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '48px', fontWeight: '400', color: '#0A0A0A', marginBottom: '16px', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
          Ready to get started?
        </h3>
        <p style={{ fontSize: '16px', color: '#6B6B5E', marginBottom: '32px', lineHeight: '1.6' }}>
          Create your first form in under 2 minutes. Completely free, no credit card required.
        </p>
        <button
          onClick={() => router.push('/login')}
          style={{ backgroundColor: '#1A7A4A', color: 'white', border: 'none', borderRadius: '10px', padding: '16px 36px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          Create your first form
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #DDDDD6', padding: '24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0A0A0A' }}>Formr</span>
          <span style={{ fontSize: '12px', color: '#A8A89E' }}>Built with Next.js & Supabase</span>
        </div>
      </div>

    </div>
  )
}