"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, ArrowRight } from "lucide-react"

const tutorialSteps = [
  {
    title: "Welcome to Nopes!",
    description: "Let's get started by adding your first task in the input field above.",
  },
  {
    title: "Prioritize Your Tasks",
    description:
      "Swipe right for 'Yes' and left for 'No' to answer two simple questions: Is it important? Is it urgent?",
  },
  {
    title: "Smart Organization",
    description:
      "Based on your answers, tasks are automatically sorted into Do Now, Schedule, Delegate, or Nope categories. You're all set!",
  },
]

interface TutorialProps {
  isOpen: boolean
  onClose: () => void
}

export function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
          <DialogDescription>{tutorialSteps[currentStep].description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              {currentStep < tutorialSteps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

