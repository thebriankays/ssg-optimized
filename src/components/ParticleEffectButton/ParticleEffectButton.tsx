'use client'

import React from 'react'
import raf from 'raf'
import { cn } from '@/utilities/ui'
import './ParticleEffectButton.scss'
import { AnimeInstance } from 'animejs'
import anime from 'animejs'

/**
 * Helper: random offset
 */
function rand(value: number): number {
  return Math.random() * value - value / 2
}

/**
 * Helper: check if something is a function
 */
function isFunc<T>(value: T | (() => T)): value is () => T {
  return typeof value === 'function'
}

/**
 * Particle definition
 */
interface Particle {
  startX: number
  startY: number
  x: number
  y: number
  angle: number
  counter: number
  increase: number
  life: number
  death: number
  speed: number
  size: number
}

/**
 * Button statuses
 */
type ParticleStatus = 'hidden' | 'normal' | 'hiding' | 'showing'

/**
 * Props to match the original react-particle-effect-button
 */
export interface ParticleEffectButtonProps {
  hidden?: boolean // whether the button is hidden
  children?: React.ReactNode // button content
  className?: string // extra classes on the outer container
  duration?: number // animation duration
  easing?: string | number[] // anime.js easing
  type?: 'circle' | 'rectangle' | 'triangle' // shape of particles
  style?: 'fill' | 'stroke' // fill or stroke
  direction?: 'left' | 'right' | 'top' | 'bottom' // direction of movement
  canvasPadding?: number // extra padding around the canvas
  size?: number | (() => number) // size of particles
  speed?: number | (() => number) // speed of particles
  color?: string // color of the particles
  particlesAmountCoefficient?: number // multiplier for the number of particles
  oscillationCoefficient?: number // multiplier for the wave-like motion
  onBegin?: () => void // callback when an animation begins
  onComplete?: () => void // callback when an animation completes
}

/**
 * Internal state
 */
interface ParticleEffectButtonState {
  status: ParticleStatus
  progress: number // from 0 to 100
}

export default class ParticleEffectButton extends React.Component<
  ParticleEffectButtonProps,
  ParticleEffectButtonState
