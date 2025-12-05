interface MascotProps {
  variant?: 'default' | 'welcome' | 'clock' | 'glasses' | 'celebration'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

const mascotImages: Record<string, string> = {
  default: '/assets/mascot/mascot-default.png',
  welcome: '/assets/mascot/mascot-welcome.png',
  clock: '/assets/mascot/mascot-clock.png',
  glasses: '/assets/mascot/mascot-glasses.png',
  celebration: '/assets/mascot/mascot-celebration.png',
}

const sizes = {
  sm: 'w-24 h-24',
  md: 'w-40 h-40',
  lg: 'w-56 h-56',
  xl: 'w-72 h-72',
}

export function Mascot({
  variant = 'default',
  size = 'lg',
  animate = true,
  className = ''
}: MascotProps) {
  return (
    <div
      className={`
        ${sizes[size]}
        ${animate ? 'animate-float hover:animate-pulse-subtle' : ''}
        ${className}
      `}
    >
      <img
        src={mascotImages[variant]}
        alt="Saarthi mascot"
        className="w-full h-full object-contain drop-shadow-xl"
        onError={(e) => {
          // Fallback to a placeholder if image doesn't load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
      {/* Fallback SVG mascot when images are not available */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ display: 'none' }}
      >
        {/* This is a simple placeholder - actual mascot images should be used */}
        <circle cx="100" cy="100" r="80" fill="#2dd4bf" />
        <circle cx="75" cy="85" r="15" fill="white" />
        <circle cx="125" cy="85" r="15" fill="white" />
        <circle cx="75" cy="85" r="8" fill="#1e293b" />
        <circle cx="125" cy="85" r="8" fill="#1e293b" />
        <ellipse cx="100" cy="115" rx="10" ry="8" fill="#f97316" />
        <path d="M 70 130 Q 100 160 130 130" stroke="#1e293b" strokeWidth="4" fill="none" />
      </svg>
    </div>
  )
}

// Placeholder mascot component for when actual images aren't available
export function MascotPlaceholder({
  variant = 'default',
  size = 'lg',
  animate = true,
  className = ''
}: MascotProps) {
  const getEyes = () => {
    if (variant === 'glasses') {
      return (
        <>
          {/* Glasses frames */}
          <circle cx="70" cy="80" r="22" fill="none" stroke="#5c4033" strokeWidth="4" />
          <circle cx="130" cy="80" r="22" fill="none" stroke="#5c4033" strokeWidth="4" />
          <line x1="92" y1="80" x2="108" y2="80" stroke="#5c4033" strokeWidth="3" />
          <line x1="48" y1="75" x2="35" y2="70" stroke="#5c4033" strokeWidth="3" />
          <line x1="152" y1="75" x2="165" y2="70" stroke="#5c4033" strokeWidth="3" />
          {/* Eyes behind glasses */}
          <circle cx="70" cy="80" r="10" fill="white" />
          <circle cx="130" cy="80" r="10" fill="white" />
          <circle cx="70" cy="80" r="5" fill="#1e293b" />
          <circle cx="130" cy="80" r="5" fill="#1e293b" />
        </>
      )
    }
    return (
      <>
        <ellipse cx="70" cy="80" rx="14" ry="16" fill="white" />
        <ellipse cx="130" cy="80" rx="14" ry="16" fill="white" />
        <circle cx="70" cy="82" r="8" fill="#1e293b" />
        <circle cx="130" cy="82" r="8" fill="#1e293b" />
        <circle cx="73" cy="78" r="3" fill="white" />
        <circle cx="133" cy="78" r="3" fill="white" />
      </>
    )
  }

  const getAccessories = () => {
    if (variant === 'clock') {
      return (
        <g transform="translate(145, 95)">
          {/* Clock body */}
          <circle cx="0" cy="0" r="25" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
          {/* Clock bells */}
          <circle cx="-15" cy="-20" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="15" cy="-20" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          {/* Clock face */}
          <circle cx="0" cy="0" r="20" fill="#fff8dc" />
          {/* Clock hands */}
          <line x1="0" y1="0" x2="0" y2="-12" stroke="#1e293b" strokeWidth="2" />
          <line x1="0" y1="0" x2="8" y2="5" stroke="#1e293b" strokeWidth="2" />
        </g>
      )
    }
    if (variant === 'glasses') {
      return (
        <g transform="translate(100, 155)">
          {/* Tie */}
          <polygon points="0,-10 -8,5 0,30 8,5" fill="#b45309" />
          <polygon points="-12,5 12,5 8,-5 -8,-5" fill="#b45309" />
        </g>
      )
    }
    if (variant === 'celebration') {
      return (
        <g transform="translate(150, 80)">
          {/* Star coin */}
          <circle cx="0" cy="0" r="22" fill="#f97316" />
          <polygon
            points="0,-12 4,-4 12,-4 6,2 8,10 0,5 -8,10 -6,2 -12,-4 -4,-4"
            fill="#fef3c7"
          />
        </g>
      )
    }
    return null
  }

  return (
    <div
      className={`
        ${sizes[size]}
        ${animate ? 'animate-float hover:animate-pulse-subtle' : ''}
        ${className}
      `}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
        {/* Body */}
        <ellipse cx="100" cy="130" rx="45" ry="55" fill="#2dd4bf" />

        {/* Head */}
        <circle cx="100" cy="85" r="55" fill="#2dd4bf" />

        {/* Head tuft */}
        <path d="M 95 30 Q 100 15 105 30 Q 100 25 95 30" fill="#2dd4bf" />
        <path d="M 92 35 Q 95 22 100 35" fill="#2dd4bf" />
        <path d="M 100 35 Q 105 22 108 35" fill="#2dd4bf" />

        {/* Wing left */}
        <ellipse cx="55" cy="130" rx="20" ry="35" fill="#26bfad" />

        {/* Wing right */}
        <ellipse cx="145" cy="130" rx="20" ry="35" fill="#26bfad" />

        {/* Tail feathers */}
        <g transform="translate(40, 160)">
          <ellipse cx="0" cy="20" rx="12" ry="25" fill="#26bfad" />
          <circle cx="0" cy="35" r="8" fill="#1e40af" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="0" cy="35" r="4" fill="#0ea5e9" />
        </g>
        <g transform="translate(55, 165)">
          <ellipse cx="0" cy="18" rx="10" ry="22" fill="#2dd4bf" />
          <circle cx="0" cy="32" r="6" fill="#1e40af" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="0" cy="32" r="3" fill="#0ea5e9" />
        </g>

        {/* Eyes */}
        {getEyes()}

        {/* Beak */}
        <path d="M 90 100 L 100 115 L 110 100 Z" fill="#f97316" />

        {/* Feet */}
        <g fill="#f97316">
          <rect x="80" y="180" width="8" height="15" rx="2" />
          <rect x="112" y="180" width="8" height="15" rx="2" />
          <ellipse cx="75" cy="195" rx="8" ry="4" />
          <ellipse cx="90" cy="195" rx="8" ry="4" />
          <ellipse cx="107" cy="195" rx="8" ry="4" />
          <ellipse cx="122" cy="195" rx="8" ry="4" />
        </g>

        {/* Accessories based on variant */}
        {getAccessories()}
      </svg>
    </div>
  )
}
