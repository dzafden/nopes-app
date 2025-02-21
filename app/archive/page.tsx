"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { storage } from "@/lib/storage"

type Task = {
  id: number
  text: string
  priority?: "Do Now" | "Schedule" | "Delegate" | "Avoid"
  completed: boolean
  archived?: boolean
  importance?: boolean
  urgency?: boolean
}

export default function ArchivePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])

  // Load initial tasks and listen for changes
  useEffect(() => {
    const loadTasks = () => {
      setTasks(storage.getTasks())
      setIsLoading(false)
    }

    loadTasks() // Initial load

    // Listen for changes from other tabs
    window.addEventListener('storage', loadTasks)
    
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadTasks()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('storage', loadTasks)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const completedTasks = tasks.filter((task) => task.completed && !task.archived)
  const avoidedTasks = tasks.filter((task) => task.priority === "Avoid" && !task.completed && !task.archived)
  const archivedTasks = tasks.filter((task) => task.archived)

  const restoreTask = (taskId: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, archived: false } : task
    )
    setTasks(updatedTasks)
    storage.saveTasks(updatedTasks)
    storage.emitChange()
  }

  const deleteTask = (taskId: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    storage.saveTasks(updatedTasks)
    storage.emitChange()
  }

  const renderTaskList = (taskList: Task[]) => (
    <ul className="space-y-2">
      {taskList.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
        >
          <span className="truncate text-sm">{task.text}</span>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => restoreTask(task.id)} className="h-8 px-2">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTask(task.id)}
              className="h-8 px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="flex-1 text-2xl text-center font-['IBM_Plex_Sans'] font-semibold text-primary">Archive</h1>
          <div className="w-8" /> {/* Spacer to balance the back button */}
        </div>
      </header>

      <main className="container mx-auto pt-6 pb-16">
        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="w-full mb-6 grid grid-cols-3 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm h-[72px]">
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full"
            >
              <div className="flex flex-col items-center py-2">
                <span className="font-medium">Completed</span>
                <span className="text-xs text-muted-foreground">{completedTasks.length}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="avoided"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full"
            >
              <div className="flex flex-col items-center py-2">
                <span className="font-medium">Noped</span>
                <span className="text-xs text-muted-foreground">{avoidedTasks.length}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full"
            >
              <div className="flex flex-col items-center py-2">
                <span className="font-medium">Archived</span>
                <span className="text-xs text-muted-foreground">{archivedTasks.length}</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <TabsContent value="completed" className="mt-0">
              {completedTasks.length > 0 ? (
                renderTaskList(completedTasks)
              ) : (
                <p className="text-center text-muted-foreground py-8">No completed tasks</p>
              )}
            </TabsContent>
            <TabsContent value="avoided" className="mt-0">
              {avoidedTasks.length > 0 ? (
                renderTaskList(avoidedTasks)
              ) : (
                <p className="text-center text-muted-foreground py-8">No noped tasks</p>
              )}
            </TabsContent>
            <TabsContent value="archived" className="mt-0">
              {archivedTasks.length > 0 ? (
                renderTaskList(archivedTasks)
              ) : (
                <p className="text-center text-muted-foreground py-8">No archived tasks</p>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}

