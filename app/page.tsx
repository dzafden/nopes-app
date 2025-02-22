"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Clock,
  UserMinus,
  XCircle,
  Archive,
  Pencil,
  Calendar,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SwipeableTask } from "./components/SwipeableTask"
import { Tutorial } from "./components/Tutorial"
import { MainNav } from "./components/MainNav"
import { storage } from "@/lib/storage"
import { openCalendar } from "@/lib/calendar"
import { ConfirmDialog } from "./components/ConfirmDialog"
import { shareTask } from "@/lib/share"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type Task = {
  id: number
  text: string
  importance?: boolean
  urgency?: boolean
  priority?: "Do Now" | "Schedule" | "Delegate" | "Avoid"
  completed: boolean
  archived?: boolean
}

type ListConfig = {
  title: string
  icon: React.ReactNode
  color: string
  description: string
}

const LIST_CONFIGS: Record<string, ListConfig> = {
  "Do Now": {
    title: "Do Now",
    icon: <ListTodo className="h-5 w-5" />,
    color: "bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30",
    description: "Important and urgent tasks that need immediate attention",
  },
  Schedule: {
    title: "Schedule",
    icon: <Clock className="h-5 w-5" />,
    color: "bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-200 dark:hover:bg-yellow-900/30",
    description: "Important but not urgent tasks to plan for later",
  },
  Delegate: {
    title: "Delegate",
    icon: <UserMinus className="h-5 w-5" />,
    color: "bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30",
    description: "Urgent but not important tasks to assign to others",
  },
  Avoid: {
    title: "Nope",
    icon: <XCircle className="h-5 w-5" />,
    color: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
    description: "Neither important nor urgent tasks to minimize",
  },
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Do Now": true,
    Schedule: true,
    Delegate: true,
    Avoid: true,
  })
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tutorial_seen') !== 'true'
    }
    return true
  })
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [editingTask, setEditingTask] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [calendarTask, setCalendarTask] = useState<Task | null>(null)
  const { toast } = useToast()

  // Load initial tasks
  useEffect(() => {
    setTasks(storage.getTasks())
    setIsLoading(false)
  }, [])

  // Save tasks when they change
  useEffect(() => {
    if (!isLoading) {
      storage.saveTasks(tasks)
      storage.emitChange() // Notify other tabs
    }
  }, [tasks, isLoading])

  const closeTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem('tutorial_seen', 'true')
  }

  useEffect(() => {
    const newExpandedSections = Object.fromEntries(
      Object.entries(LIST_CONFIGS).map(([listName]) => [
        listName,
        tasks.some((task) => task.priority === listName && !task.completed && !task.archived),
      ]),
    )
    const hasUnprioritizedTasks = tasks.some((task) => !task.priority && !task.completed && !task.archived)
    if (hasUnprioritizedTasks) {
      newExpandedSections["Unprioritized"] = true
    }
    setExpandedSections(newExpandedSections)
  }, [tasks])

  const addTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]
      setTasks(updatedTasks)
      setNewTask("")
    }
  }

  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)
  }

  const toggleTaskCompletion = (id: number) => {
    const updatedTasks = tasks.map((task) => 
      task.id === id ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)
  }

  const toggleSection = (section: string, isOpen: boolean) => {
    const newExpandedSections = {
      ...expandedSections,
      [section]: isOpen,
    }
    setExpandedSections(newExpandedSections)
  }

  const handleSwipe = (taskId: number, direction: "left" | "right") => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        if (task.importance === undefined) {
          return { ...task, importance: direction === "right" }
        } else if (task.urgency === undefined) {
          const urgency = direction === "right"
          const priority = getPriority(task.importance, urgency)
          return { ...task, urgency, priority }
        }
      }
      return task
    })
    setTasks(updatedTasks)
  }

  const getPriority = (importance?: boolean, urgency?: boolean): Task["priority"] => {
    if (importance === undefined || urgency === undefined) return undefined
    if (importance && urgency) return "Do Now"
    if (importance && !urgency) return "Schedule"
    if (!importance && urgency) return "Delegate"
    return "Avoid"
  }

  const unprioritizedTasks = tasks.filter((task) => !task.priority && !task.completed && !task.archived)
  const completedTasks = tasks.filter((task) => task.completed)

  const toggleTaskExpansion = (taskId: number) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const startEdit = (task: Task) => {
    setEditingTask(task.id)
    setEditValue(task.text)
  }

  const saveEdit = (id: number) => {
    if (editValue.trim()) {
      setTasks(tasks.map((task) => (task.id === id ? { ...task, text: editValue.trim() } : task)))
    }
    setEditingTask(null)
    setEditValue("")
  }

  const archiveTask = (id: number) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, archived: true }
      }
      return task
    })
    setTasks(updatedTasks)
  }

  const handleCalendarClick = async (task: Task) => {
    setCalendarTask(task)
  }

  const handleCalendarConfirm = async () => {
    if (calendarTask) {
      await openCalendar(calendarTask.text)
      setCalendarTask(null)
    }
  }

  const handleShare = async (task: Task) => {
    try {
      const result = await shareTask(task.text)
      if (result) {
        toast({
          title: "Copied to clipboard",
          description: "The task has been copied to your clipboard",
        })
      }
    } catch (error) {
      console.error('Error sharing task:', error)
      toast({
        title: "Error sharing task",
        description: "There was an error sharing the task",
        variant: "destructive",
      })
    }
  }

  const renderTaskList = (tasks: Task[], showCheckbox = true) => (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={cn(
            "flex flex-col p-3 rounded-lg transition-all duration-200",
            task.completed
              ? "bg-gray-100 dark:bg-gray-800"
              : "bg-white dark:bg-gray-900 shadow-sm hover:shadow dark:shadow-gray-800",
            expandedItems.has(task.id) && "shadow-md",
          )}
        >
          <div className="flex flex-col space-y-2">
            <div className="flex items-start space-x-3">
              {showCheckbox && (
                <div className="pt-0.5">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(task.id)}>
                {editingTask === task.id ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && saveEdit(task.id)}
                    onBlur={() => saveEdit(task.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p
                    className={cn(
                      "transition-all duration-200",
                      !expandedItems.has(task.id) && "line-clamp-1",
                      task.completed && "line-through text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {task.text}
                  </p>
                )}
              </div>
            </div>
            {expandedItems.has(task.id) && (
              <div className="flex justify-end gap-1.5">
                {task.priority === "Schedule" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCalendarClick(task)
                    }}
                    className="p-1 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Calendar className="w-3 h-3 text-gray-400" />
                  </Button>
                )}
                {task.priority === "Delegate" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(task)
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
                    archiveTask(task.id)
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
                    startEdit(task)
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
                    deleteTask(task.id)
                  }}
                  className="p-1 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-gray-400" />
                </Button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )

  const renderEmptyState = (listName: string) => (
    <div className="text-center py-8 px-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        {LIST_CONFIGS[listName]?.icon || <ListTodo className="h-6 w-6 text-gray-400 dark:text-gray-500" />}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {LIST_CONFIGS[listName]?.description || "No tasks yet"}
      </p>
    </div>
  )

  const nopesCount = tasks.filter((task) => task.priority === "Avoid").length

  const getTaskCount = (priority: string) => {
    if (isLoading) return 0
    return tasks.filter(task => task.priority === priority && !task.completed && !task.archived).length
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <MainNav />
          <h1 className="flex-1 text-2xl text-center font-['IBM_Plex_Sans'] font-semibold text-primary">Nopes</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="w-12 h-12 rounded-full">
                  {nopesCount}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {nopesCount > 0 ? (
                  <>
                    <p>You noped out of {nopesCount} things!</p>
                    <p className="text-sm text-muted-foreground">Great work!</p>
                  </>
                ) : (
                  <>
                    <p>This counts all the things you nope out of.</p>
                    <p className="text-sm text-muted-foreground">"No" is a complete sentence.</p>
                  </>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <main className="container mx-auto pt-8 pb-20 px-2 sm:px-4 2xl:flex 2xl:gap-8">
        <div className="2xl:w-1/4 mb-8 2xl:mb-0">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
                className="flex-grow mr-2"
              />
              <Button onClick={addTask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {unprioritizedTasks.length > 0 && (
              <Collapsible
                open={expandedSections["Unprioritized"]}
                onOpenChange={(isOpen) => toggleSection("Unprioritized", isOpen)}
              >
                <div className="flex items-center justify-between mt-4">
                  <h2 className="text-xl font-semibold">Unprioritized Tasks</h2>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("Unprioritized", !expandedSections["Unprioritized"])}
                    >
                      {expandedSections["Unprioritized"] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pt-4">
                  <div className="space-y-2">
                    {unprioritizedTasks.map((task) => (
                      <SwipeableTask key={task.id} task={task} onSwipe={handleSwipe} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>

        <div className="2xl:w-3/4">
          <div className="grid gap-4 lg:gap-8 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4">
            {/* Important Tasks (left column in lg, first half in 2xl) */}
            <div className="space-y-4 lg:col-span-1 2xl:col-span-2 2xl:flex 2xl:gap-8">
              {/* Do Now section */}
              <div className="2xl:flex-1">
                <Collapsible
                  open={expandedSections["Do Now"]}
                  onOpenChange={(isOpen) => toggleSection("Do Now", isOpen)}
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-fit transition-all duration-200",
                    LIST_CONFIGS["Do Now"].color,
                  )}
                >
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      {LIST_CONFIGS["Do Now"].icon}
                      <h2 className="text-xl font-semibold">
                        {LIST_CONFIGS["Do Now"].title}
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({isLoading ? 0 : getTaskCount("Do Now")})
                        </span>
                      </h2>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection("Do Now", !expandedSections["Do Now"])}
                      >
                        {expandedSections["Do Now"] ? (
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
                      expandedSections["Do Now"] ? "pt-4 max-h-[500px]" : "max-h-0",
                    )}
                  >
                    <div className="px-4 md:px-6 pb-4 overflow-y-auto">
                      {tasks.filter((task) => task.priority === "Do Now" && !task.completed && !task.archived).length > 0
                        ? renderTaskList(tasks.filter((task) => task.priority === "Do Now" && !task.completed && !task.archived))
                        : renderEmptyState("Do Now")}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Schedule section */}
              <div className="2xl:flex-1">
                <Collapsible
                  open={expandedSections["Schedule"]}
                  onOpenChange={(isOpen) => toggleSection("Schedule", isOpen)}
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-fit transition-all duration-200",
                    LIST_CONFIGS["Schedule"].color,
                  )}
                >
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      {LIST_CONFIGS["Schedule"].icon}
                      <h2 className="text-xl font-semibold">
                        {LIST_CONFIGS["Schedule"].title}
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({isLoading ? 0 : getTaskCount("Schedule")})
                        </span>
                      </h2>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection("Schedule", !expandedSections["Schedule"])}
                      >
                        {expandedSections["Schedule"] ? (
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
                      expandedSections["Schedule"] ? "pt-4 max-h-[500px]" : "max-h-0",
                    )}
                  >
                    <div className="px-4 md:px-6 pb-4 overflow-y-auto">
                      {tasks.filter((task) => task.priority === "Schedule" && !task.completed && !task.archived).length > 0
                        ? renderTaskList(tasks.filter((task) => task.priority === "Schedule" && !task.completed && !task.archived))
                        : renderEmptyState("Schedule")}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            {/* Not Important Tasks (right column in lg, second half in 2xl) */}
            <div className="space-y-4 lg:col-span-1 2xl:col-span-2 2xl:flex 2xl:gap-8">
              {/* Delegate section */}
              <div className="2xl:flex-1">
                <Collapsible
                  open={expandedSections["Delegate"]}
                  onOpenChange={(isOpen) => toggleSection("Delegate", isOpen)}
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-fit transition-all duration-200",
                    LIST_CONFIGS["Delegate"].color,
                  )}
                >
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      {LIST_CONFIGS["Delegate"].icon}
                      <h2 className="text-xl font-semibold">
                        {LIST_CONFIGS["Delegate"].title}
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({isLoading ? 0 : getTaskCount("Delegate")})
                        </span>
                      </h2>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection("Delegate", !expandedSections["Delegate"])}
                      >
                        {expandedSections["Delegate"] ? (
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
                      expandedSections["Delegate"] ? "pt-4 max-h-[500px]" : "max-h-0",
                    )}
                  >
                    <div className="px-4 md:px-6 pb-4 overflow-y-auto">
                      {tasks.filter((task) => task.priority === "Delegate" && !task.completed && !task.archived).length > 0
                        ? renderTaskList(tasks.filter((task) => task.priority === "Delegate" && !task.completed && !task.archived))
                        : renderEmptyState("Delegate")}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Avoid/Nope section */}
              <div className="2xl:flex-1">
                <Collapsible
                  open={expandedSections["Avoid"]}
                  onOpenChange={(isOpen) => toggleSection("Avoid", isOpen)}
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-fit transition-all duration-200",
                    LIST_CONFIGS["Avoid"].color,
                  )}
                >
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                      {LIST_CONFIGS["Avoid"].icon}
                      <h2 className="text-xl font-semibold">
                        {LIST_CONFIGS["Avoid"].title}
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({isLoading ? 0 : getTaskCount("Avoid")})
                        </span>
                      </h2>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection("Avoid", !expandedSections["Avoid"])}
                      >
                        {expandedSections["Avoid"] ? (
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
                      expandedSections["Avoid"] ? "pt-4 max-h-[500px]" : "max-h-0",
                    )}
                  >
                    <div className="px-4 md:px-6 pb-4 overflow-y-auto">
                      {tasks.filter((task) => task.priority === "Avoid" && !task.completed && !task.archived).length > 0
                        ? renderTaskList(tasks.filter((task) => task.priority === "Avoid" && !task.completed && !task.archived))
                        : renderEmptyState("Avoid")}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toaster />
      <Tutorial isOpen={showTutorial} onClose={closeTutorial} />

      <ConfirmDialog
        isOpen={calendarTask !== null}
        onClose={() => setCalendarTask(null)}
        onConfirm={handleCalendarConfirm}
        title="Schedule Task"
        description="Do you want to schedule this task in your calendar?"
        confirmText="Open Calendar"
      />
    </div>
  )
}

