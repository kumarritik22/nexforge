// Nexforge SVG Logo - Geometric nexus/forge emblem
const NexforgeLogo = ({ size = 32, showText = true, className = '' }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nexforge-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="nexforge-grad-secondary" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
        </linearGradient>
        <filter id="nexforge-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer hexagon ring */}
      <polygon
        points="20,2 35,10.5 35,29.5 20,38 5,29.5 5,10.5"
        fill="none"
        stroke="url(#nexforge-grad-primary)"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Inner hexagon fill */}
      <polygon
        points="20,6 32,13 32,27 20,34 8,27 8,13"
        fill="url(#nexforge-grad-primary)"
        opacity="0.12"
      />
      {/* Center cross/nexus structure */}
      <g filter="url(#nexforge-glow)">
        {/* Vertical bar */}
        <rect x="18.5" y="10" width="3" height="20" rx="1.5" fill="url(#nexforge-grad-primary)" />
        {/* Horizontal bar */}
        <rect x="10" y="18.5" width="20" height="3" rx="1.5" fill="url(#nexforge-grad-primary)" />
        {/* Center diamond */}
        <rect
          x="17"
          y="17"
          width="6"
          height="6"
          rx="1"
          transform="rotate(45 20 20)"
          fill="url(#nexforge-grad-secondary)"
        />
        {/* Corner sparks */}
        <circle cx="20" cy="13" r="1.5" fill="#22d3ee" opacity="0.9" />
        <circle cx="27" cy="20" r="1.5" fill="#6366f1" opacity="0.9" />
        <circle cx="20" cy="27" r="1.5" fill="#22d3ee" opacity="0.9" />
        <circle cx="13" cy="20" r="1.5" fill="#a855f7" opacity="0.9" />
      </g>
    </svg>
    {showText && (
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: size > 24 ? '18px' : '15px',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #fafafa 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Nexforge
      </span>
    )}
  </div>
);

export default NexforgeLogo;
