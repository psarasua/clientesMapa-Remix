import { Skeleton, SkeletonMap } from "~/components/ui/Skeleton";

export function RutaTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-16" /> {/* ID */}
          <Skeleton className="h-4 w-32" /> {/* NOMBRE */}
          <Skeleton className="h-4 w-28" /> {/* CLIENTES */}
          <Skeleton className="h-4 w-24" /> {/* ESTADO */}
          <Skeleton className="h-4 w-20" /> {/* ACCIONES */}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RutaMapSkeleton() {
  return (
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
      
      <div className="flex" style={{ height: '600px' }}>
        {/* Lista lateral */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 p-4 space-y-3">
          <Skeleton className="h-6 w-32 mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mapa */}
        <div className="flex-1">
          <SkeletonMap className="h-full" />
        </div>
      </div>
    </div>
  );
}

export function RutaCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="h-6 w-12 mx-auto mb-1" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="h-6 w-10 mx-auto mb-1" />
          <Skeleton className="h-3 w-18 mx-auto" />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}