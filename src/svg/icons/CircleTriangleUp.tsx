'use client'

import React from 'react'

interface CircleTriangleUpProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  width?: number
  height?: number
  color?: string
  'data-speed'?: string
}

const CircleTriangleUp = React.forwardRef<SVGSVGElement, CircleTriangleUpProps>(
  function CircleTriangleUpBase(
    {
      className = '',
      width = 800,
      height = 800,
      color = 'rgba(0, 0, 0, 0.7)',
      'data-speed': dataSpeed,
      ...rest
    },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={width}
        height={height}
        className={className}
        data-speed={dataSpeed}
        {...rest}
      >
        {/* Outer circle */}
        <path
          id="circle1"
          d="M16,1A15,15,0,1,1,1,16,15,15,0,0,1,16,1m0-1A16,16,0,1,0,32,16,16,16,0,0,0,16,0Z"
          fill={color}
        />
        {/* Inner circle */}
        <path
          id="circle2"
          d="M16,6.5A9.5,9.5,0,1,1,6.5,16,9.51,9.51,0,0,1,16,6.5m0-1A10.5,10.5,0,1,0,26.5,16,10.5,10.5,0,0,0,16,5.5Z"
          fill={color}
        />
        {/* Triangle - fixed to match original */}
        <path
          id="triangle"
          d="M16,13.73l2.44,4.77H13.56L16,13.73m0-3.23a.51.51,0,0,0-.46.31l-4.46,8.7c-.22.43,0,1,.46,1h8.92c.42,0,.68-.56.46-1l-4.46-8.7A.51.51,0,0,0,16,10.5Z"
          fill={color}
        />
      </svg>
    )
  },
)

export default CircleTriangleUp
