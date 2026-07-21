import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Check,
  GripVertical,
  Layers3,
  MessageCircle,
  Minus,
  MoveRight,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import { createSwapy } from 'swapy'
import ikemdeLogo from './assets/ikemde-logo.png'
import HeroOrbit from './components/HeroOrbit'
import ScrollBaseAnimation from './components/ScrollBaseAnimation'
import { supabase } from './lib/supabase'

type ButtonProps = {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'outline' | 'secondary'
  className?: string
  disabled?: boolean
}

function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  disabled = false,
}: ButtonProps) {
  const reduceMotion = useReducedMotion()
  const styles =
    variant === 'primary'
      ? 'bg-stone-950 text-white hover:bg-stone-800'
      : variant === 'outline'
        ? 'border border-stone-950 bg-white text-stone-950 hover:bg-stone-50'
        : 'border border-stone-200 bg-white text-stone-900 hover:bg-stone-50'
  const classes = `press-feedback inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950 disabled:pointer-events-none disabled:opacity-60 ${styles} ${className}`

  if (href) {
    const isHash = href.startsWith('#')
    return (
      <a
        className={classes}
        href={href}
        onClick={
          isHash
            ? (event) => {
                event.preventDefault()
                scrollToSection(href.slice(1), reduceMotion)
              }
            : undefined
        }
      >
        {children}
      </a>
    )
  }

  return (
    <button className={classes} disabled={disabled} type="submit">
      {children}
    </button>
  )
}

