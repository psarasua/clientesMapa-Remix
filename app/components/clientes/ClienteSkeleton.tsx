import { Skeleton, SkeletonCard } from "~/components/ui/Skeleton";

interface ClienteTableSkeletonProps {
  rows?: number;
}

export function ClienteTableSkeleton({ rows = 8 }: ClienteTableSkeletonProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-16" /> {/* ID */}
          <Skeleton className="h-4 w-32" /> {/* NOMBRE */}
          <Skeleton className="h-4 w-48" /> {/* DIRECCIÓN */}
          <Skeleton className="h-4 w-24" /> {/* TELÉFONO */}
          <Skeleton className="h-4 w-20" /> {/* RUT */}
          <Skeleton className="h-4 w-20" /> {/* ACCIONES */}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
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

export function ClienteFiltersSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
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

export function ClienteCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
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

export function ClienteSelectorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      
      {/* Search */}
      <Skeleton className="h-10 w-full rounded-md" />
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 rounded mr-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      
      {/* Lista */}
      <div className="border border-gray-200 rounded-md">
        <div className="max-h-96 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 rounded mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-64 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}