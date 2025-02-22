// Platform detection
const isIOS = () => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

const isAndroid = () => {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export const getCalendarUrl = (title: string) => {
  // Encode the title for URL safety
  const encodedTitle = encodeURIComponent(title)
  
  // Base Google Calendar URL (web version)
  const googleWebUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}`
  
  // Platform specific handling
  if (isIOS()) {
    return {
      primary: `https://www.google.com/calendar/event?action=TEMPLATE&text=${encodedTitle}`,
      fallback: googleWebUrl
    }
  } else if (isAndroid()) {
    return {
      primary: `https://www.google.com/calendar/event?action=TEMPLATE&text=${encodedTitle}`,
      fallback: googleWebUrl
    }
  } else {
    // Desktop - open in browser
    return {
      primary: googleWebUrl,
      fallback: null
    }
  }
}

export const openCalendar = async (title: string) => {
  const urls = getCalendarUrl(title)
  
  // For all platforms, open in a new tab
  window.open(urls.primary, '_blank')
} 