function LogoMark({ className = '' }: { className?: string }) {
  return (
    <img
      className={`shrink-0 rounded-[22%] object-cover ${className}`}
      src={ikemdeLogo}
      alt=""
    />
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion()

  return (
    <a
      className={
        compact
          ? 'press-feedback inline-flex shrink-0 items-center justify-center rounded-full p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950'
          : 'press-feedback inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full border border-stone-200/80 bg-white p-1.5 shadow-lg shadow-stone-950/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950 sm:py-2 sm:pl-2 sm:pr-4'
      }
      href="#top"
      aria-label="Ikemde home"
      onClick={(event) => {
        event.preventDefault()
        scrollToSection('top', reduceMotion)
      }}
    >
      <LogoMark
        className={
          compact
            ? 'size-8 shadow-sm ring-1 ring-stone-950/10 sm:size-9'
            : 'size-9 shadow-sm ring-1 ring-stone-950/10'
        }
      />
      {!compact ? (
        <span className="hidden font-brand text-lg font-medium tracking-[-0.02em] text-stone-950 sm:inline">
          Ikemde
        </span>
      ) : (
        <span className="ml-1.5 hidden font-brand text-base font-medium tracking-[-0.02em] text-stone-950 sm:inline">
          Ikemde
        </span>
      )}
    </a>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold tracking-[0.04em] text-stone-500 sm:mb-4 sm:text-sm sm:tracking-normal">
      {children}
    </p>
  )
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 28, filter: 'blur(8px)' }
      }
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.18, margin: '0px 0px -12% 0px' }}
      transition={{
        duration: reduceMotion ? 0 : 0.65,
        delay: reduceMotion ? 0 : delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

function SectionTransition({
  children,
  className = '',
  id,
  as = 'section',
  ...rest
}: {
  children: ReactNode
  className?: string
  id?: string
  as?: 'section' | 'footer'
} & Record<string, unknown>) {
  const reduceMotion = useReducedMotion()
  const motionProps = {
    className,
    id,
    initial: reduceMotion ? false : { opacity: 0.72, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: {
      duration: reduceMotion ? 0 : 0.7,
      ease: [0.23, 1, 0.32, 1] as const,
    },
    ...rest,
  }

  if (as === 'footer') {
    return <motion.footer {...motionProps}>{children}</motion.footer>
  }

  return <motion.section {...motionProps}>{children}</motion.section>
}

function scrollToSection(id: string, reduceMotion: boolean | null) {
  const el = document.getElementById(id)
  if (!el) return

  const top = el.getBoundingClientRect().top + window.scrollY - 8
  window.scrollTo({
    top,
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
  history.replaceState(null, '', `#${id}`)
}

const DOCK_SECTIONS = [
  { id: 'top', label: 'Home', shortLabel: 'Home' },
  { id: 'why', label: 'Why', shortLabel: 'Why' },
  { id: 'sanctuary', label: 'Sanctuary', shortLabel: 'Space' },
  { id: 'questions', label: 'Questions', shortLabel: 'FAQ' },
  { id: 'waitlist', label: 'Join', shortLabel: 'Join' },
] as const

function useActiveSection(sectionIds: readonly string[]) {
  const [active, setActive] = useState(sectionIds[0])

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]?.target.id) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.2, 0.5, 0.8] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [sectionIds])

  return active
}

function CustomCursor() {
  const dotX = useMotionValue(-20)
  const dotY = useMotionValue(-20)
  const ringTargetX = useMotionValue(-20)
  const ringTargetY = useMotionValue(-20)
  const ringX = useSpring(ringTargetX, {
    stiffness: 700,
    damping: 45,
    mass: 0.2,
  })
  const ringY = useSpring(ringTargetY, {
    stiffness: 700,
    damping: 45,
    mass: 0.2,
  })
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [pressed, setPressed] = useState(false)
  const interactiveRef = useRef(false)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!finePointer.matches) return

    setEnabled(true)
    document.documentElement.classList.add('custom-cursor')

    const onPointerMove = (event: PointerEvent) => {
      dotX.set(event.clientX - 2.5)
      dotY.set(event.clientY - 2.5)
      ringTargetX.set(event.clientX - 15)
      ringTargetY.set(event.clientY - 15)
      setVisible(true)

      const isInteractive = Boolean(
        (event.target as Element | null)?.closest(
          'a, button, input, textarea, select, [role="button"], [data-swapy-handle]',
        ),
      )

      if (interactiveRef.current !== isInteractive) {
        interactiveRef.current = isInteractive
        setInteractive(isInteractive)
      }
    }

    const onPointerDown = () => setPressed(true)
    const onPointerUp = () => setPressed(false)
    const onPointerLeave = () => setVisible(false)

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    document.documentElement.addEventListener('mouseleave', onPointerLeave)

    return () => {
      document.documentElement.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [dotX, dotY, ringTargetX, ringTargetY])

  if (!enabled) return null

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] size-[30px] rounded-full border border-stone-950/35 bg-white/10 backdrop-blur-[1px]"
        animate={{
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.78 : interactive ? 1.45 : 1,
        }}
        style={{ x: ringX, y: ringY }}
        transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[101] size-[5px] rounded-full bg-stone-950"
        animate={{ opacity: visible ? 1 : 0, scale: pressed ? 0.7 : 1 }}
        style={{ x: dotX, y: dotY }}
        transition={{ duration: 0.12 }}
      />
    </>
  )
}

