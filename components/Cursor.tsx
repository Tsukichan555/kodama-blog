'use client'

import { animate } from 'motion'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

const LINK_SELECTOR = 'a, [role="link"]'
const OFFSET_X = 12
const OFFSET_Y = 16
const IMAGE_SWAP_DELAY = 160
const LAUNCH_RESET_DELAY = 1100

function isPointerFine() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
}

const Cursor = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isHoveringLink, setIsHoveringLink] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [isFlying, setIsFlying] = useState(false)

  const pressedLinkRef = useRef<HTMLElement | null>(null)
  const isPressingRef = useRef(false)
  const isLaunchingRef = useRef(false)
  const launchResetTimeoutRef = useRef<number | null>(null)
  const imageSwapTimeoutRef = useRef<number | null>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const smoothX = useSpring(x, { stiffness: 300, damping: 40, mass: 0.5 })
  const smoothY = useSpring(y, { stiffness: 300, damping: 40, mass: 0.5 })

  const offsetX = useTransform(smoothX, (value) => value + OFFSET_X)
  const offsetY = useTransform(smoothY, (value) => value + OFFSET_Y)

  const launchBoost = useMotionValue(0)
  const combinedY = useTransform([offsetY, launchBoost], ([base, boost]) => base + boost)

  const clearLaunchTimers = useCallback(() => {
    if (launchResetTimeoutRef.current !== null) {
      window.clearTimeout(launchResetTimeoutRef.current)
      launchResetTimeoutRef.current = null
    }
    if (imageSwapTimeoutRef.current !== null) {
      window.clearTimeout(imageSwapTimeoutRef.current)
      imageSwapTimeoutRef.current = null
    }
  }, [])

  const resetSequence = useCallback(() => {
    clearLaunchTimers()
    pressedLinkRef.current = null
    isPressingRef.current = false
    isLaunchingRef.current = false
    setIsPressed(false)
    setIsLaunching(false)
    setIsFlying(false)
    launchBoost.set(0)
  }, [clearLaunchTimers, launchBoost])

  const startLaunchSequence = useCallback(() => {
    clearLaunchTimers()
    isLaunchingRef.current = true
    setIsLaunching(true)
    setIsPressed(false)
    setIsFlying(false)
    launchBoost.set(0)

    imageSwapTimeoutRef.current = window.setTimeout(() => {
      setIsFlying(true)
    }, IMAGE_SWAP_DELAY)

    launchResetTimeoutRef.current = window.setTimeout(() => {
      isLaunchingRef.current = false
      setIsLaunching(false)
      setIsFlying(false)
    }, LAUNCH_RESET_DELAY)
  }, [clearLaunchTimers, launchBoost])

  useEffect(() => {
    if (!isPointerFine()) return

    setIsEnabled(true)

    const handlePointerMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }

    const handlePointerOver = (event: PointerEvent) => {
      const element = event.target as HTMLElement | null
      if (element?.closest(LINK_SELECTOR)) {
        setIsHoveringLink(true)
      }
    }

    const handlePointerOut = (event: PointerEvent) => {
      const element = event.target as HTMLElement | null
      if (!element?.closest(LINK_SELECTOR)) return
      const related = event.relatedTarget as HTMLElement | null
      if (related?.closest(LINK_SELECTOR)) return
      setIsHoveringLink(false)
      if (!isLaunchingRef.current) {
        resetSequence()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const element = event.target as HTMLElement | null
      const link = element?.closest(LINK_SELECTOR) as HTMLElement | null
      if (!link) return
      isPressingRef.current = true
      pressedLinkRef.current = link
      setIsPressed(true)
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (!isPressingRef.current) return

      const pressedLink = pressedLinkRef.current
      const pathTargets = typeof event.composedPath === 'function' ? event.composedPath() : []
      const targetNode = event.target as Node | null
      const releasedOnLink =
        !!pressedLink &&
        (pathTargets.includes(pressedLink) ||
          (targetNode ? pressedLink.contains(targetNode) : false))

      isPressingRef.current = false
      pressedLinkRef.current = null

      if (releasedOnLink) {
        startLaunchSequence()
      } else {
        resetSequence()
      }
    }

    const handlePointerCancel = () => {
      if (!isPressingRef.current) return
      resetSequence()
    }

    window.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerover', handlePointerOver, true)
    document.addEventListener('pointerout', handlePointerOut, true)
    document.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('pointerup', handlePointerUp, true)
    window.addEventListener('pointercancel', handlePointerCancel, true)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerover', handlePointerOver, true)
      document.removeEventListener('pointerout', handlePointerOut, true)
      document.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('pointerup', handlePointerUp, true)
      window.removeEventListener('pointercancel', handlePointerCancel, true)
    }
  }, [x, y, resetSequence, startLaunchSequence])

  useEffect(() => {
    if (!isEnabled) return
    const handleBlur = () => {
      setIsHoveringLink(false)
      resetSequence()
    }
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [isEnabled, resetSequence])

  useEffect(() => {
    const controls = animate(
      launchBoost,
      isLaunching ? [-8, -14, -220] : 0,
      isLaunching
        ? { duration: 1, ease: [0.16, 0.5, 0.3, 1], times: [0, 0.25, 1] }
        : { type: 'spring', stiffness: 260, damping: 30 }
    )

    return () => {
      controls.stop()
    }
  }, [isLaunching, launchBoost])

  useEffect(() => {
    return () => {
      clearLaunchTimers()
    }
  }, [clearLaunchTimers])

  if (!isEnabled) return null

  const isCursorVisible = isHoveringLink || isPressed || isLaunching
  const imageSrc = isFlying ? '/rocket-flying.png' : '/rocket-cursor2.png'

  const rotateAnimation = isLaunching
    ? isFlying
      ? 0
      : [45, 42, 48, 45]
    : isPressed
      ? 45
      : isHoveringLink
        ? 0
        : -12

  const rotateTransition = isLaunching
    ? isFlying
      ? { duration: 0.2 }
      : { duration: 0.6, ease: [0.37, 0, 0.63, 1], times: [0, 0.3, 0.7, 1] }
    : { type: 'spring', stiffness: 600, damping: 45 }

  return (
    <motion.div
      style={{ x: offsetX, y: combinedY }}
      className="pointer-events-none fixed top-0 left-0 z-[9999]"
      initial={false}
    >
      <motion.img
        src={imageSrc}
        alt=""
        aria-hidden
        draggable={false}
        initial={false}
        animate={{
          opacity: isCursorVisible ? 1 : 0,
          scale: isLaunching ? [1, 1.04, 1.12] : isPressed ? 1.05 : isHoveringLink ? 1 : 0.9,
          rotate: rotateAnimation,
          y: isLaunching ? [0, -2, 2, -1, 0] : 0,
        }}
        transition={{
          opacity: { duration: 0.12 },
          scale: isLaunching
            ? { duration: 0.6, ease: [0.37, 0, 0.63, 1], times: [0, 0.4, 1] }
            : { type: 'spring', stiffness: 500, damping: 42 },
          rotate: rotateTransition,
          y: isLaunching
            ? { duration: 0.45, times: [0, 0.3, 0.6, 1], ease: [0.37, 0, 0.63, 1] }
            : { duration: 0.2 },
        }}
        className="pointer-events-none h-10 w-10 select-none"
      />
    </motion.div>
  )
}

export default Cursor
