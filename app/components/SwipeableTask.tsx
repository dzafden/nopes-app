"use client"

import { useState } from "react"
import { motion, type PanInfo, useAnimation } from "framer-motion"
import { Check, X, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SwipeableTaskProps {
  task: {
    id: number
    text: string
    importance?: boolean
    urgency?: boolean
  }
  onSwipe: (taskId: number, direction: "left" | "right") => void
}

export function SwipeableTask({ task, onSwipe }: SwipeableTaskProps) {
  const [currentQuestion, setCurrentQuestion] = useState<"important" | "urgent">(
    task.importance === undefined ? "important" : "urgent",
  )
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 50
    if (info.offset.x > threshold) {
      onSwipe(task.id, "right")
      if (currentQuestion === "important") {
        setCurrentQuestion("urgent")
      }
    } else if (info.offset.x < -threshold) {
      onSwipe(task.id, "left")
      if (currentQuestion === "important") {
        setCurrentQuestion("urgent")
      }
    }
    controls.start({ x: 0 })
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onDragStart={() => setIsDragging(true)}
      animate={controls}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-lg overflow-hidden cursor-grab group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Left swipe area - No */}
      <div className="absolute inset-y-0 left-0 w-16 bg-red-500 flex items-center justify-center">
        <X className="text-white" size={24} />
      </div>
      {/* Right swipe area - Yes */}
      <div className="absolute inset-y-0 right-0 w-16 bg-green-500 flex items-center justify-center">
        <Check className="text-white" size={24} />
      </div>
      {/* Main content */}
      <div className="relative z-10 p-4 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm lg:text-base flex-1">{task.text}</p>
          {/* Progress dots moved to top right */}
          <div className="flex gap-1.5 items-center ml-4">
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                task.importance === undefined
                  ? "border-2 border-gray-300 dark:border-gray-600"
                  : "bg-gray-900 dark:bg-gray-100",
              )}
              aria-label="Importance status"
            />
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                task.urgency === undefined
                  ? "border-2 border-gray-300 dark:border-gray-600"
                  : "bg-gray-900 dark:bg-gray-100",
              )}
              aria-label="Urgency status"
            />
          </div>
        </div>

        {/* Question and swipe indicators */}
        <div className={cn("transition-all duration-200", isHovered ? "opacity-100" : "opacity-0")}>
          <div className="flex items-center justify-between w-full">
            {/* Left hint */}
            <div className="flex items-center gap-1.5 min-w-[40px]">
              <ArrowLeft className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-light text-gray-600 dark:text-gray-400">No</span>
            </div>

            {/* Question */}
            <p className="text-xs font-light text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              Is this {currentQuestion}?
            </p>

            {/* Right hint */}
            <div className="flex items-center gap-1.5 min-w-[40px] justify-end">
              <span className="text-xs font-light text-gray-600 dark:text-gray-400">Yes</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

