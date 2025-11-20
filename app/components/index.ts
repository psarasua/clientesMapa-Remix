// UI Components
export { Button } from "./ui/Button";
export { Card, CardHeader } from "./ui/Card";
export { Input, SearchInput } from "./ui/Input";
export { Pagination } from "./ui/Pagination";
export { PageLayout, PageHeader } from "./ui/Layout";
export { MapComponent, useLeaflet, useLeafletComponents } from "./ui/MapComponent";
export { LoadingSpinner, PageLoading, LoadingOverlay } from "./ui/Loading";
export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonStats, 
  SkeletonMap, 
  SkeletonForm 
} from "./ui/Skeleton";
export { FormPageSkeleton, DetailPageSkeleton } from "./ui/FormSkeleton";
export { MapPageSkeleton, OptimizedRouteSkeleton } from "./ui/MapSkeleton";

// Cliente Components
export { ClienteTable } from "./clientes/ClienteTable";
export { ClienteFilters } from "./clientes/ClienteFilters";
export { ClienteMap, LeafletStyles } from "./clientes/ClienteMap";
export { 
  ClienteTableSkeleton, 
  ClienteFiltersSkeleton, 
  ClienteCardSkeleton, 
  ClienteSelectorSkeleton 
} from "./clientes/ClienteSkeleton";

// Camion Components
export { CamionTable } from "./camiones/CamionTable";
export { CamionFilters } from "./camiones/CamionFilters";
export { 
  CamionTableSkeleton, 
  CamionCardSkeleton 
} from "./camiones/CamionSkeleton";

// Reparto Components
export { RepartoTable } from "./repartos/RepartoTable";
export { RepartoFilters } from "./repartos/RepartoFilters";
export { ClienteSelector } from "./repartos/ClienteSelector";
export { 
  RepartoTableSkeleton, 
  RepartoFiltersSkeleton, 
  RepartoCardSkeleton 
} from "./repartos/RepartoSkeleton";

// Ruta Components
export { RutaTable } from "./rutas/RutaTable";
export { RutaOptimizadaView } from "./rutas/RutaOptimizadaView";
export { RutaMap } from "./rutas/RutaMap";
export { 
  RutaTableSkeleton, 
  RutaMapSkeleton, 
  RutaCardSkeleton 
} from "./rutas/RutaSkeleton";

// Dashboard Components
export { DashboardMap } from "./dashboard/DashboardMap";
export { 
  DashboardSkeleton, 
  DashboardStatsSkeleton, 
  DashboardMapSkeleton 
} from "./dashboard/DashboardSkeleton";