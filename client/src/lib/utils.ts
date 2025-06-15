import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Less than an hour ago"
  if (diffInHours === 1) return "1 hour ago"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return "1 day ago"
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return formatDate(dateObj)
}

export function getStatusColor(status: string): string {
  const statusColors = {
    active: "bg-success/10 text-success",
    trial: "bg-warning/10 text-warning",
    cancelled: "bg-destructive/10 text-destructive",
    past_due: "bg-orange-100 text-orange-600",
    pending: "bg-warning/10 text-warning",
    failed: "bg-destructive/10 text-destructive",
    paid: "bg-success/10 text-success",
    resolved: "bg-success/10 text-success",
  }
  
  return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-600"
}

export function calculateChurnRate(cancelled: number, total: number): number {
  if (total === 0) return 0
  return Math.round((cancelled / total) * 100 * 10) / 10
}

export function calculateGrowthRate(current: number, previous: number): {
  rate: number
  isPositive: boolean
  formatted: string
} {
  if (previous === 0) return { rate: 0, isPositive: true, formatted: "0%" }
  
  const rate = ((current - previous) / previous) * 100
  const isPositive = rate >= 0
  const formatted = `${isPositive ? '+' : ''}${Math.round(rate * 10) / 10}%`
  
  return { rate: Math.abs(rate), isPositive, formatted }
}
