"use client"

import type React from "react"

import { motion } from "framer-motion"

interface HighlightOverlayProps {
  selector: string
  children?: React.ReactNode
}

export function HighlightOverlay({ selector, children }: HighlightOverlayProps) {
  const getElementPosition = () => {
    const element = document.querySelector(selector)
    if (!element) return null

    const rect = element.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    }
  }

  const position = getElementPosition()

  if (!position) return null

  const padding = 4 // Padding around the highlighted element

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Create a mask with a cutout */}
      <div
        className="absolute inset-0 bg-black/20"
        style={{
          mask: `path('M 0 0 L 0 100% L 100% 100% L 100% 0 L 0 0 Z M ${position.left - padding}px ${
            position.top - padding
          }px h ${position.width + padding * 2}px v ${position.height + padding * 2}px h -${
            position.width + padding * 2
          }px Z')`,
          WebkitMask: `path('M 0 0 L 0 100% L 100% 100% L 100% 0 L 0 0 Z M ${position.left - padding}px ${
            position.top - padding
          }px h ${position.width + padding * 2}px v ${position.height + padding * 2}px h -${
            position.width + padding * 2
          }px Z')`,
        }}
      />

      {/* Highlight border with glow effect */}
      <motion.div
        className="absolute rounded-lg"
        initial={{ ...position, scale: 0.95, opacity: 0 }}
        animate={{
          ...position,
          scale: 1,
          opacity: 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Multiple borders for gradient glow effect */}
        <div
          className="absolute -inset-1 rounded-lg opacity-75"
          style={{
            background: `
              linear-gradient(45deg, 
                rgba(var(--primary-rgb)/0.2) 0%, 
                rgba(var(--primary-rgb)/0.4) 50%,
                rgba(var(--primary-rgb)/0.2) 100%
              )
            `,
          }}
        />
        <motion.div
          className="absolute -inset-1 rounded-lg border-2 border-primary"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {children}
    </div>
  )
}

