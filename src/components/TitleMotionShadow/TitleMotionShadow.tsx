import { Paytone_One } from 'next/font/google'
import React from 'react'

export const paytoneOne = Paytone_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

interface TitleShadowMotionProps {
  text: string
  textColor?: string
  shadowColor?: string
  shadowOpacity?: number
  className?: string
}

const TitleShadowMotion: React.FC<TitleShadowMotionProps> = ({
  text,
  textColor = '#ffffff',
  shadowColor = '#000000',
  shadowOpacity = 0.3,
  className = '',
}) => {
  return (
    <h2 
      className={`text-4xl lg:text-5xl font-bold ${paytoneOne.className} ${className}`}
      style={{
        color: textColor,
        textShadow: `2px 2px 4px ${shadowColor}${Math.round(shadowOpacity * 255).toString(16).padStart(2, '0')}`,
      }}
    >
      {text}
    </h2>
  )
}

export default TitleShadowMotion
