'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'

const LINK_SELECTOR = 'a, [role="link"]'
const OFFSET_X = 12
const OFFSET_Y = 16

function isPointerFine() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
}

const Cursor = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isHoveringLink, setIsHoveringLink] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const smoothX = useSpring(x, { stiffness: 300, damping: 40, mass: 0.5 })
  const smoothY = useSpring(y, { stiffness: 300, damping: 40, mass: 0.5 })

  const offsetX = useTransform(smoothX, (value) => value + OFFSET_X)
  const offsetY = useTransform(smoothY, (value) => value + OFFSET_Y)

  useEffect(() => {
    if (!isPointerFine()) return

    setIsEnabled(true)

    const handlePointerMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest(LINK_SELECTOR)) {
        setIsHoveringLink(true)
      }
    }

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.closest(LINK_SELECTOR)) return
      const related = event.relatedTarget as HTMLElement | null
      if (related?.closest(LINK_SELECTOR)) return
      setIsHoveringLink(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerover', handlePointerOver, true)
    document.addEventListener('pointerout', handlePointerOut, true)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerover', handlePointerOver, true)
      document.removeEventListener('pointerout', handlePointerOut, true)
    }
  }, [x, y])

  useEffect(() => {
    if (!isEnabled) return
    const clearHover = () => setIsHoveringLink(false)
    window.addEventListener('blur', clearHover)
    return () => window.removeEventListener('blur', clearHover)
  }, [isEnabled])

  if (!isEnabled) return null

  return (
    <motion.img
      src="/rocket-cursor.svg"
      alt=""
      aria-hidden
      style={{
        translateX: offsetX,
        translateY: offsetY,
      }}
      initial={false}
      animate={{
        opacity: isHoveringLink ? 1 : 0,
        scale: isHoveringLink ? 1 : 0.9,
        rotate: isHoveringLink ? 0 : -12,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-10 w-10 select-none"
    />
  )
}

export default Cursor
