"use client"

import { memo, useEffect } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronUp, ChevronDown, ListTodo, Clock, UserMinus, XCircle } from "lucide-react"
import { DraggableTask } from "./DraggableTask"

const LIST_CONFIGS = {
  "Do Now": {
    title: "Do Now",
    icon: <ListTodo className="h-5 w-5" />,
    color: "bg-green-100 dark:bg-[linear-gradient(45deg,#022c22,#075985)] hover:bg-green-200 dark:hover:opacity-90",
    description: "Important and urgent tasks that need immediate attention",
  },
  Schedule: {
    title: "Schedule",
    icon: <Clock className="h-5 w-5" />,
    color: "bg-yellow-100 dark:bg-[linear-gradient(45deg,#422006,#854d0f)] hover:bg-yellow-200 dark:hover:opacity-90",
    description: "Important but not urgent tasks to plan for later",
  },
  Delegate: {
    title: "Delegate",
    icon: <UserMinus className="h-5 w-5" />,
    color: "bg-blue-100 dark:bg-[linear-gradient(45deg,#172554,#1e3a8a)] hover:bg-blue-200 dark:hover:opacity-90",
    description: "Urgent but not important tasks to assign to others",
  },
  Avoid: {
    title: "Nope",
    icon: <XCircle className="h-5 w-5" />,
    color: "bg-gray-100 dark:bg-[linear-gradient(45deg,#18181b,#27272a)] hover:bg-gray-200 dark:hover:opacity-90",
    description: "Neither important nor urgent tasks to minimize",
  },
}

interface DroppableSectionProps {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  tasks: Task[]
  isExpanded: boolean
  onToggleExpand: (isOpen: boolean) => void
  taskCount: number
  isLoading: boolean
  onTaskAction: {
    onToggleExpand: (id: number) => void
    onToggleComplete: (id: number) => void
    onArchive: (id: number) => void
    onDelete: (id: number) => void
    onShare?: (task: Task) => void
    onCalendar?: (task: Task) => void
    onEdit: (task: Task) => void
  }
  editingState: {
    editingTask: number | null
    editValue: string
    onEditChange: (value: string) => void
    onEditSave: (id: number) => void
  }
  expandedItems: Set<number>
}

type Task = {
  id: number
  text: string
  importance?: boolean
  urgency?: boolean
  priority?: "Do Now" | "Schedule" | "Delegate" | "Avoid"
  completed: boolean
  archived?: boolean
}

export const DroppableSection = memo(function DroppableSection({
  id,
  title,
  icon,
  color,
  tasks,
  isExpanded,
  onToggleExpand,
  taskCount,
  isLoading,
  onTaskAction,
  editingState,
  expandedItems,
}: DroppableSectionProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  // Move the state update to useEffect
  useEffect(() => {
    if (isOver && !isExpanded) {
      onToggleExpand(true)
    }
  }, [isOver, isExpanded, onToggleExpand])

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onToggleExpand}
      className={cn(
        "bg-white dark:bg-black/40 rounded-lg overflow-hidden h-fit transition-all duration-200",
        "dark:border-0 dark:shadow-lg dark:shadow-black/20",
        color,
        isOver && "ring-2 ring-primary ring-opacity-50"
      )}
    >
      <div 
        ref={setNodeRef}
        className={cn(
          "flex items-center justify-between p-2",
          isOver && !isExpanded && "bg-primary/10"
        )}
      >
        <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
          {icon}
          <h2 className="text-xl font-semibold">
            {title}
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-300">
              ({isLoading ? 0 : taskCount})
            </span>
          </h2>
        </div>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent
        className={cn(
          "transition-all duration-200 ease-in-out",
          isExpanded ? "pt-4 max-h-[500px]" : "max-h-0",
        )}
      >
        <div className="px-4 md:px-6 pb-4 overflow-y-auto">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  isExpanded={expandedItems.has(task.id)}
                  onToggleExpand={onTaskAction.onToggleExpand}
                  onToggleComplete={onTaskAction.onToggleComplete}
                  onArchive={onTaskAction.onArchive}
                  onDelete={onTaskAction.onDelete}
                  onShare={onTaskAction.onShare}
                  onCalendar={onTaskAction.onCalendar}
                  onEdit={onTaskAction.onEdit}
                  isEditing={editingState.editingTask === task.id}
                  editValue={editingState.editValue}
                  onEditChange={editingState.onEditChange}
                  onEditSave={editingState.onEditSave}
                />
              ))}
            </ul>
          </SortableContext>
          {tasks.length === 0 && (
            <div className="text-center py-8 px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-black/60 mb-4">
                {icon}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {LIST_CONFIGS[id as keyof typeof LIST_CONFIGS]?.description || "Drop tasks here"}
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}) 