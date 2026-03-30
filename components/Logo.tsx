import { useRouter } from 'next/router'

interface LogoProps {
  size?: number
  onClick?: () => void
  showWordmark?: boolean
  color?: string
}

export default function Logo({ size = 22, onClick, showWordmark = true, color = '#1A7A4A' }: LogoProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) onClick()
    else router.push('/')
  }

  return (
    <div
      onClick={handleClick}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
    >
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <rect x="1" y="1" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5"/>
        <rect x="3" y="3" width="4" height="4" rx="1" fill={color}/>
        <rect x="13" y="1" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5"/>
        <rect x="15" y="3" width="4" height="4" rx="1" fill={color}/>
        <rect x="1" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5"/>
        <rect x="3" y="15" width="4" height="4" rx="1" fill={color}/>
        <rect x="13" y="13" width="4" height="4" rx="1" fill={color} opacity="0.4"/>
        <rect x="18" y="13" width="3" height="3" rx="1" fill={color} opacity="0.4"/>
        <rect x="13" y="18" width="8" height="3" rx="1" fill={color} opacity="0.4"/>
      </svg>
      {showWordmark && (
        <span style={{ fontSize: '17px', fontWeight: '600', color: 'white', letterSpacing: '-0.3px', fontFamily: 'Inter, sans-serif' }}>
          Formr
        </span>
      )}
    </div>
  )
}