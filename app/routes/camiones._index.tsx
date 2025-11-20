import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, useNavigate } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getAllCamiones, type Camion } from "~/lib/database.server";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { CamionTable } from "~/components/camiones/CamionTable";
import { CamionFilters } from "~/components/camiones/CamionFilters";
import { Pagination } from "~/components/ui/Pagination";
import { CamionTableSkeleton } from "~/components/camiones/CamionSkeleton";
import { SkeletonCard } from "~/components/ui/Skeleton";
import { useNavigationLoading } from "~/hooks/useNavigationLoading";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;
  
  try {
    const camiones = await getAllCamiones();
    
    // Filtrar por búsqueda si existe
    const filteredCamiones = search 
      ? camiones.filter(camion => {
          const searchTerm = search.toLowerCase();
          return (
            camion.nombre.toLowerCase().includes(searchTerm) ||
            camion.id.toString().includes(searchTerm) ||
            `camion ${camion.id}`.toLowerCase().includes(searchTerm) ||
            `vehiculo ${camion.id}`.toLowerCase().includes(searchTerm)
          );
        })
      : camiones;
    
    // Paginación
    const total = filteredCamiones.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedCamiones = filteredCamiones.slice(offset, offset + limit);
    
    return {
      camiones: paginatedCamiones,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      search
    };
  } catch (error) {
    console.error("Error loading camiones:", error);
    return {
      camiones: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
      },
      search
    };
  }
}

export default function CamionesIndex() {
  const { camiones, pagination, search } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoading } = useNavigationLoading();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset page when searching
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleNewCamion = () => {
    navigate("/camiones/nuevo");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader
          title="Camiones"
          subtitle="Gestiona tu flota de camiones"
          action={
            <Button disabled>
              + Nuevo Camión
            </Button>
          }
        />

        <SkeletonCard className="mb-6 p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </SkeletonCard>

        <Card padding="none" className="overflow-hidden">
          <CamionTableSkeleton />
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Camiones"
        subtitle={`Gestiona tu flota de camiones (${pagination.total} vehículos)`}
        action={
          <Button onClick={handleNewCamion}>
            + Nuevo Camión
          </Button>
        }
      />

      <CamionFilters
        searchValue={search}
        onSearchChange={handleSearch}
        onNewCamion={handleNewCamion}
      />

      <Card padding="none" className="overflow-hidden">
        <CamionTable camiones={camiones} />
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemsPerPage={10}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={handlePageChange}
        />
      </Card>
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}