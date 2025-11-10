import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getClienteById } from "~/lib/database.server";
import type { Cliente, SessionUser } from "~/types/database";
import { ClienteMap, LeafletStyles } from "~/components/clientes/ClienteMap";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await redirectIfNotAuthenticated(request);
  
  if (!params.id) {
    throw new Response("ID de cliente requerido", { status: 400 });
  }

  const cliente = await getClienteById(parseInt(params.id));
  
  if (!cliente) {
    throw new Response("Cliente no encontrado", { status: 404 });
  }

  return { user, cliente };
}

export default function ClienteDetalle() {
  const { user, cliente } = useLoaderData<{ user: SessionUser; cliente: Cliente }>();

  // Validar coordenadas
  const lat = cliente.latitud ? parseFloat(cliente.latitud.toString()) : null;
  const lng = cliente.longitud ? parseFloat(cliente.longitud.toString()) : null;
  const hasValidCoordinates = lat && lng && !isNaN(lat) && !isNaN(lng);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/clientes"
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Volver a Clientes
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/clientes/${cliente.id}/editar`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ✏️ Editar Cliente
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel Izquierdo - Información del Cliente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              
              {/* Header del Cliente con gradiente */}
              <div className="bg-linear-to-br from-blue-600 to-blue-700 px-6 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold mb-1">
                      {cliente.nombre}
                    </h1>
                    <p className="text-blue-100 text-sm">
                      Cliente #{cliente.id}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    cliente.estado === 'Activo' 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    cliente.estado === 'Activo' 
                      ? 'bg-green-500 bg-opacity-20 text-green-100' 
                      : 'bg-red-500 bg-opacity-20 text-red-100'
                  }`}>
                    {cliente.estado || 'Activo'}
                  </span>
                </div>
              </div>

              {/* Información Organizadas en Tarjetas */}
              <div className="p-6 space-y-4">
                
                {/* Datos de Contacto */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    Contacto
                  </h3>
                  <div className="space-y-2">
                    <InfoRow
                      label="Teléfono"
                      value={cliente.telefono || 'No registrado'}
                      icon="phone"
                    />
                    <InfoRow
                      label="RUT"
                      value={cliente.rut || 'No registrado'}
                      icon="id"
                    />
                  </div>
                </div>

                {/* Ubicación */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Ubicación
                  </h3>
                  <div className="space-y-2">
                    <InfoRow
                      label="Dirección"
                      value={cliente.direccion}
                      icon="location"
                    />
                    {hasValidCoordinates && (
                      <InfoRow
                        label="Coordenadas"
                        value={
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs bg-white px-2 py-1 rounded border text-gray-700">
                              {lat!.toFixed(4)}, {lng!.toFixed(4)}
                            </span>
                            <button
                              onClick={() => {
                                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                                window.open(googleMapsUrl, '_blank');
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Abrir en Google Maps"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                              </svg>
                            </button>
                          </div>
                        }
                        icon="coordinates"
                      />
                    )}
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Información Adicional
                  </h3>
                  <div className="space-y-2">
                    {cliente.razonsocial && (
                      <InfoRow
                        label="Razón Social"
                        value={cliente.razonsocial}
                        icon="company"
                      />
                    )}
                    {cliente.codigoalte && (
                      <InfoRow
                        label="Código Alt."
                        value={cliente.codigoalte}
                        icon="code"
                      />
                    )}
                    <InfoRow
                      label="Fecha de registro"
                      value={new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      icon="calendar"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Panel Derecho - Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Ubicación en el Mapa
                </h2>
              </div>

              <div className="p-6">
                {hasValidCoordinates ? (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <ClienteMap
                      clientes={[{
                        ...cliente,
                        latitud: lat!,
                        longitud: lng!
                      }]}
                      selectedClienteId={cliente.id}
                      centerOnClientes={true}
                      showRouteLines={false}
                      style={{ height: '500px', width: '100%' }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sin Ubicación</h3>
                    <p className="text-gray-600 mb-4">Este cliente no tiene coordenadas registradas.</p>
                    <Link
                      to={`/clientes/${cliente.id}/editar`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Agregar Coordenadas
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de Leaflet */}
      <LeafletStyles />
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon: string;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  const getIcon = (iconType: string) => {
    const iconClass = "w-3 h-3 text-gray-500";
    switch (iconType) {
      case 'phone':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
        );
      case 'id':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
          </svg>
        );
      case 'location':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      case 'coordinates':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
        );
      case 'company':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        );
      case 'code':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
        );
      case 'calendar':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="flex items-start justify-between py-1">
      <div className="flex items-center space-x-2 flex-1">
        {getIcon(icon)}
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </div>
      <div className="text-xs text-gray-900 font-medium text-right">
        {value}
      </div>
    </div>
  );
}