interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 1, className = "" }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className = "" }: SkeletonTableProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className={`h-4 ${
                    colIndex === 0 ? 'w-16' : 
                    colIndex === columns - 1 ? 'w-32' : 'w-24'
                  }`} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonStatsProps {
  count?: number;
  className?: string;
}

export function SkeletonStats({ count = 4, className = "" }: SkeletonStatsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center">
            <div className="flex-1">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SkeletonMapProps {
  className?: string;
}

export function SkeletonMap({ className = "" }: SkeletonMapProps) {
  return (
    <div className={`bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-16 w-16 rounded-full mb-4 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
      
      {/* Simular marcadores */}
      <div className="absolute top-4 left-4">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="absolute top-12 right-8">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="absolute bottom-8 left-12">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      
      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-3 border border-gray-200">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

interface SkeletonFormProps {
  fields?: number;
  className?: string;
}

export function SkeletonForm({ fields = 4, className = "" }: SkeletonFormProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 space-y-6 ${className}`}>
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}