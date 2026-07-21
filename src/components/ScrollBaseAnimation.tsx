import { cn } from '@/lib/utils'
import { wrap } from '@motionone/utils'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useEffect, useRef } from 'react'

const COPY_COUNT = 4

interface ScrollBaseAnimationProps {
  children: string
  baseVelocity?: number
  className?: string
  scrollDependent?: boolean
  delay?: number
  /** Decorative marquees can opt out of the reduced-motion static fallback */
  alwaysAnimate?: boolean
  /** Which way the text travels across the screen */
  direction?: 'left' | 'right'
}

export default function ScrollBaseAnimation({
  children,
  baseVelocity = -5,
  className,
  scrollDependent = false,
  delay = 0,
  alwaysAnimate = false,
  direction = 'left',
}: ScrollBaseAnimationProps) {
  const reduceMotion = useReducedMotion()
  const shouldAnimate = alwaysAnimate || !reduceMotion
  const signedVelocity =
    direction === 'right' ? Math.abs(baseVelocity) : -Math.abs(baseVelocity)
  const initialOffset = direction === 'left' ? 0 : -50
  const baseX = useMotionValue(initialOffset)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
    clamp: false,
  })

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)

  const directionFactor = useRef<number>(1)
  const hasStarted = useRef(false)

  const textClassName = cn(
    'block shrink-0 whitespace-nowrap leading-none text-[14vw] sm:text-[11vw] md:text-[9vw] lg:text-[7rem]',
    className,
  )

  const copies = Array.from({ length: COPY_COUNT * 2 }, (_, index) => index)

  useEffect(() => {
    const timer = setTimeout(() => {
      hasStarted.current = true
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useAnimationFrame((_, delta) => {
    if (!shouldAnimate || !hasStarted.current) return

    let moveBy = directionFactor.current * signedVelocity * (delta / 1000)

    if (scrollDependent) {
      if (velocityFactor.get() < 0) {
        directionFactor.current = -1
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1
      }
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get()

    baseX.set(baseX.get() + moveBy)
  })

  if (!shouldAnimate) {
    return (
      <div className="marquee-fog mx-auto w-full max-w-6xl overflow-hidden whitespace-nowrap px-6">
        <span className={textClassName}>{children}</span>
      </div>
    )
  }

  return (
    <div className="marquee-fog mx-auto w-full max-w-6xl overflow-hidden whitespace-nowrap px-6">
      <motion.div
        className="flex w-max flex-nowrap items-center gap-10 whitespace-nowrap"
        style={{ x }}
      >
        {copies.map((index) => (
          <span className={textClassName} key={index}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
