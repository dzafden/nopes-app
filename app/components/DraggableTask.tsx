"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  Share2,
  Archive,
  Pencil,
  Trash2,
  GripVertical,
  XCircle
} from "lucide-react"

interface DraggableTaskProps {
  task: Task
  isExpanded: boolean
  onToggleExpand: (id: number) => void
  onToggleComplete: (id: number) => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
  onShare?: (task: Task) => void
  onCalendar?: (task: Task) => void
  onEdit: (task: Task) => void
  isEditing: boolean
  editValue: string
  onEditChange: (value: string) => void
  onEditSave: (id: number) => void
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

export function DraggableTask({
  task,
  isExpanded,
  onToggleExpand,
  onToggleComplete,
  onArchive,
  onDelete,
  onShare,
  onCalendar,
  onEdit,
  isEditing,
  editValue,
  onEditChange,
  onEditSave,
}: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col p-3 rounded-lg transition-all duration-200",
        task.completed
          ? "bg-gray-100 dark:bg-black/60"
          : "bg-white dark:bg-black/40 shadow-sm hover:shadow dark:shadow-none dark:border dark:border-gray-950",
        isExpanded && "shadow-md dark:shadow-none",
      )}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-start space-x-3">
          <div className="pt-0.5">
            {task.priority === "Avoid" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onArchive(task.id)}
                className="p-1 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <XCircle className="h-4 w-4 text-gray-400" />
              </Button>
            ) : (
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id)}
              />
            )}
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggleExpand(task.id)}>
            {isEditing ? (
              <Input
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onEditSave(task.id)}
                onBlur={() => onEditSave(task.id)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p
                className={cn(
                  "transition-all duration-200",
                  !isExpanded && "line-clamp-1",
                  task.completed && "line-through text-gray-500 dark:text-gray-400",
                )}
              >
                {task.text}
              </p>
            )}
          </div>
          <div
            {...attributes}
            {...listeners}
            className="touch-none cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {isExpanded && (
          <div className="flex justify-end gap-1.5">
            {task.priority === "Schedule" && onCalendar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCalendar(task)
                }}
                className="p-1 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Calendar className="w-3 h-3 text-gray-400" />
              </Button>
            )}
            {task.priority === "Delegate" && onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onShare(task)
                }}
                className="p-1 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Share2 className="w-3 h-3 text-gray-400" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onArchive(task.id)
              }}
              className="p-1 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Archive className="w-3 h-3 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              className="p-1 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Pencil className="w-3 h-3 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="p-1 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Trash2 className="w-3 h-3 text-gray-400" />
            </Button>
          </div>
        )}
      </div>
    </li>
  )
} 