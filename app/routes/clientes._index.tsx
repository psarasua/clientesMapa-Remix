import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, useNavigate } from "react-router";
import { useState } from "react";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getAllClientes, type Cliente } from "~/lib/database.server";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { ClienteTable } from "~/components/clientes/ClienteTable";
import { ClienteFilters } from "~/components/clientes/ClienteFilters";
import { ClienteMap, LeafletStyles } from "~/components/clientes/ClienteMap";
import { Pagination } from "~/components/ui/Pagination";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { 
  ClienteTableSkeleton, 
  ClienteFiltersSkeleton 
} from "~/components/clientes/ClienteSkeleton";
import { SkeletonMap } from "~/components/ui/Skeleton";
import { useNavigationLoading } from "~/hooks/useNavigationLoading";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;
  
  try {
    const clientes = await getAllClientes();
    
    // Filtrar por búsqueda si existe
    const filteredClientes = search 
      ? clientes.filter(cliente => {
          const searchTerm = search.toLowerCase();
          return (
            cliente.nombre.toLowerCase().includes(searchTerm) ||
            cliente.direccion.toLowerCase().includes(searchTerm) ||
            (cliente.sucursal && cliente.sucursal.toLowerCase().includes(searchTerm)) ||
            (cliente.departamento && cliente.departamento.toLowerCase().includes(searchTerm)) ||
            (cliente.localidad && cliente.localidad.toLowerCase().includes(searchTerm)) ||
            (cliente.rut && cliente.rut.toLowerCase().includes(searchTerm)) ||
            (cliente.telefono && cliente.telefono.toLowerCase().includes(searchTerm))
          );
        })
      : clientes;
    
    // Paginación
    const total = filteredClientes.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedClientes = filteredClientes.slice(offset, offset + limit);
    
    return {
      clientes: paginatedClientes,
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
    console.error("Error loading clientes:", error);
    return {
      clientes: [],
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

export default function ClientesIndex() {
  const { clientes, pagination, search } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>();
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

  const handleNewCliente = () => {
    navigate("/clientes/nuevo");
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setSelectedClienteId(cliente.id);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader
          title="Clientes"
          subtitle="Gestiona todos tus clientes"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" disabled>
                🗺️ Ver Mapa
              </Button>
              <Button disabled>
                + Nuevo Cliente
              </Button>
            </div>
          }
        />

        <ClienteFiltersSkeleton />

        {showMap ? (
          <Card padding="md">
            <SkeletonMap className="h-[600px]" />
          </Card>
        ) : (
          <Card padding="none" className="overflow-hidden">
            <ClienteTableSkeleton />
          </Card>
        )}
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Clientes"
        subtitle={`Gestiona todos tus clientes (${pagination.total} registros)`}
        action={
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? '📋 Ver Lista' : '🗺️ Ver Mapa'}
            </Button>
            <Button onClick={handleNewCliente}>
              + Nuevo Cliente
            </Button>
          </div>
        }
      />

      <ClienteFilters
        searchValue={search}
        onSearchChange={handleSearch}
      />

      {showMap ? (
        <Card padding="md">
          <ClienteMap 
            clientes={clientes}
            selectedClienteId={selectedClienteId}
            onClienteSelect={handleClienteSelect}
            centerOnClientes={true}
            showRouteLines={false}
            style={{ height: '600px', width: '100%' }}
          />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <ClienteTable clientes={clientes} />
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
      )}
      
      {/* Estilos de Leaflet */}
      <LeafletStyles />
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}