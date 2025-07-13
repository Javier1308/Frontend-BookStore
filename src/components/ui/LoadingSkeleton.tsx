import type React from "react"
import { clsx } from "clsx"

interface LoadingSkeletonProps {
  className?: string
  lines?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className, lines = 1 }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={clsx("loading-skeleton h-4 mb-2 last:mb-0", className)} />
      ))}
    </div>
  )
}

export const BookCardSkeleton: React.FC = () => (
  <div className="card p-4 animate-pulse">
    <div className="loading-skeleton h-48 mb-4" />
    <div className="loading-skeleton h-4 mb-2" />
    <div className="loading-skeleton h-4 w-3/4 mb-2" />
    <div className="loading-skeleton h-4 w-1/2" />
  </div>
)
