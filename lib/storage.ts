type Task = {
  id: number
  text: string
  importance?: boolean
  urgency?: boolean
  priority?: "Do Now" | "Schedule" | "Delegate" | "Avoid"
  completed: boolean
  archived?: boolean
}

const STORAGE_KEY = 'nopes_tasks'
const THEME_KEY = 'nopes_theme'

export const storage = {
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  },

  saveTasks: (tasks: Task[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  },

  getTheme: (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light'
  },

  saveTheme: (theme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return
    localStorage.setItem(THEME_KEY, theme)
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  },

  // Helper to emit a storage event for cross-tab sync
  emitChange: () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY
    }))
  }
} 