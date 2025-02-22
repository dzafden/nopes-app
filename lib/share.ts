// Check if Web Share API is available
const canShare = () => {
  return typeof navigator !== 'undefined' && !!navigator.share
}

export const shareTask = async (text: string) => {
  try {
    if (canShare()) {
      // Use Web Share API for mobile devices
      await navigator.share({
        text: text,
        title: 'Task from Nopes'
      })
    } else {
      // Fallback for desktop: copy to clipboard
      await navigator.clipboard.writeText(text)
      // Return true to indicate success (we'll use this to show a toast)
      return true
    }
  } catch (error) {
    // Check if the error is due to user canceling the share
    if (error instanceof Error && error.name === 'AbortError') {
      // User canceled the share, return silently
      return false
    }
    // For other errors, rethrow
    throw error
  }
} 