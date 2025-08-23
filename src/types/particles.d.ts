declare global {
  interface Window {
    particlesJS: (elementId: string, config: object) => void
    pJSDom?: Array<{ pJS: { particles: { nb: number } } }>
  }
}

export {}
