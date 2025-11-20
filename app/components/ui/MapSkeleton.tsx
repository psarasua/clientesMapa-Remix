import { SkeletonMap, Skeleton } from "~/components/ui/Skeleton";

export function MapPageSkeleton({ 
  title = "Mapa", 
  subtitle = "Cargando ubicaciones..." 
}: { 
  title?: string; 
  subtitle?: string; 
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Filters/Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Map Container */}
      <div className="flex space-x-4" style={{ height: '600px' }}>
        {/* Sidebar */}
        <div className="w-1/3 space-y-3">
          <Skeleton className="h-6 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Map */}
        <div className="flex-1">
          <SkeletonMap className="h-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function OptimizedRouteSkeleton() {
  return (
    <div className="space-y-6">
      {/* Route Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
        
        {/* Route Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <SkeletonMap className="h-[500px]" />
      </div>

      {/* Route Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 border border-gray-200 rounded">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}