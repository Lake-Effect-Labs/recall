'use client'

import { useEffect, useState } from 'react'

interface DateDisplayProps {
  date: string | Date
  format?: 'short' | 'long' | 'relative'
}

export function DateDisplay({ date, format = 'short' }: DateDisplayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder that matches server render to avoid hydration mismatch
    // Use a consistent format that won't differ between server and client
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const year = dateObj.getUTCFullYear()
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getUTCDate()).padStart(2, '0')
    return <span>{year}-{month}-{day}</span>
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'relative') {
    return <span>{formatRelativeDate(dateObj)}</span>
  }

  if (format === 'long') {
    return (
      <span>
        {dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </span>
    )
  }

  // Short format
  return (
    <span>
      {dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })}
    </span>
  )
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

