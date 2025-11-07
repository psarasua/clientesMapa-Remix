import { Link } from "react-router";
import { useState } from "react";
import type { Cliente } from "~/lib/database.server";
import { ClienteMap, LeafletStyles } from "./ClienteMap";

interface ClienteTableProps {
  clientes: Cliente[];
}

export function ClienteTable({ clientes }: ClienteTableProps) {
  const [selectedClienteForMap, setSelectedClienteForMap] = useState<Cliente | null>(null);

  if (clientes.length === 0) {
    return <EmptyClienteState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <ClienteTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {clientes.map((cliente) => (
            <ClienteTableRow 
              key={cliente.id} 
              cliente={cliente}
              onViewLocation={() => setSelectedClienteForMap(cliente)} 
            />
          ))}
        </tbody>
      </table>

      {/* Modal del mapa */}
      {selectedClienteForMap && (
        <ClienteLocationModal 
          cliente={selectedClienteForMap}
          onClose={() => setSelectedClienteForMap(null)}
        />
      )}
      
      {/* Estilos de Leaflet */}
      <LeafletStyles />
    </div>
  );
}

function ClienteTableHeader() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Cliente
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Contacto
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ubicación
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Estado
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
}

interface ClienteTableRowProps {
  cliente: Cliente;
  onViewLocation: () => void;
}

function ClienteTableRow({ cliente, onViewLocation }: ClienteTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {cliente.nombre}
          </div>
          <div className="text-sm text-gray-500">
            ID: {cliente.id}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {cliente.telefono || "No registrado"}
        </div>
        <div className="text-sm text-gray-500">
          {cliente.rut || "Sin RUT"}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {cliente.direccion}
        </div>
        <div className="text-sm text-gray-500">
          {cliente.latitud && cliente.longitud 
            ? `${cliente.latitud}, ${cliente.longitud}`
            : "Sin coordenadas"
          }
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ClienteStatusBadge status={cliente.estado || "Activo"} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <ClienteActions cliente={cliente} onViewLocation={onViewLocation} />
      </td>
    </tr>
  );
}

interface ClienteStatusBadgeProps {
  status: string;
}

function ClienteStatusBadge({ status }: ClienteStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "inactivo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}

interface ClienteActionsProps {
  cliente: Cliente;
  onViewLocation: () => void;
}

function ClienteActions({ cliente, onViewLocation }: ClienteActionsProps) {
  const hasLocation = cliente.latitud && cliente.longitud;

  const handleViewLocationClick = () => {
    if (hasLocation) {
      onViewLocation();
    } else {
      alert('Este cliente no tiene coordenadas registradas');
    }
  };

  return (
    <div className="flex justify-end gap-1">
      {hasLocation && (
        <button
          onClick={handleViewLocationClick}
          className="text-green-600 hover:text-green-900 px-2 py-1 rounded-md hover:bg-green-50 flex items-center"
          title={`Ver ubicación: ${cliente.latitud}, ${cliente.longitud}`}
        >
          📍
        </button>
      )}
      <Link
        to={`/clientes/${cliente.id}`}
        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded-md hover:bg-blue-50 text-sm"
      >
        Ver
      </Link>
      <Link
        to={`/clientes/${cliente.id}/editar`}
        className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded-md hover:bg-yellow-50 text-sm"
      >
        Editar
      </Link>
    </div>
  );
}

interface ClienteLocationModalProps {
  cliente: Cliente;
  onClose: () => void;
}

function ClienteLocationModal({ cliente, onClose }: ClienteLocationModalProps) {
  // Validar que las coordenadas sean números válidos
  const lat = parseFloat(cliente.latitud?.toString() || '0');
  const lng = parseFloat(cliente.longitud?.toString() || '0');
  
  if (!cliente.latitud || !cliente.longitud || isNaN(lat) || isNaN(lng)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 transform animate-pulse">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ubicación No Disponible
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Este cliente no tiene coordenadas geográficas válidas configuradas para mostrar en el mapa.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300 ease-in-out">
        {/* Header del modal con gradiente */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Ubicación del Cliente</h2>
                <p className="text-blue-100 text-sm font-medium">{cliente.nombre}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group"
              title="Cerrar"
            >
              <svg className="w-5 h-5 text-white group-hover:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          {/* Información del cliente con diseño de tarjeta */}
          <div className="mb-6 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {cliente.nombre}
              </h3>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                cliente.estado === 'Activo' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  cliente.estado === 'Activo' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {cliente.estado || 'Activo'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección</p>
                    <p className="text-sm text-gray-900 font-medium">{cliente.direccion}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</p>
                    <p className="text-sm text-gray-900 font-medium">{cliente.telefono || 'No disponible'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coordenadas GPS</p>
                    <p className="text-xs text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa con marco mejorado */}
          <div className="mb-6 bg-gray-100 p-3 rounded-xl">
            <div className="bg-white rounded-lg overflow-hidden shadow-inner">
              <ClienteMap 
                clientes={[{
                  ...cliente,
                  latitud: lat,
                  longitud: lng
                }]}
                selectedClienteId={cliente.id}
                centerOnClientes={true}
                showRouteLines={false}
                style={{ height: '450px', width: '100%' }}
              />
            </div>
          </div>

          {/* Botones de acción mejorados */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                window.open(googleMapsUrl, '_blank');
              }}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Abrir en Google Maps
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyClienteState() {
  return (
    <div className="p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay clientes registrados
      </h3>
      <p className="text-gray-600 mb-6">
        Comienza agregando tu primer cliente
      </p>
      <Link
        to="/clientes/nuevo"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        + Agregar Cliente
      </Link>
    </div>
  );
}