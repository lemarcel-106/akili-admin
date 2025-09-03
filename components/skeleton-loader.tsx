"use client"

interface SkeletonLoaderProps {
  rows?: number
  columns?: number
  className?: string
}

export default function SkeletonLoader({ rows = 5, columns = 4, className = "" }: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {[...Array(columns)].map((_, index) => (
                <th key={index}>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex}>
                    <div className="flex items-center space-x-3">
                      {colIndex === 0 && (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      )}
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                        {Math.random() > 0.5 && (
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        )}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Skeleton pour les cartes de statistiques
export function StatsCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-background shadow-xl">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm-body">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton pour les formulaires
export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
        </div>
      ))}
      <div className="flex gap-4 mt-8">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1"></div>
        <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-xl flex-1"></div>
      </div>
    </div>
  )
}