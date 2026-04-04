import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Analytics } from '@vercel/analytics/react'



export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.body.style.backgroundColor = '#0D0D0D'
    document.documentElement.style.backgroundColor = '#0D0D0D'
  }, [])

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>
      <Component {...pageProps} />
      <Analytics />
    </div>
  )
}