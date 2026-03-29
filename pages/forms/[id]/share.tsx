import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/router'
import { QRCodeSVG } from 'qrcode.react'

export default function ShareForm() {
  const router = useRouter()
  const { id } = router.query
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/f/${id}`

  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  const loadForm = async () => {
    const { data } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single()

    if (data) setForm(data)
    setLoading(false)
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      ctx?.drawImage(img, 0, 0, 400, 400)
      const a = document.createElement('a')
      a.download = `${form?.title || 'formr'}-qr.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
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
          onClick={() => router.push(`/forms/${id}/edit`)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Edit form
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Dashboard
        </button>
      </div>

      <div className="max-w-lg mx-auto px-6 py-12 text-center">

        <h2 className="text-2xl font-medium text-gray-900 mb-1">
          {form?.title}
        </h2>
        <p className="text-sm text-gray-400 mb-10">
          Share this QR code or link to collect responses
        </p>

        {/* QR Code */}
        <div className="bg-white rounded-2xl border border-gray-100 p-10 inline-block mb-6">
          <QRCodeSVG
            id="qr-code"
            value={formUrl}
            size={180}
            bgColor="#ffffff"
            fgColor="#111111"
            level="H"
          />
        </div>

        {/* Link */}
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500 truncate">{formUrl}</span>
          <button
            onClick={() => navigator.clipboard.writeText(formUrl)}
            className="text-xs text-gray-400 hover:text-gray-600 ml-3 shrink-0 transition-colors"
          >
            Copy
          </button>
        </div>

        {/* Download button */}
        <button
          onClick={downloadQR}
          className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          Download QR code
        </button>

        {/* View responses */}
        <button
          onClick={() => router.push(`/forms/${id}/responses`)}
          className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors mt-2"
        >
          View responses →
        </button>

      </div>
    </div>
  )
}