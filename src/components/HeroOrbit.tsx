import cookingImg from '@/assets/interests/cooking.png'
import designImg from '@/assets/interests/design.png'
import fitnessImg from '@/assets/interests/fitness.png'
import gardeningImg from '@/assets/interests/gardening.png'
import ideasImg from '@/assets/interests/ideas.png'
import musicImg from '@/assets/interests/music.png'
import paintingImg from '@/assets/interests/painting.png'
import photographyImg from '@/assets/interests/photography.png'
import writingImg from '@/assets/interests/writing.png'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

type OrbitCard = {
  label: string
  image: string
  position: string
  rotateY: number
  rotateX: number
  translateZ: number
  objectPosition?: string
  /** Hide only on the smallest phones; show from sm+ */
  mobileOptional?: boolean
}

const orbitCards: OrbitCard[] = [
  {
    label: 'Ideas',
    image: ideasImg,
    position:
      'left-[0.5%] top-[38%] sm:left-[1.5%] sm:top-[40%] lg:left-[1%] lg:top-[48%]',
    rotateY: 32,
    rotateX: 8,
    translateZ: -28,
    objectPosition: 'center',
    mobileOptional: true,
  },
  {
    label: 'Photography',
    image: photographyImg,
    position:
      'left-[2%] top-[18%] sm:left-[4%] sm:top-[18%] lg:left-[5%] lg:top-[24%]',
    rotateY: 24,
    rotateX: 5,
    translateZ: -12,
    objectPosition: 'center 40%',
  },
  {
    label: 'Writing',
    image: writingImg,
    position:
      'left-[8%] top-[3%] sm:left-[12%] sm:top-[5%] md:left-[14%] md:top-[8%] lg:left-[16%] lg:top-[9%]',
    rotateY: 14,
    rotateX: 2,
    translateZ: 8,
    objectPosition: 'center 45%',
  },
  {
    label: 'Gardening',
    image: gardeningImg,
    position:
      'left-[24%] top-[0%] sm:left-[26%] sm:top-[1%] md:left-[28%] md:top-[2%] lg:left-[30%] lg:top-[2%]',
    rotateY: 7,
    rotateX: 0,
    translateZ: 22,
    objectPosition: 'center 55%',
  },
  {
    label: 'Design',
    image: designImg,
    position:
      'left-[calc(50%-1.25rem)] top-[0%] sm:left-[calc(50%-1.75rem)] sm:top-[0.5%] lg:left-[calc(50%-3rem)] lg:top-[0.5%]',
    rotateY: 0,
    rotateX: -2,
    translateZ: 36,
    objectPosition: 'center',
  },
  {
    label: 'Painting',
    image: paintingImg,
    position:
      'right-[24%] top-[0%] sm:right-[26%] sm:top-[1%] md:right-[28%] md:top-[2%] lg:right-[30%] lg:top-[2%]',
    rotateY: -7,
    rotateX: 0,
    translateZ: 22,
    objectPosition: 'center 35%',
  },
  {
    label: 'Music',
    image: musicImg,
    position:
      'right-[8%] top-[3%] sm:right-[12%] sm:top-[5%] md:right-[14%] md:top-[8%] lg:right-[16%] lg:top-[9%]',
    rotateY: -14,
    rotateX: 2,
    translateZ: 8,
    objectPosition: 'center 40%',
  },
  {
    label: 'Cooking',
    image: cookingImg,
    position:
      'right-[2%] top-[18%] sm:right-[4%] sm:top-[18%] lg:right-[5%] lg:top-[24%]',
    rotateY: -24,
    rotateX: 5,
    translateZ: -12,
    objectPosition: 'center 30%',
  },
  {
    label: 'Fitness',
    image: fitnessImg,
    position:
      'right-[0.5%] top-[38%] sm:right-[1.5%] sm:top-[40%] lg:right-[2%] lg:top-[46%]',
    rotateY: -32,
    rotateX: 8,
    translateZ: -28,
    objectPosition: 'center 45%',
    mobileOptional: true,
  },
]

function cardVisibility(card: OrbitCard) {
  return card.mobileOptional ? 'hidden min-[400px]:block' : 'block'
}

function cardPose(card: OrbitCard, y = 0, scale = 1, zBoost = 0) {
  return `translateY(${y}px) translateZ(${card.translateZ + zBoost}px) rotateX(${card.rotateX}deg) rotateY(${card.rotateY}deg) scale(${scale})`
}

