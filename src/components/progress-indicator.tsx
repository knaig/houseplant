'use client'

import { cn } from '@/lib/utils'

interface ProgressStep {
  id: string
  title: string
  description?: string
  completed: boolean
  current: boolean
}

interface ProgressIndicatorProps {
  steps: ProgressStep[]
  className?: string
}

export function ProgressIndicator({ steps, className }: ProgressIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium',
                  step.completed
                    ? 'bg-green-600 text-white'
                    : step.current
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="mt-1 sm:mt-2 text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-900">{step.title}</p>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-1 sm:mx-4',
                  steps[index + 1].completed || steps[index + 1].current
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Simplified progress bar for single processes
interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  className?: string
}

export function ProgressBar({ progress, label, className }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
