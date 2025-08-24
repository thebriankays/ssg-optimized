'use client'
import React, { useState, useRef } from 'react'
import { gsap, useGSAP } from '@/gsap'
import { useRevealAnimation } from '@/hooks/useScrollTrigger'
import Image from 'next/image'
import CircleTriangleUp from '@/svg/icons/CircleTriangleUp'
import ParticleEffectButton from '../ParticleEffectButton/ParticleEffectButton'

export interface SplashSectionProps {
  id: string
  background: {
    type: 'video' | 'image'
    src: string
    alt?: string
    dataSpeed?: number
  }
  title?: string
  titleSubtext?: string
  paragraph?: string
  cta?: {
    text: string
    href: string
  }
  textPosition: 'left' | 'center' | 'right'
  animationDirection?: 'left' | 'right'
  overlayType?: 'uv' | 'ho' | 'me' | 'so' | 'sa' | 'none'
  showFrost?: boolean
  showStripes?: boolean
  showBottomGradient?: boolean
  bubblesType?: 'none' | 'uv' | 'ho' | 'me' | 'so' | 'sa'
  showLogo?: boolean
  logoConfig?: {
    position?: 'left' | 'right' | 'center'
    size?: number
    color?: string
    speed?: number
  }
  className?: string
  isHero?: boolean
}

const blurDataURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYGWMAAQAABQABDQottAAAAABJRU5ErkJggg=='

