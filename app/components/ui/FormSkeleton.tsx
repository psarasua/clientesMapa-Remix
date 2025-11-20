import { SkeletonForm } from "~/components/ui/Skeleton";

export function FormPageSkeleton({ 
  title = "Formulario", 
  subtitle = "Cargando..." 
}: { 
  title?: string; 
  subtitle?: string; 
}) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <SkeletonForm />
      
      <div className="flex justify-end space-x-4 mt-8">
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton({ 
  title = "Detalle", 
  subtitle = "Cargando..." 
}: { 
  title?: string; 
  subtitle?: string; 
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-6">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}