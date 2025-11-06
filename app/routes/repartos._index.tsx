import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, useNavigate } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { 
  getRepartosWithDetails, 
  getAllCamiones,
  getAllRutas,
  type RepartoWithDetails 
} from "~/lib/database.server";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { RepartoTable } from "~/components/repartos/RepartoTable";
import { RepartoFilters } from "~/components/repartos/RepartoFilters";
import { Pagination } from "~/components/ui/Pagination";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const camionId = url.searchParams.get("camion");
  const rutaId = url.searchParams.get("ruta");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;
  
  try {
    // Obtener datos para filtros
    const [repartos, camiones, rutas] = await Promise.all([
      getRepartosWithDetails(),
      getAllCamiones(),
      getAllRutas()
    ]);
    
    // Aplicar filtros
    let filteredRepartos = repartos;
    
    // Filtro por búsqueda (ID, camión, ruta)
    if (search) {
      filteredRepartos = filteredRepartos.filter(reparto => 
        reparto.id.toString().includes(search) ||
        reparto.camion?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        reparto.ruta?.nombre.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filtro por camión
    if (camionId) {
      filteredRepartos = filteredRepartos.filter(reparto => 
        reparto.camion_id?.toString() === camionId
      );
    }
    
    // Filtro por ruta
    if (rutaId) {
      filteredRepartos = filteredRepartos.filter(reparto => 
        reparto.ruta_id?.toString() === rutaId
      );
    }
    
    // Paginación
    const total = filteredRepartos.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedRepartos = filteredRepartos.slice(offset, offset + limit);
    
    return {
      repartos: paginatedRepartos,
      camiones,
      rutas,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        camionId,
        rutaId
      }
    };
  } catch (error) {
    console.error("Error loading repartos:", error);
    return {
      repartos: [],
      camiones: [],
      rutas: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
      },
      filters: {
        search: "",
        camionId: null,
        rutaId: null
      }
    };
  }
}

export default function RepartosIndex() {
  const { repartos, camiones, rutas, pagination, filters } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const handleCamionChange = (camionId: string) => {
    const params = new URLSearchParams(searchParams);
    if (camionId) {
      params.set("camion", camionId);
    } else {
      params.delete("camion");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleRutaChange = (rutaId: string) => {
    const params = new URLSearchParams(searchParams);
    if (rutaId) {
      params.set("ruta", rutaId);
    } else {
      params.delete("ruta");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleNewReparto = () => {
    navigate("/repartos/nuevo");
  };

  return (
    <PageLayout>
      <PageHeader
        title="Repartos"
        subtitle={`Planificación y gestión de repartos (${pagination.total} repartos)`}
        action={
          <Button onClick={handleNewReparto}>
            + Nuevo Reparto
          </Button>
        }
      />

      <RepartoFilters
        searchValue={filters.search}
        onSearchChange={handleSearch}
        onNewReparto={handleNewReparto}
        selectedCamion={filters.camionId || undefined}
        selectedRuta={filters.rutaId || undefined}
        onCamionChange={handleCamionChange}
        onRutaChange={handleRutaChange}
        camiones={camiones}
        rutas={rutas}
      />

      <Card padding="none" className="overflow-hidden">
        <RepartoTable repartos={repartos} />
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