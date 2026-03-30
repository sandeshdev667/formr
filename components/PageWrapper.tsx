interface PageWrapperProps {
  children: React.ReactNode
  maxWidth?: string
  padding?: string
  className?: string
}

export default function PageWrapper({ children, maxWidth = '1280px', padding = '48px 32px', className }: PageWrapperProps) {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding }}>
      {children}
    </div>
  )
}