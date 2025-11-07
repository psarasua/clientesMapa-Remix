import { useEffect, useState } from 'react';
import type { Cliente } from '~/types/database';
import { MapComponent, useLeafletComponents } from '../ui/MapComponent';

interface ClienteMapProps {
  clientes: Cliente[];
  selectedClienteId?: number;
  onClienteSelect?: (cliente: Cliente) => void;
  centerOnClientes?: boolean;
  showRouteLines?: boolean;
  style?: React.CSSProperties;
}

export function ClienteMap({ 
  clientes, 
  selectedClienteId, 
  onClienteSelect,
  centerOnClientes = true,
  showRouteLines = false,
  style = { height: '500px', width: '100%' }
}: ClienteMapProps) {
  const components = useLeafletComponents();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]);
  
  // Calcular centro del mapa basado en clientes
  useEffect(() => {
    if (centerOnClientes && clientes.length > 0) {
      const clientesConCoordenadas = clientes.filter(c => c.latitud && c.longitud);
      if (clientesConCoordenadas.length > 0) {
        const avgLat = clientesConCoordenadas.reduce((sum, c) => sum + c.latitud!, 0) / clientesConCoordenadas.length;
        const avgLon = clientesConCoordenadas.reduce((sum, c) => sum + c.longitud!, 0) / clientesConCoordenadas.length;
        setMapCenter([avgLat, avgLon]);
      }
    }
  }, [clientes, centerOnClientes]);

  if (!components) {
    return (
      <div 
        style={style} 
        className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-500 dark:text-gray-400">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  const { Marker, Popup, Polyline } = components;
  const clientesConCoordenadas = clientes.filter(c => c.latitud && c.longitud);

  return (
    <MapComponent 
      center={mapCenter} 
      zoom={centerOnClientes ? (clientesConCoordenadas.length === 1 ? 16 : 13) : 12}
      style={style}
    >
      {/* Marcadores de clientes */}
      {clientesConCoordenadas.map((cliente) => (
        <ClienteMarker
          key={cliente.id}
          cliente={cliente}
          isSelected={selectedClienteId === cliente.id}
          onSelect={onClienteSelect}
          Marker={Marker}
          Popup={Popup}
        />
      ))}

      {/* Líneas de ruta si están habilitadas */}
      {showRouteLines && clientesConCoordenadas.length > 1 && (
        <RouteLines 
          clientes={clientesConCoordenadas}
          Polyline={Polyline}
        />
      )}
    </MapComponent>
  );
}

interface ClienteMarkerProps {
  cliente: Cliente;
  isSelected: boolean;
  onSelect?: (cliente: Cliente) => void;
  Marker: any;
  Popup: any;
}

function ClienteMarker({ cliente, isSelected, onSelect, Marker, Popup }: ClienteMarkerProps) {
  if (!cliente.latitud || !cliente.longitud) return null;

  return (
    <Marker
      position={[cliente.latitud, cliente.longitud]}
      eventHandlers={{
        click: () => onSelect?.(cliente),
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-semibold text-gray-900 mb-2">
            {cliente.nombre}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>📍 Dirección:</strong><br />{cliente.direccion}</p>
            <p><strong>📞 Teléfono:</strong> {cliente.telefono}</p>
            <p><strong>🗺️ Coordenadas:</strong><br />
              {cliente.latitud.toFixed(6)}, {cliente.longitud.toFixed(6)}
            </p>
            <div className="mt-3 pt-2 border-t border-gray-200">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                cliente.estado === 'Activo'
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {cliente.estado === 'Activo' ? '✅ Activo' : '❌ Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

interface RouteLinesProps {
  clientes: Cliente[];
  Polyline: any;
}

function RouteLines({ clientes, Polyline }: RouteLinesProps) {
  if (clientes.length < 2) return null;

  // Crear líneas conectando clientes secuencialmente
  const positions = clientes.map(c => [c.latitud!, c.longitud!]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
      }}
    />
  );
}



// Agregar estilos CSS necesarios para Leaflet
export function LeafletStyles() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cargar estilos de Leaflet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Estilos personalizados
      const style = document.createElement('style');
      style.textContent = `
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(link);
        document.head.removeChild(style);
      };
    }
  }, []);

  return null;
}