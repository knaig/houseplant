'use client'

import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md', 
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div className={cn('animate-spin rounded-full border-b-2 border-green-600', sizeClasses[size])} />
      <p className={cn('text-gray-600', textSizeClasses[size])}>{message}</p>
    </div>
  )
}

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function LoadingOverlay({ isVisible, message = 'Processing...' }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

interface SuccessStateProps {
  message: string
  onClose?: () => void
  className?: string
}

export function SuccessState({ message, onClose, className }: SuccessStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <span className="text-2xl text-green-600">✓</span>
      </div>
      <p className="text-gray-600 text-center">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-2xl text-red-600">✗</span>
      </div>
      <p className="text-gray-600 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