const SplashSection: React.FC<SplashSectionProps> = (props) => {
  const {
    id,
    background,
    title,
    titleSubtext,
    paragraph,
    cta,
    textPosition = 'left',
    animationDirection = 'left',
    overlayType = 'none',
    showFrost = false,
    showStripes = false,
    showBottomGradient = false,
    bubblesType = 'none',
    showLogo = false,
    logoConfig = {
      position: 'right',
      size: 200,
      color: 'rgba(0,0,0,0.7)',
      speed: 0.5,
    },
    className = '',
    isHero = false,
  } = props

  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLImageElement | HTMLVideoElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLSpanElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)
  const frostBoxRef = useRef<HTMLDivElement>(null)
  const stripeBoxRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const bubblesContainerRef = useRef<HTMLDivElement>(null)

  const [buttonHidden, setButtonHidden] = useState(false)
  const [buttonAnimating, setButtonAnimating] = useState(false)

  const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (buttonAnimating) return

    setButtonHidden(true)
    setButtonAnimating(true)

    if (cta?.href) {
      setTimeout(() => {
        window.location.href = cta.href
      }, 3000)
    }
  }

  const handleAnimationComplete = () => {
    setButtonAnimating(false)
    setTimeout(() => setButtonHidden(false), 1000)
  }

  const renderBubbles = () => {
    if (bubblesType === 'none') return null

    if (bubblesType === 'ho') {
      return (
        <div ref={bubblesContainerRef} className="bubbles-container">
          <div className="bubble s5 t4 l3 b4 bb3 c1a" data-speed="1"></div>
          <div className="bubble s3 t2 l8 b5 bb4 c1a" data-speed="1.4"></div>
          <div className="bubble s4 t5 l0 b5 bb4 c1a" data-speed="0.4"></div>
        </div>
      )
    }

    return (
      <div ref={bubblesContainerRef} className="bubbles-container">
        <div className="bubble s7 t2 l0 b4 bb2 c1a" data-speed="0.5"></div>
        <div className="bubble s6 t7 l5 b4 bb4 c1a" data-speed="2.8"></div>
        <div className="bubble s5 t6 l4 b4 bb3 c1a" data-speed="1.7"></div>
        <div className="bubble s3 t3 l6 b2 bb2 c1a" data-speed="1.8"></div>
        <div className="bubble s3 t8 l8 b3 bb2 c1a" data-speed="3"></div>
        <div className="bubble s4 t6 l2 b3 bb1 c1a" data-speed="0.9"></div>
        <div className="bubble s2 t3 l2 b2 bb4 c1a" data-speed="2"></div>
        <div className="bubble s2 t4 l9 b1 bb3 c1a" data-speed="1.4"></div>
        <div className="bubble s1 t5 l4 b2 bb4 c1a" data-speed="1.6"></div>
      </div>
    )
  }

  // Hero animation with ScrollTrigger
  useRevealAnimation(
    sectionRef.current,
    () => {
      if (!isHero || !sectionRef.current) return gsap.timeline()

      const heroTimeline = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 2 },
      })

      // Set initial state immediately
      if (bgRef.current) {
        gsap.set(bgRef.current, {
          clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
          opacity: 0,
          filter: 'blur(100px)',
        })
      }

      // Add callback
      heroTimeline.eventCallback('onStart', () => {
        console.log('SplashSection hero animation started')
      })

      if (bgRef.current) {
        heroTimeline.to(
          bgRef.current,
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            opacity: 1,
            filter: 'blur(0)',
            duration: 2,
          },
        )
      }

      if (titleRef.current) {
        heroTimeline.fromTo(
          titleRef.current,
          { opacity: 0, x: -1000 },
          { opacity: 1, x: 0, duration: 2 },
          '-=2',
        )
      }

      if (subRef.current) {
        heroTimeline.fromTo(
          subRef.current,
          { opacity: 0, x: -1500 },
          { opacity: 1, x: 0, duration: 2 },
          '-=2',
        )
      }

      if (overlayRef.current) {
        heroTimeline.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 2 },
          '-=1.5',
        )
      }

      if (logoRef.current) {
        heroTimeline.fromTo(
          logoRef.current,
          {
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
            opacity: 0,
            y: 242,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            opacity: 0.7,
            y: 0,
            duration: 3,
          },
          '-=2',
        )
      }

      return heroTimeline
    },
    {
      start: 'top center',
      once: true,
      id: `${id}-hero-scrollTrigger`,
    },
    [isHero, id]
  )

  // Background animation for non-hero sections
  useRevealAnimation(
    sectionRef.current,
    () => {
      if (isHero || !sectionRef.current || !bgRef.current) return gsap.timeline()

      const bgTimeline = gsap.timeline()

      bgTimeline.fromTo(
        bgRef.current,
        {
          clipPath:
            animationDirection === 'left'
              ? 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
              : 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
          opacity: 0,
          filter: 'blur(32px)',
        },
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          opacity: 1,
          filter: 'blur(0)',
          duration: 2,
          ease: 'power2.inOut',
        },
      )

      return bgTimeline
    },
    {
      start: 'top 88%',
      once: false,
      toggleActions: 'restart none reverse none',
      id: `${id}-bg-scrollTrigger`,
    },
    [isHero, animationDirection, id]
  )

  // Content animation for non-hero sections
  useRevealAnimation(
    sectionRef.current,
    () => {
      if (isHero || !sectionRef.current) return gsap.timeline()

      const contentTimeline = gsap.timeline()

      if (titleRef.current) {
        contentTimeline.fromTo(
          titleRef.current,
          {
            opacity: 0,
            x: animationDirection === 'left' ? -300 : 300,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1.5,
            ease: 'power2.out',
          },
        )
      }

      if (subRef.current) {
        contentTimeline.fromTo(
          subRef.current,
          {
            opacity: 0,
            x: animationDirection === 'left' ? -400 : 400,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1.5,
            ease: 'power2.out',
          },
          '-=1.2',
        )
      }

      if (paragraphRef.current) {
        contentTimeline.fromTo(
          paragraphRef.current,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
          },
          '-=0.8',
        )
      }

      if (ctaRef.current) {
        contentTimeline.fromTo(
          ctaRef.current,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.5',
        )
      }

      return contentTimeline
    },
    {
      start: 'top 80%',
      once: false,
      toggleActions: 'restart none reverse none',
      id: `${id}-content-scrollTrigger`,
    },
    [isHero, animationDirection, id]
  )

  // Parallax and other non-ScrollTrigger animations
  useGSAP(
    () => {
      if (typeof window === 'undefined' || !sectionRef.current) return

      // Add any additional animations here that don't use ScrollTrigger
    },
    { scope: sectionRef, dependencies: [id] },
  )

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`splash-section-${id} ${className} ${isHero ? 's-1' : textPosition === 'right' ? 's-3' : 's-2'}`}
    >
      {background.type === 'video' ? (
        <video
          ref={bgRef as React.RefObject<HTMLVideoElement>}
          src={background.src}
          muted
          loop
          autoPlay
          playsInline
          className="section-bg clip"
          data-speed={background.dataSpeed || 0.3}
        />
      ) : (
        <Image
          ref={bgRef as React.RefObject<HTMLImageElement>}
          src={background.src}
          alt={background.alt || ''}
          fill
          sizes="100vw"
          className="section-bg clip"
          data-speed={background.dataSpeed || 0.3}
          style={{ objectFit: 'cover' }}
          placeholder="blur"
          blurDataURL={blurDataURL}
          priority={isHero}
        />
      )}

      {showBottomGradient && <div ref={overlayRef} className="splash-overlay"></div>}

      {showFrost && (
        <div ref={frostBoxRef} className={`frost-box ${overlayType}`}>
          <div className="bb2"></div>
          <div></div>
          <div className="bb1"></div>
          <div></div>
          <div className="bb4"></div>
        </div>
      )}

      {showStripes && (
        <div ref={stripeBoxRef} className={`stripe-box ${overlayType}`} data-speed="0.3"></div>
      )}

      {renderBubbles()}

      {showLogo && isHero ? (
        <div className="hero-logo-container">
          <CircleTriangleUp
            ref={logoRef}
            width={logoConfig.size || 400}
            height={logoConfig.size || 400}
            color={logoConfig.color || 'rgba(0,0,0,0.7)'}
            className="main-logo"
            data-speed="0.7"
          />
        </div>
      ) : showLogo ? (
        <CircleTriangleUp
          ref={logoRef}
          width={logoConfig.size || 200}
          height={logoConfig.size || 200}
          color={logoConfig.color || 'rgba(0,0,0,0.7)'}
          className={`logo-sections s8 t4 ${logoConfig.position === 'left' ? 'l0' : 'l7'} b1`}
          data-speed={String(logoConfig.speed || '0.5')}
        />
      ) : null}

      <div className={`content-wrapper ${textPosition}`}>
        {title && (
          <h1
            ref={titleRef}
            className={`${isHero ? 'splash-hero-title' : 'splash-title'} ${
              textPosition === 'right'
                ? 'text-right'
                : textPosition === 'center'
                  ? 'text-center'
                  : ''
            } h-lag`}
          >
            {title}
            {isHero && titleSubtext && (
              <span ref={subRef} className="splash-title-sub">
                {titleSubtext}
              </span>
            )}
          </h1>
        )}

        {!isHero && (paragraph || cta) && (
          <div className="p-box">
            {paragraph && (
              <p ref={paragraphRef} className="splash-paragraph p-lag">
                {paragraph}
              </p>
            )}

            {cta && (
              <div className="button-wrapper">
                <ParticleEffectButton
                  hidden={buttonHidden}
                  onComplete={handleAnimationComplete}
                  color="#fff"
                  duration={1300}
                  easing="easeInExpo"
                  size={3}
                  speed={1}
                  particlesAmountCoefficient={10}
                  oscillationCoefficient={1}
                >
                  <a
                    ref={ctaRef}
                    href={cta.href}
                    className="splash-btn splash-cta"
                    onClick={handleButtonClick}
                  >
                    {cta.text}
                  </a>
                </ParticleEffectButton>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default SplashSection