function OrbitCardItem({
  card,
  index,
  reduceMotion,
}: {
  card: OrbitCard
  index: number
  reduceMotion: boolean | null
}) {
  const [hovered, setHovered] = useState(false)
  const [entered, setEntered] = useState(false)
  const rest = cardPose(card)
  const enter = cardPose(card, 18, 0.94)
  const hoverPose = cardPose(card, -4, 1, 28)

  return (
    <motion.div
      className={`absolute ${card.position} ${cardVisibility(card)} ${
        hovered ? 'z-30' : 'z-10'
      }`}
      initial={reduceMotion ? false : { opacity: 0, transform: enter }}
      animate={{
        opacity: 1,
        transform: hovered && !reduceMotion ? hoverPose : rest,
      }}
      onAnimationComplete={() => {
        if (!entered) setEntered(true)
      }}
      transition={{
        duration: reduceMotion ? 0 : entered ? 0.28 : 0.55,
        delay: reduceMotion || entered ? 0 : 0.08 + index * 0.045,
        ease: [0.23, 1, 0.32, 1],
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        animate={reduceMotion || hovered ? { y: 0 } : { y: [0, -6, 0] }}
        transition={
          reduceMotion || hovered
            ? { duration: 0.25, ease: [0.23, 1, 0.32, 1] }
            : {
                duration: 4.8 + (index % 3) * 0.5,
                delay: 0.7 + index * 0.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          className="pointer-events-auto max-md:pointer-events-none"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          whileHover={
            reduceMotion ? undefined : { y: -14, scale: 1.08 }
          }
          whileTap={reduceMotion ? undefined : { scale: 1.03, y: -8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="relative flex h-14 w-10 flex-col justify-end overflow-hidden rounded-lg border border-white/90 transition-[box-shadow] duration-200 sm:h-20 sm:w-14 sm:rounded-xl md:h-24 md:w-[4.5rem] md:rounded-2xl lg:h-32 lg:w-24"
            style={{
              boxShadow: hovered
                ? `
                    0 1px 0 rgba(255,255,255,0.9) inset,
                    0 -10px 18px rgba(12,10,9,0.08) inset,
                    ${card.rotateY > 0 ? '10px' : card.rotateY < 0 ? '-10px' : '0'} 22px 40px -12px rgba(12,10,9,0.38),
                    0 36px 60px -28px rgba(12,10,9,0.42)
                  `
                : `
                    0 1px 0 rgba(255,255,255,0.85) inset,
                    0 -10px 18px rgba(12,10,9,0.08) inset,
                    ${card.rotateY > 0 ? '6px' : card.rotateY < 0 ? '-6px' : '0'} 14px 28px -10px rgba(12,10,9,0.28),
                    0 28px 48px -24px rgba(12,10,9,0.35)
                  `,
            }}
          >
            <img
              alt=""
              className="absolute inset-0 size-full object-cover"
              src={card.image}
              style={{ objectPosition: card.objectPosition ?? 'center' }}
            />
            <span
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                background: `linear-gradient(
                  to top,
                  rgba(12,10,9,0.55) 0%,
                  rgba(12,10,9,0.12) 38%,
                  rgba(255,255,255,0.08) 70%,
                  rgba(255,255,255,0.2) 100%
                ),
                linear-gradient(
                  ${125 + card.rotateY * 1.2}deg,
                  rgba(255,255,255,0.35) 0%,
                  rgba(255,255,255,0.05) 40%,
                  transparent 58%
                )`,
              }}
            />
            <span
              className="pointer-events-none absolute inset-y-2 w-px rounded-full bg-white/70"
              style={{
                left: card.rotateY >= 0 ? '10%' : 'auto',
                right: card.rotateY < 0 ? '10%' : 'auto',
                opacity: 0.45,
              }}
            />

            <span className="relative z-[1] m-1 truncate rounded-full bg-white/85 px-1 py-0.5 text-center text-[6px] font-semibold text-stone-800 shadow-[0_4px_10px_-6px_rgba(12,10,9,0.4)] backdrop-blur-sm sm:m-1.5 sm:px-1.5 sm:py-1 sm:text-[8px] md:m-2 md:px-2 md:text-[9px]">
              {card.label}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function HeroOrbit() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[10.5rem] sm:h-[13rem] md:h-[15rem] lg:inset-0 lg:h-auto [perspective:1100px] [transform-style:preserve-3d]"
    >
      {orbitCards.map((card, index) => (
        <OrbitCardItem
          card={card}
          index={index}
          key={card.label}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  )
}