> {
  static defaultProps: Partial<ParticleEffectButtonProps> = {
    hidden: false,
    duration: 1000,
    easing: 'easeInOutCubic',
    type: 'circle',
    style: 'fill',
    direction: 'left',
    canvasPadding: 150,
    size: () => Math.floor(Math.random() * 3 + 1),
    speed: () => rand(4),
    color: '#000',
    particlesAmountCoefficient: 3,
    oscillationCoefficient: 20,
    onBegin: () => {},
    onComplete: () => {},
  }

  public override state: ParticleEffectButtonState = {
    status: this.props.hidden ? 'hidden' : 'normal',
    progress: 0,
  }

  private _canvas: HTMLCanvasElement | null = null
  private _ctx: CanvasRenderingContext2D | null = null
  private _wrapper: HTMLDivElement | null = null
  private _raf: number | null = null
  private _particles: Particle[] = []
  private _rect = { width: 0, height: 0 }
  private _progress = 0

  public override componentDidUpdate(prevProps: ParticleEffectButtonProps): void {
    // React 18+ recommended: handle prop changes in componentDidUpdate
    if (prevProps.hidden !== this.props.hidden) {
      const { status } = this.state
      const isNowHidden = this.props.hidden

      if (status === 'normal' && isNowHidden) {
        this.setState({ status: 'hiding' }, this._startAnimation)
      } else if (status === 'hidden' && !isNowHidden) {
        this.setState({ status: 'showing' }, this._startAnimation)
      }
      // else if (status === 'hiding' && !isNowHidden) { ... } // advanced partial transitions
      // else if (status === 'showing' && isNowHidden) { ... } // advanced partial transitions
    }
  }

  public override componentWillUnmount(): void {
    // cancel any leftover raf
    if (this._raf) {
      raf.cancel(this._raf)
      this._raf = null
    }
  }

  public override render(): React.ReactNode {
    const { children, className, direction } = this.props
    const { status, progress } = this.state

    // We'll transform the wrapper and content
    const wrapperStyles: React.CSSProperties = {}
    const contentStyles: React.CSSProperties = {}
    const canvasStyles: React.CSSProperties = {}

    if (status === 'hiding' || status === 'showing') {
      const isHorizontal = this._isHorizontal()
      const prop = isHorizontal ? 'translateX' : 'translateY'
      const size = isHorizontal ? this._rect.width : this._rect.height

      // direction 'left' or 'top' => +progress, else -progress
      const sign = direction === 'left' || direction === 'top' ? 1 : -1
      const px = Math.ceil((size * progress * sign) / 100)

      wrapperStyles.transform = `${prop}(${px}px)`
      contentStyles.transform = `${prop}(${-px}px)`
    } else if (status === 'hidden') {
      // fully hidden
      wrapperStyles.visibility = 'hidden'
      canvasStyles.visibility = 'hidden'
    } else if (status === 'normal') {
      // normal => show content, hide canvas
      canvasStyles.visibility = 'hidden'
    }

    return (
      <div className={cn('particleEffectButton-particles', className)}>
        <div
          className="particleEffectButton-wrapper"
          style={wrapperStyles}
          ref={(el) => {
            this._wrapper = el
          }}
        >
          <div className="particleEffectButton-content" style={contentStyles}>
            {children}
          </div>
        </div>

        <canvas
          className="particleEffectButton-canvas"
          style={canvasStyles}
          ref={(el) => {
            this._canvas = el
          }}
        />
      </div>
    )
  }

  private _startAnimation = (): void => {
    if (!this._canvas || !this._wrapper) return

    const { duration, easing, canvasPadding, onBegin } = this.props
    const { status } = this.state

    // For 'hiding', we go 0->100; for 'showing', 100->0
    this._progress = status === 'hiding' ? 0 : 1

    // Clear any previous particles
    this._particles = []

    // Size the canvas
    this._rect = this._wrapper.getBoundingClientRect()
    this._canvas.width = this._rect.width + (canvasPadding ?? 150) * 2
    this._canvas.height = this._rect.height + (canvasPadding ?? 150) * 2
    this._ctx = this._canvas.getContext('2d')

    anime({
      targets: { value: status === 'hiding' ? 0 : 100 },
      value: status === 'hiding' ? 100 : 0,
      duration: duration!,
      easing: easing as string,
      begin: onBegin,
      update: (anim: AnimeInstance) => {
        // We stored { value: number } in targets
        const first = anim.animatables[0]
        if (!first) return

        const targetObj = first.target as { value?: number }
        if (typeof targetObj.value !== 'number') return

        const val = targetObj.value
        this.setState({ progress: val })

        // Add new particles along the way
        if (duration) {
          this._addParticles(val / 100)
        }
      },
      complete: () => {
        // The raf loop below will handle finishing out the particles
      },
    })
  }

  private _cycleStatus(): void {
    const { status } = this.state
    if (status === 'normal') {
      this.setState({ status: 'hiding' })
    } else if (status === 'hidden') {
      this.setState({ status: 'showing' })
    } else if (status === 'hiding') {
      this.setState({ status: 'hidden' })
    } else if (status === 'showing') {
      this.setState({ status: 'normal' })
    }
  }

  private _loop = (): void => {
    this._updateParticles()
    this._renderParticles()

    if (this._particles.length > 0) {
      this._raf = raf(this._loop)
    } else {
      this._raf = null
      // All done => finalize
      this._cycleStatus()
      this.props.onComplete?.()
    }
  }

  private _addParticles(progress: number): void {
    const { canvasPadding, direction, particlesAmountCoefficient } = this.props
    const { status } = this.state
    const { width, height } = this._rect

    // how far we've moved from the last progress
    const delta = status === 'hiding' ? progress - this._progress : this._progress - progress

    const isHorizontal = this._isHorizontal()
    // shift: bigger range if we are hiding vs showing
    const progressValue =
      (isHorizontal ? width : height) * progress + delta * (status === 'hiding' ? 100 : 220)

    // update stored progress
    this._progress = progress

    let x = canvasPadding ?? 150
    let y = canvasPadding ?? 150

    if (isHorizontal) {
      x += direction === 'left' ? progressValue : width - progressValue
    } else {
      y += direction === 'top' ? progressValue : height - progressValue
    }

    // number of new particles
    let count = Math.floor((particlesAmountCoefficient ?? 3) * (delta * 100 + 1))
    if (count > 0) {
      while (count--) {
        this._addParticle({
          x: x + (isHorizontal ? 0 : width * Math.random()),
          y: y + (isHorizontal ? height * Math.random() : 0),
        })
      }
    }

    // start the raf if not already
    if (!this._raf) {
      this._raf = raf(this._loop)
    }
  }

  private _addParticle(opts: { x: number; y: number }): void {
    const { duration, size, speed } = this.props
    const { status } = this.state

    const frames = (duration! * 60) / 1000
    const _speed = isFunc(speed!) ? speed!() : speed!
    const _size = isFunc(size!) ? size!() : size!

    this._particles.push({
      startX: opts.x,
      startY: opts.y,
      x: status === 'hiding' ? 0 : _speed * -frames,
      y: 0,
      angle: rand(360),
      counter: status === 'hiding' ? 0 : frames,
      increase: (Math.PI * 2) / 100,
      life: 0,
      death: status === 'hiding' ? frames - 20 + Math.random() * 40 : frames,
      speed: _speed,
      size: _size,
    })
  }

  private _updateParticles(): void {
    const { oscillationCoefficient } = this.props
    const { status } = this.state

    // iterate backwards if removing
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i]
      if (!p) continue

      if (p.life > p.death) {
        this._particles.splice(i, 1)
      } else {
        p.x += p.speed
        p.y = (oscillationCoefficient ?? 20) * Math.sin(p.counter * p.increase)
        p.life++
        // move counter forward or backward
        p.counter += status === 'hiding' ? 1 : -1
      }
    }
  }

  private _renderParticles(): void {
    const { color, type, style } = this.props
    const { status } = this.state

    if (!this._ctx || !this._canvas) return

    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
    this._ctx.fillStyle = color ?? '#000'
    this._ctx.strokeStyle = color ?? '#000'

    for (const p of this._particles) {
      if (!p) continue
      if (p.life < p.death) {
        this._ctx.translate(p.startX, p.startY)
        this._ctx.rotate((p.angle * Math.PI) / 180)

        // fade in/out
        const alpha = status === 'hiding' ? 1 - p.life / p.death : p.life / p.death
        this._ctx.globalAlpha = alpha

        this._ctx.beginPath()

        if (type === 'circle') {
          this._ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI)
        } else if (type === 'triangle') {
          this._ctx.moveTo(p.x, p.y)
          this._ctx.lineTo(p.x + p.size, p.y + p.size)
          this._ctx.lineTo(p.x + p.size, p.y - p.size)
        } else if (type === 'rectangle') {
          this._ctx.rect(p.x, p.y, p.size, p.size)
        }

        if (style === 'fill') {
          this._ctx.fill()
        } else {
          this._ctx.closePath()
          this._ctx.stroke()
        }

        // reset transforms
        this._ctx.globalAlpha = 1
        this._ctx.rotate(-(p.angle * Math.PI) / 180)
        this._ctx.translate(-p.startX, -p.startY)
      }
    }
  }

  private _isHorizontal(): boolean {
    return this.props.direction === 'left' || this.props.direction === 'right'
  }
}