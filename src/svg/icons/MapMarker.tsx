import React from 'react'

interface MapMarkerProps {
  className?: string
  size?: number
  color?: string
}

const MapMarker: React.FC<MapMarkerProps> = ({
  className = '',
  size = 36,
  color = 'currentColor',
}) => {
  return (
    <svg viewBox="-4 0 36 36" width={size} height={size} className={className}>
      <path
        fill={color}
        d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"
      />
      <circle fill="black" cx="14" cy="14" r="7" />
    </svg>
  )
}

export default MapMarker
