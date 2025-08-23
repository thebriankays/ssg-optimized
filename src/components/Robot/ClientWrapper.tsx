'use client'

import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./Robot'), {
  ssr: false,
  loading: () => null,
})

export default function ClientWrapper() {
  return <Scene />
}