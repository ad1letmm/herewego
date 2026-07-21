import type { Icon } from '@phosphor-icons/react'
import {
  Barbell,
  Camera,
  CookingPot,
  MusicNotes,
  PenNib,
  SquaresFour,
} from '@phosphor-icons/react'
import { useRef, type RefObject } from 'react'
import ikemdeLogo from '@/assets/ikemde-logo.png'
import { AnimatedBeam } from '@/components/ui/animated-beam'
import { cn } from '@/lib/utils'

type BeamNode = {
  label: string
  icon: Icon
  accent: string
  beam: {
    curvature?: number
    endYOffset?: number
    reverse?: boolean
    gradientStartColor: string
    gradientMidColor: string
    gradientStopColor: string
  }
}

const beamNodes: BeamNode[] = [
  {
    label: 'Photography',
    icon: Camera,
    accent: '#60a5fa',
    beam: {
      curvature: -90,
      endYOffset: -10,
      gradientStartColor: '#ff4d4d',
      gradientMidColor: '#ffe066',
      gradientStopColor: '#4dabf7',
    },
  },
  {
    label: 'Music',
    icon: MusicNotes,
    accent: '#34d399',
    beam: {
      gradientStartColor: '#ff6bcb',
      gradientMidColor: '#69db7c',
      gradientStopColor: '#339af0',
    },
  },
  {
    label: 'Writing',
    icon: PenNib,
    accent: '#f472b6',
    beam: {
      curvature: 90,
      endYOffset: 10,
      gradientStartColor: '#fa5252',
      gradientMidColor: '#94d82d',
      gradientStopColor: '#7950f2',
    },
  },
  {
    label: 'Design',
    icon: SquaresFour,
    accent: '#818cf8',
    beam: {
      curvature: -90,
      endYOffset: -10,
      reverse: true,
      gradientStartColor: '#ff922b',
      gradientMidColor: '#51cf66',
      gradientStopColor: '#228be6',
    },
  },
  {
    label: 'Cooking',
    icon: CookingPot,
    accent: '#fb923c',
    beam: {
      reverse: true,
      gradientStartColor: '#ff8787',
      gradientMidColor: '#ffd43b',
      gradientStopColor: '#74c0fc',
    },
  },
  {
    label: 'Fitness',
    icon: Barbell,
    accent: '#2dd4bf',
    beam: {
      curvature: 90,
      endYOffset: 10,
      reverse: true,
      gradientStartColor: '#e64980',
      gradientMidColor: '#40c057',
      gradientStopColor: '#4c6ef5',
    },
  },
]

function NodeIcon({
  node,
  nodeRef,
  className,
}: {
  node: BeamNode
  nodeRef: RefObject<HTMLDivElement | null>
  className?: string
}) {
  const IconComponent = node.icon

  return (
    <div className={cn('relative z-10 flex flex-col items-center gap-2.5', className)}>
      <div
        ref={nodeRef}
        className="interest-node-size flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-stone-950 text-white shadow-lg shadow-stone-950/15"
        style={{
          boxShadow:
            '0 16px 30px -18px rgba(12, 10, 9, 0.55), 0 6px 14px -10px rgba(12, 10, 9, 0.28)',
        }}
      >
        <IconComponent
          aria-hidden="true"
          className="interest-node-icon"
          weight="bold"
        />
      </div>
      <span className="rounded-full border border-stone-200/80 bg-white/90 px-2 py-1 text-[9px] font-medium tracking-wide text-stone-600 shadow-sm backdrop-blur-sm sm:px-2.5 sm:text-[10px]">
        {node.label}
      </span>
    </div>
  )
}

export default function InterestBeam() {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const nodeRef0 = useRef<HTMLDivElement>(null)
  const nodeRef1 = useRef<HTMLDivElement>(null)
  const nodeRef2 = useRef<HTMLDivElement>(null)
  const nodeRef3 = useRef<HTMLDivElement>(null)
  const nodeRef4 = useRef<HTMLDivElement>(null)
  const nodeRef5 = useRef<HTMLDivElement>(null)
  const nodeRefs = [nodeRef0, nodeRef1, nodeRef2, nodeRef3, nodeRef4, nodeRef5]

  const [photography, music, writing, design, cooking, fitness] = beamNodes

  return (
    <div
      className="relative isolate flex h-full min-h-[25rem] w-full flex-1 items-stretch overflow-hidden rounded-[2rem] bg-white sm:min-h-[28rem] sm:p-7"
      ref={containerRef}
      aria-label="Your interests connected to Ikemde"
    >
      <div className="relative z-10 grid h-full min-h-0 w-full flex-1 grid-rows-3 px-1 py-2 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between">
          <NodeIcon node={photography} nodeRef={nodeRefs[0]} />
          <NodeIcon node={design} nodeRef={nodeRefs[3]} />
        </div>
        <div className="flex items-center justify-between">
          <NodeIcon node={music} nodeRef={nodeRefs[1]} />
          <div
            ref={centerRef}
            className="interest-center-size z-20 flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-stone-950 shadow-[0_12px_30px_-12px_rgba(12,10,9,0.65)] ring-4 ring-white/80"
          >
            <img
              alt=""
              className="interest-center-icon object-contain"
              src={ikemdeLogo}
            />
          </div>
          <NodeIcon node={cooking} nodeRef={nodeRefs[4]} />
        </div>
        <div className="flex items-center justify-between">
          <NodeIcon node={writing} nodeRef={nodeRefs[2]} />
          <NodeIcon node={fitness} nodeRef={nodeRefs[5]} />
        </div>
      </div>

      {beamNodes.map((node, index) => (
        <AnimatedBeam
          key={node.label}
          containerRef={containerRef}
          curvature={node.beam.curvature}
          dashGap={9}
          dashLength={6}
          delay={index * 0.35}
          dotted
          duration={2.8}
          endYOffset={node.beam.endYOffset}
          fromRef={nodeRefs[index]}
          gradientMidColor={node.beam.gradientMidColor}
          gradientStartColor={node.beam.gradientStartColor}
          gradientStopColor={node.beam.gradientStopColor}
          pathColor="#d6d3d1"
          pathOpacity={0.45}
          pathWidth={3}
          reverse={node.beam.reverse}
          toRef={centerRef}
        />
      ))}
    </div>
  )
}
