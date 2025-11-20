import { Skeleton, SkeletonTable, SkeletonCard } from "~/components/ui/Skeleton";

interface RepartoTableSkeletonProps {
  rows?: number;
}

export function RepartoTableSkeleton({ rows = 5 }: RepartoTableSkeletonProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-24" /> {/* REPARTO ID */}
            <Skeleton className="h-4 w-20" />  {/* CAMIÓN */}
            <Skeleton className="h-4 w-16" />  {/* RUTA */}
            <Skeleton className="h-4 w-28" />  {/* TOTAL CLIENTES */}
            <Skeleton className="h-4 w-20" />  {/* ACCIONES */}
          </div>
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* ID */}
                <div className="w-12">
                  <Skeleton className="h-4 w-8" />
                </div>
                
                {/* Camión */}
                <div className="w-32">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                
                {/* Ruta */}
                <div className="w-32">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
                
                {/* Total Clientes */}
                <div className="w-28 text-center">
                  <Skeleton className="h-6 w-20 rounded-full mx-auto" />
                </div>
              </div>
              
              {/* Acciones */}
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

export function RepartoFiltersSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="w-48">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="w-48">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="w-32">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function RepartoCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div>
          <Skeleton className="h-4 w-12 mb-2" />
          <Skeleton className="h-5 w-20" />
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