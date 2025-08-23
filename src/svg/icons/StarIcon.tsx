// src/svg/icons/StarIcon.tsx
import React from 'react'
import type { SVGProps } from 'react'

interface StarIconProps extends SVGProps<SVGSVGElement> {
  size?: number
  title?: string
}

const StarIcon: React.FC<StarIconProps> = ({
  size = 24,
  title,
  width = size,
  height = size,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={!title}
    role={title ? 'img' : 'presentation'}
    {...props}
  >
    {title && <title>{title}</title>}
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      fill="currentColor"
    />
  </svg>
)

StarIcon.displayName = 'StarIcon'

export default StarIcon