function DockNav() {
  const active = useActiveSection(DOCK_SECTIONS.map((section) => section.id))
  const reduceMotion = useReducedMotion()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
      aria-label="Page sections"
    >
      <div className="flex w-full max-w-sm items-stretch gap-0.5 rounded-full border border-stone-200 bg-white p-1 shadow-xl shadow-stone-950/10 sm:w-auto sm:max-w-none sm:items-center sm:gap-1 sm:p-1.5">
        <div className="flex flex-1 items-center justify-center sm:flex-none">
          <Brand compact />
        </div>
        {DOCK_SECTIONS.map((section) => {
          const isActive = active === section.id
          return (
            <a
              key={section.id}
              className="press-feedback relative flex flex-1 items-center justify-center rounded-full px-1 py-2 text-center text-[10px] font-medium text-stone-600 sm:flex-none sm:px-4 sm:py-2.5 sm:text-sm"
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault()
                scrollToSection(section.id, reduceMotion)
              }}
            >
              {isActive && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-stone-950"
                  layoutId="dock-active"
                  transition={{
                    type: 'spring',
                    bounce: 0,
                    duration: reduceMotion ? 0 : 0.35,
                  }}
                />
              )}
              <span
                className={`relative z-10 ${isActive ? 'text-white' : ''}`}
              >
                <span className="sm:hidden">{section.shortLabel}</span>
                <span className="hidden sm:inline">{section.label}</span>
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section
      className="relative isolate mx-auto min-h-[34rem] max-w-6xl overflow-hidden px-4 sm:min-h-[40rem] sm:px-8 md:min-h-[44rem] lg:min-h-[calc(100svh-5rem)] lg:px-12"
      id="top"
    >
      <HeroOrbit />
      <div className="relative z-10 mx-auto flex min-h-[34rem] max-w-2xl flex-col items-center justify-end px-1 pb-24 pt-[12rem] text-center sm:min-h-[40rem] sm:justify-center sm:pb-24 sm:pt-40 md:min-h-[44rem] md:pt-44 lg:min-h-[calc(100svh-5rem)] lg:px-0 lg:pt-44">
        <Reveal className="flex w-full flex-col items-center">
          <SectionLabel>Clarity for curious minds</SectionLabel>
          <h1 className="font-brand text-[1.875rem] font-medium leading-[1.06] tracking-[-0.035em] text-stone-950 min-[400px]:text-[2.125rem] sm:text-[2.5rem] sm:leading-[1.02] md:text-5xl lg:text-[3.5rem]">
            Too many things you could do. One clear thing to do next
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-stone-600 sm:mt-6 sm:text-base sm:leading-7">
            Ikemde turns your interests, unfinished ideas, and real obligations
            into a priority you can act on—without asking you to become a
            one-track person.
          </p>
          <div className="mt-6 w-full sm:mt-8 sm:w-auto">
            <Button className="w-full shadow-lg shadow-stone-950/15 sm:w-auto" href="#waitlist">
              Find my next move
            </Button>
          </div>
          <div className="mt-6 flex flex-col items-center gap-2 text-[10px] font-medium text-stone-500 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:gap-x-4 sm:mt-8 sm:gap-x-5 sm:text-xs">
            <span>Keep every interest</span>
            <span className="hidden min-[400px]:inline text-stone-300">•</span>
            <span>Context before tasks</span>
            <span className="hidden min-[400px]:inline text-stone-300">•</span>
            <span>One clear next move</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

type PriorityItem = {
  id: string
  label: string
  tag: string
  tagClass: string
  reason: string
  done: boolean
  secondary?: boolean
}

const defaultItems: PriorityItem[] = [
  {
    id: 'portfolio',
    label: 'Finish your portfolio case study',
    tag: 'Focus now',
    tagClass: 'bg-stone-200 text-stone-800',
    reason: 'It supports the opportunity you said matters most',
    done: false,
  },
  {
    id: 'pottery',
    label: 'Learn pottery',
    tag: 'Keep for joy',
    tagClass: 'bg-stone-100 text-stone-600',
    reason: '',
    done: false,
    secondary: true,
  },
  {
    id: 'podcast',
    label: 'Start a podcast',
    tag: 'Revisit later',
    tagClass: 'bg-stone-100 text-stone-600',
    reason: '',
    done: false,
    secondary: true,
  },
]

function PriorityPreview() {
  const [items, setItems] = useState<PriorityItem[]>(defaultItems)
  const reduceMotion = useReducedMotion()

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_10px_24px_-16px_rgba(12,10,9,0.18),0_10px_24px_-18px_rgba(12,10,9,0.35)] ring-1 ring-stone-950/5">
      <div className="flex items-center justify-between border-b border-stone-100/90 bg-gradient-to-b from-stone-50 to-white px-4 py-3">
        <span className="text-[11px] font-semibold tracking-wide text-stone-900">
          YOUR FOCUS
        </span>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-medium text-stone-500 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
          Today
        </span>
      </div>
      <ul className="divide-y divide-stone-100">
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', bounce: 0, duration: 0.3 }
            }
            className="flex cursor-pointer select-none items-start gap-3 px-4 py-3.5 transition-colors duration-100 hover:bg-stone-50 active:bg-stone-100"
            onClick={() => toggle(item.id)}
            role="checkbox"
            aria-checked={item.done}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                toggle(item.id)
              }
            }}
          >
            <button
              className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border border-stone-300 bg-gradient-to-b from-white to-stone-100 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_2px_4px_rgba(12,10,9,0.08)]"
              aria-hidden="true"
              tabIndex={-1}
              type="button"
            >
              <AnimatePresence mode="wait">
                {item.done && (
                  <motion.span
                    key="dot"
                    initial={reduceMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', bounce: 0.4, duration: 0.22 }}
                    className={`block size-2.5 rounded-full ${
                      item.secondary ? 'bg-stone-400' : 'bg-stone-950'
                    }`}
                  />
                )}
              </AnimatePresence>
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p
                  className={`text-xs font-medium leading-5 ${
                    item.secondary ? 'text-stone-500' : 'text-stone-900'
                  } ${item.done ? 'line-through decoration-stone-400' : ''}`}
                >
                  {item.label}
                </p>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${item.tagClass}`}
                >
                  {item.tag}
                </span>
              </div>
              {item.reason ? (
                <p className="mt-0.5 text-[10px] leading-4 text-stone-400">
                  {item.reason}
                </p>
              ) : null}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function SanctuaryPreview() {
  const [step, setStep] = useState<'idle' | 'typing' | 'done'>('idle')
  const reduceMotion = useReducedMotion()

  function reveal() {
    if (step === 'done') return
    if (reduceMotion) {
      setStep('done')
      return
    }
    setStep('typing')
    setTimeout(() => setStep('done'), 1100)
  }

  function replay() {
    setStep('idle')
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_10px_24px_-16px_rgba(12,10,9,0.18),0_10px_24px_-18px_rgba(12,10,9,0.35)] ring-1 ring-stone-950/5">
      <div className="flex items-center justify-between border-b border-stone-100/90 bg-gradient-to-b from-stone-50 to-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-stone-900 shadow-[0_0_0_3px_rgba(12,10,9,0.12)]" />
          <span className="text-[11px] font-semibold tracking-wide text-stone-900">
            SANCTUARY
          </span>
        </div>
        {step === 'done' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="press-feedback rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-medium text-stone-500 hover:bg-stone-200"
            type="button"
            onClick={replay}
            aria-label="Replay"
          >
            Replay
          </motion.button>
        )}
      </div>
      <div className="space-y-3 p-4">
        <motion.div
          className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-stone-900 px-3.5 py-3 text-xs leading-5 text-white shadow-[0_8px_20px_-10px_rgba(12,10,9,0.55),0_1px_0_rgba(255,255,255,0.12)_inset]"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        >
          I want to write, learn design, and change careers. Every choice feels
          like abandoning the others.
        </motion.div>
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.button
              key="cta"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="press-feedback w-full rounded-xl border border-dashed border-stone-200 py-3 text-[11px] font-medium text-stone-400 transition-colors hover:border-stone-400 hover:text-stone-600"
              type="button"
              onClick={reveal}
            >
              See Ikemde's response
            </motion.button>
          )}
          {step === 'typing' && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex max-w-[92%] items-center gap-2.5 rounded-2xl rounded-bl-md border border-stone-200 bg-stone-50 px-3.5 py-3"
            >
              <LogoMark className="size-5 shrink-0" />
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-stone-400"
                    style={{ animationDelay: `${i * 130}ms` }}
                  />
                ))}
              </span>
            </motion.div>
          )}
          {step === 'done' && (
            <motion.div
              key="reply"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="max-w-[92%] rounded-2xl rounded-bl-md border border-stone-200 bg-stone-50 px-3.5 py-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <LogoMark className="size-5 shrink-0" />
                <span className="text-[10px] font-semibold text-stone-600">
                  A thought to consider
                </span>
              </div>
              <p className="text-xs leading-5 text-stone-700">
                You don't have to abandon them. Design may be the bridge: it
                gives your writing a form and your career change a direction.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ProblemSection() {
  return (
    <SectionTransition className="border-t border-stone-200 bg-white" id="why">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-8 sm:py-24 md:grid-cols-2 md:items-center md:gap-12 lg:gap-20 lg:px-12 lg:py-32">
        <Reveal>
          <SectionLabel>The multi-passionate loop</SectionLabel>
          <h2 className="font-brand text-[1.75rem] font-medium leading-[1.08] tracking-[-0.02em] text-stone-950 sm:text-3xl md:text-4xl">
            A million ideas open. None in motion
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-stone-600">
            When everything feels important, nothing gets started.
          </p>
          <p className="mt-8 border-l-2 border-stone-300 pl-4 text-sm font-medium leading-6 text-stone-800">
            You need a clearer signal—not more motivation.
          </p>
        </Reveal>
        <Reveal className="divide-y divide-stone-200 border-y border-stone-200" delay={0.08}>
          {[
            ['Interest', 'doesn’t have to become income'],
            ['Fun', 'is allowed to stay fun'],
            ['Focus', 'can change without becoming failure'],
          ].map(([word, thought]) => (
            <div
              className="grid grid-cols-[4.5rem_1fr] gap-3 py-5 sm:grid-cols-[5.5rem_1fr] sm:gap-4 sm:py-6 md:grid-cols-[6rem_1fr]"
              key={word}
            >
              <span className="font-brand text-lg font-medium text-stone-950">
                {word}
              </span>
              <span className="text-sm leading-6 text-stone-600">{thought}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </SectionTransition>
  )
}

const steps = [
  {
    number: '01',
    title: 'Pour it out',
    description:
      'Tell Sanctuary what you want, what keeps circling your mind, and what feels hard to name.',
    icon: MessageCircle,
  },
  {
    number: '02',
    title: 'See the signal',
    description:
      'Ikemde finds the patterns across your interests, responsibilities, energy, and ambitions.',
    icon: Layers3,
  },
  {
    number: '03',
    title: 'Move one thing',
    description:
      'Priority Setter gives you one grounded next move—plus permission to let the rest wait.',
    icon: MoveRight,
  },
]

function ProcessSection() {
  return (
    <section
      className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
      hidden
      id="process"
    >
      <Reveal className="max-w-2xl">
        <SectionLabel>How Ikemde works</SectionLabel>
        <h2 className="font-brand text-3xl font-medium leading-[1.05] tracking-[-0.02em] text-stone-950 sm:text-4xl lg:text-5xl">
          From mental traffic jam to a next step
        </h2>
        <p className="mt-5 max-w-lg text-base leading-7 text-stone-600">
          No complicated system to maintain. Start with your real context and
          leave with enough clarity to move.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-10 border-t border-stone-200 pt-10 md:grid-cols-3 lg:mt-20">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <Reveal delay={index * 0.05} key={step.number}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-stone-500">
                  {step.number}
                </span>
                <span className="grid size-10 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-800">
                  <Icon size={17} />
                </span>
              </div>
              <h3 className="mt-8 font-brand text-2xl font-medium text-stone-950">
                {step.title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">
                {step.description}
              </p>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function FeatureCard({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <article
      className={`group relative h-full overflow-hidden rounded-[1.5rem] border border-white/90 bg-gradient-to-br from-white via-stone-50 to-stone-100/90 p-5 shadow-[0_1.5px_0_rgba(255,255,255,0.95)_inset,0_-12px_28px_rgba(12,10,9,0.04)_inset,0_1px_2px_rgba(12,10,9,0.04),0_10px_20px_-8px_rgba(12,10,9,0.12),0_28px_56px_-20px_rgba(12,10,9,0.22)] transition-[transform,box-shadow] duration-300 ease-out md:hover:-translate-y-1.5 md:hover:shadow-[0_1.5px_0_rgba(255,255,255,0.95)_inset,0_-12px_28px_rgba(12,10,9,0.04)_inset,0_18px_36px_-12px_rgba(12,10,9,0.2),0_40px_72px_-28px_rgba(12,10,9,0.28)] sm:rounded-3xl sm:p-8 ${className}`}
      id={id}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-gradient-to-br from-stone-300/40 via-stone-200/20 to-transparent blur-2xl transition-opacity duration-300 group-hover:opacity-90"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />
      <div className="relative z-[1] flex h-full flex-col">{children}</div>
    </article>
  )
}

function FeatureSection() {
  const featureGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!featureGridRef.current) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!finePointer.matches) return

    const swapy = createSwapy(featureGridRef.current, {
      animation: 'spring',
      swapMode: 'drop',
      dragOnHold: false,
    })

    return () => swapy.destroy()
  }, [])

  return (
    <SectionTransition
      className="border-t border-stone-200 bg-stone-100/70"
      id="features"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel>Two ways back to clarity</SectionLabel>
          <h2 className="font-brand text-[1.75rem] font-medium leading-[1.08] tracking-[-0.02em] text-stone-950 sm:text-3xl md:text-4xl">
            Sort what matters. Understand why
          </h2>
          <p className="mt-4 text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
            Ikemde gives your practical priorities and your inner voice the same
            seat at the table.
          </p>
        </Reveal>

        <div
          className="mt-8 grid items-stretch gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2 md:gap-8"
          ref={featureGridRef}
        >
          <div className="h-full" data-swapy-slot="feature-left">
            <div className="h-full" data-swapy-item="priority">
              <Reveal className="h-full">
                <FeatureCard>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 text-stone-950 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_8px_16px_-10px_rgba(12,10,9,0.35)] ring-1 ring-stone-950/10">
                      <Target size={19} strokeWidth={2.25} />
                    </div>
                    <button
                      aria-label="Drag to rearrange Priority Setter"
                      className="press-feedback hidden cursor-grab rounded-xl border border-stone-200/80 bg-white/80 p-2 text-stone-400 shadow-sm hover:bg-white hover:text-stone-700 active:cursor-grabbing md:inline-flex"
                      data-swapy-handle
                      type="button"
                    >
                      <GripVertical aria-hidden="true" size={20} />
                    </button>
                  </div>
                  <SectionLabel>Priority Setter</SectionLabel>
                  <h3 className="font-brand text-2xl font-medium leading-tight text-stone-950 sm:text-3xl">
                    Separate “I’d love to” from “I need to”
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
                    Not every interest needs to become a goal, side hustle, or
                    new identity. See what deserves focus now, what’s purely for
                    joy, and what can wait without guilt.
                  </p>
                  <div className="mt-8">
                    <PriorityPreview />
                  </div>
                </FeatureCard>
              </Reveal>
            </div>
          </div>

          <div className="h-full" data-swapy-slot="feature-right">
            <div className="h-full" data-swapy-item="sanctuary">
              <Reveal className="h-full" delay={0.06}>
                <FeatureCard id="sanctuary">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 text-stone-950 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_8px_16px_-10px_rgba(12,10,9,0.35)] ring-1 ring-stone-950/10">
                      <Sparkles size={19} strokeWidth={2.25} />
                    </div>
                    <button
                      aria-label="Drag to rearrange Sanctuary"
                      className="press-feedback hidden cursor-grab rounded-xl border border-stone-200/80 bg-white/80 p-2 text-stone-400 shadow-sm hover:bg-white hover:text-stone-700 active:cursor-grabbing md:inline-flex"
                      data-swapy-handle
                      type="button"
                    >
                      <GripVertical aria-hidden="true" size={20} />
                    </button>
                  </div>
                  <SectionLabel>Sanctuary</SectionLabel>
                  <h3 className="font-brand text-2xl font-medium leading-tight text-stone-950 sm:text-3xl">
                    Say the messy part out loud
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
                    Share the ambitions, doubts, detours, and wants that don’t
                    fit neatly into a productivity template. Ikemde finds the
                    patterns and offers guidance grounded in your story.
                  </p>
                  <div className="mt-8">
                    <SanctuaryPreview />
                  </div>
                </FeatureCard>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </SectionTransition>
  )
}

function DifferenceSection() {
  return (
    <SectionTransition className="border-t border-stone-200 px-4 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <SectionLabel>A different starting point</SectionLabel>
          <p className="font-brand text-[1.75rem] font-medium leading-[1.1] tracking-[-0.02em] text-stone-950 sm:text-3xl md:text-4xl lg:text-5xl">
            Most productivity tools start with the list.
            <span className="text-stone-400">
              {' '}
              Ikemde starts with the person.
            </span>
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 text-center sm:mt-14 md:grid-cols-3 md:gap-6">
          {[
            ['Context first', 'Your priorities make sense only inside your life'],
            ['Advice, not commands', 'You stay in charge of every decision'],
            ['Enough, not everything', 'Clarity means knowing what can wait'],
          ].map(([title, description], index) => (
            <Reveal
              className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-left md:border-0 md:bg-transparent md:p-0 md:text-center"
              delay={0.08 + index * 0.07}
              key={title}
            >
              <p className="text-sm font-semibold text-stone-900">{title}</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600 md:mx-auto">
                {description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionTransition>
  )
}

const questions = [
  {
    question: 'Is Ikemde another task manager?',
    answer:
      'No. Task managers assume you already know what matters. Ikemde helps you work that out first, then gives you a clear next move.',
  },
  {
    question: 'Do I have to give up some of my interests?',
    answer:
      'Not at all. Some interests can be priorities, some can stay joyful hobbies, and others can wait. Ikemde helps you tell the difference without guilt.',
  },
  {
    question: 'What do I share in Sanctuary?',
    answer:
      'Whatever feels relevant: your story, ambitions, uncertainty, responsibilities, or the ideas competing for your attention. There is no perfect format.',
  },
  {
    question: 'Does the AI decide what I should do?',
    answer:
      'No. Ikemde offers patterns, perspective, and personalized advice. You keep the final say—because a useful tool should strengthen your agency, not replace it.',
  },
  {
    question: 'When can I try it?',
    answer:
      'Ikemde is in early development. Join the waitlist and you’ll be among the first invited to try it.',
  },
]

function QuestionsSection() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const reduceMotion = useReducedMotion()

  return (
    <SectionTransition
      className="border-t border-stone-200 bg-white"
      id="questions"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-8 sm:py-24 md:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20 lg:px-12 lg:py-32">
        <Reveal>
          <SectionLabel>Questions, answered</SectionLabel>
          <h2 className="font-brand text-[1.75rem] font-medium leading-[1.08] tracking-[-0.02em] text-stone-950 sm:text-3xl md:text-4xl">
            The useful things to know
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600">
            Still wondering about something? Join the waitlist and we’ll share
            more as Ikemde takes shape.
          </p>
        </Reveal>

        <Reveal className="border-t border-stone-200" delay={0.08}>
          {questions.map((item, index) => {
            const isOpen = openQuestion === index
            const answerId = `question-answer-${index}`
            return (
              <div className="border-b border-stone-200" key={item.question}>
                <button
                  className="press-feedback flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-stone-950 outline-none hover:text-stone-600 focus-visible:text-stone-600 sm:min-h-[4.5rem] sm:gap-6 sm:text-base"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenQuestion(isOpen ? null : index)}
                >
                  {item.question}
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-stone-200 bg-stone-50 text-stone-700">
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={answerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: {
                          duration: reduceMotion ? 0 : 0.3,
                          ease: [0.23, 1, 0.32, 1],
                        },
                        opacity: { duration: reduceMotion ? 0 : 0.2 },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 pr-12 text-sm leading-7 text-stone-600">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </Reveal>
      </div>
    </SectionTransition>
  )
}

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!normalized || status === 'loading') return

    setStatus('loading')
    setError(null)

    const { error: insertError } = await supabase
      .from('waitlist')
      .insert({ email: normalized })

    if (insertError) {
      const isDuplicate =
        insertError.code === '23505' ||
        /duplicate|unique/i.test(insertError.message)

      if (isDuplicate) {
        setStatus('success')
        return
      }

      setStatus('idle')
      setError('Something went wrong. Please try again in a moment.')
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div
        className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3.5 text-sm font-medium text-stone-900"
        role="status"
      >
        <Check size={17} className="text-emerald-600" />
        You’re in. We’ll be in touch.
      </div>
    )
  }

  return (
    <form
      className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="email">
          Email address
        </label>
        <input
          className="min-h-11 min-w-0 flex-1 rounded-full border border-stone-200 bg-white px-5 text-sm text-stone-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-stone-950 focus:shadow-md disabled:opacity-60"
          id="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (error) setError(null)
          }}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={status === 'loading'}
          required
        />
        <Button
          className="min-h-11 shadow-lg shadow-stone-950/15"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
        </Button>
      </div>
      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}

function FinalCta() {
  return (
    <SectionTransition
      className="border-t border-stone-200 bg-white px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-24"
      id="waitlist"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-14 shadow-[0_32px_90px_-48px_rgba(12,10,9,0.5)] sm:rounded-[2rem] sm:px-10 sm:py-20 md:py-24">
        <Reveal className="relative z-10 mx-auto max-w-3xl text-center">
          <SectionLabel>Ready when you are</SectionLabel>
          <h2 className="font-brand text-[1.75rem] font-medium leading-[1.08] tracking-[-0.02em] text-stone-950 sm:text-3xl md:text-4xl lg:text-5xl">
            You don’t have to choose one version of yourself
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
            You only need to decide what deserves your attention now. Keep your
            interests. Lose the standstill.
          </p>
          <WaitlistForm />
        </Reveal>
      </div>
    </SectionTransition>
  )
}

function Footer() {
  return (
    <SectionTransition
      as="footer"
      className="border-t border-stone-200 px-4 pb-28 pt-8 text-center sm:px-8 sm:py-8 lg:px-12"
    >
      <p className="text-xs text-stone-500">
        Made for minds that were never meant to fit in one box · © 2026 Ikemde
      </p>
    </SectionTransition>
  )
}

function MarqueeBanner() {
  const marqueeText = 'FOCUS ON WHAT MATTERS · '

  return (
    <SectionTransition
      className="flex flex-col items-center justify-center gap-2 border-y border-stone-200 bg-white py-6 sm:gap-3 sm:py-8"
      aria-hidden="true"
    >
      <ScrollBaseAnimation
        alwaysAnimate
        baseVelocity={5}
        direction="left"
        className="font-brand text-[9vw] font-medium tracking-[-0.03em] text-stone-600 sm:text-[8vw] md:text-[6vw]"
      >
        {marqueeText}
      </ScrollBaseAnimation>
      <ScrollBaseAnimation
        alwaysAnimate
        baseVelocity={5}
        direction="right"
        className="font-brand text-[9vw] font-medium tracking-[-0.03em] text-stone-500 sm:text-[8vw] md:text-[6vw]"
      >
        {marqueeText}
      </ScrollBaseAnimation>
    </SectionTransition>
  )
}

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <CustomCursor />
      <main className="pb-28">
        <Hero />
        <ProblemSection />
        <ProcessSection />
        <MarqueeBanner />
        <FeatureSection />
        <DifferenceSection />
        <QuestionsSection />
        <FinalCta />
      </main>
      <Footer />
      <DockNav />
    </div>
  )
}

export default App
