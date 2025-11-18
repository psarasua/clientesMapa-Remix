import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { useRef, useState } from "react";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getRepartoById, getClientesByRepartoId } from "~/lib/database.server";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { Button } from "~/components/ui/Button";
import { RepartoMapView } from "~/components/repartos/RepartoMapView";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const id = parseInt(params.id!);
  if (isNaN(id)) {
    throw new Response("ID de reparto inválido", { status: 400 });
  }

  try {
    const [reparto, clientesDelReparto] = await Promise.all([
      getRepartoById(id),
      getClientesByRepartoId(id)
    ]);

    if (!reparto) {
      throw new Response("Reparto no encontrado", { status: 404 });
    }

    return { 
      reparto,
      clientes: clientesDelReparto
    };
  } catch (error) {
    console.error("Error loading reparto map:", error);
    throw new Response("Error interno del servidor", { status: 500 });
  }
}

export default function RepartoMapPage() {
  const { reparto, clientes } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const mapRef = useRef<any>(null);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);

  const clientesConCoordenadas = clientes.filter(
    cliente => cliente.latitud && cliente.longitud
  );

  const handleClienteClick = (clienteId: number) => {
    setSelectedClienteId(clienteId);
    // La función zoomToCliente será llamada desde el componente del mapa
    if (mapRef.current && mapRef.current.zoomToCliente) {
      mapRef.current.zoomToCliente(clienteId);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={`🗺️ Mapa del Reparto #${reparto.id}`}
        subtitle={`${clientesConCoordenadas.length} de ${clientes.length} clientes con ubicación`}
        action={
          <Button 
            variant="secondary" 
            onClick={() => navigate('/repartos')}
          >
            ← Volver a Repartos
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Mapa de Reparto #{reparto.id}
              </h3>
              <p className="text-sm text-gray-600">
                {clientesConCoordenadas.length} de {clientes.length} clientes con coordenadas
              </p>
            </div>
            {reparto.camion_nombre && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Camión:</span> {reparto.camion_nombre}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex" style={{ height: '700px' }}>
          {/* Lista de clientes a la izquierda */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-md font-semibold text-gray-900">
                  📋 Lista de Clientes
                </h4>
                <button
                  onClick={() => {
                    setSelectedClienteId(null);
                    if (mapRef.current && mapRef.current.showAllClientes) {
                      mapRef.current.showAllClientes();
                    }
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                  title="Ver todos los clientes"
                >
                  🗺️ Ver Todos
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-2 rounded border border-blue-200">
                💡 Haz clic en cualquier cliente para centrar el mapa en su ubicación
              </p>
              
              {clientesConCoordenadas.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-600">Sin ubicaciones disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientesConCoordenadas.map((cliente, index) => (
                    <div 
                      key={cliente.id} 
                      className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 ${
                        selectedClienteId === cliente.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleClienteClick(cliente.id)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 transition-colors ${
                          selectedClienteId === cliente.id ? 'bg-blue-700' : 'bg-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {cliente.nombre}
                          </h5>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            📍 {cliente.direccion}
                          </p>
                          {cliente.telefono && (
                            <p className="text-xs text-gray-500 mt-1">
                              📞 {cliente.telefono}
                            </p>
                          )}
                          {cliente.rut && (
                            <p className="text-xs text-gray-500">
                              🆔 {cliente.rut}
                            </p>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            ID: {cliente.id}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Resumen */}
              {clientes.length > clientesConCoordenadas.length && (
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-yellow-800">
                      {clientes.length - clientesConCoordenadas.length} cliente{clientes.length - clientesConCoordenadas.length !== 1 ? 's' : ''} sin coordenadas
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mapa a la derecha */}
          <div className="flex-1">
            <RepartoMapView 
              ref={mapRef}
              clientes={clientes}
              repartoId={reparto.id}
              onClienteClick={setSelectedClienteId}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}