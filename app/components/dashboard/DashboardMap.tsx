import { useEffect, useState } from 'react';
import type { Cliente, Camion, Reparto } from '~/types/database';
import { MapComponent, useLeafletComponents } from '../ui/MapComponent';
import { Card } from '../ui/Card';

interface DashboardMapProps {
  clientes: Cliente[];
  camiones?: Camion[];
  repartos?: Reparto[];
  selectedFilter?: 'all' | 'active' | 'inactive';
  onClienteSelect?: (cliente: Cliente) => void;
  style?: React.CSSProperties;
}

export function DashboardMap({ 
  clientes, 
  camiones = [],
  repartos = [],
  selectedFilter = 'all',
  onClienteSelect,
  style = { height: '500px', width: '100%' }
}: DashboardMapProps) {
  const components = useLeafletComponents();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]);
  const [mapStats, setMapStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    conCoordenadas: 0,
    sinCoordenadas: 0
  });

  // Calcular estadísticas del mapa
  useEffect(() => {
    const total = clientes.length;
    const activos = clientes.filter(c => c.estado === 'Activo').length;
    const inactivos = total - activos;
    const conCoordenadas = clientes.filter(c => c.latitud && c.longitud).length;
    const sinCoordenadas = total - conCoordenadas;

    setMapStats({
      total,
      activos,
      inactivos,
      conCoordenadas,
      sinCoordenadas
    });

    // Calcular centro del mapa
    if (conCoordenadas > 0) {
      const clientesConCoord = clientes.filter(c => c.latitud && c.longitud);
      const avgLat = clientesConCoord.reduce((sum, c) => sum + c.latitud!, 0) / clientesConCoord.length;
      const avgLon = clientesConCoord.reduce((sum, c) => sum + c.longitud!, 0) / clientesConCoord.length;
      setMapCenter([avgLat, avgLon]);
    }
  }, [clientes]);

  if (!components) {
    return (
      <div className="space-y-4">
        <MapStatsCards stats={mapStats} />
        <div 
          style={style} 
          className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-500 dark:text-gray-400">Cargando mapa del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const { Marker, Popup } = components;
  
  // Filtrar clientes según el filtro seleccionado
  const clientesFiltrados = clientes.filter(cliente => {
    if (!cliente.latitud || !cliente.longitud) return false;
    
    switch (selectedFilter) {
      case 'active':
        return cliente.estado === 'Activo';
      case 'inactive':
        return cliente.estado !== 'Activo';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-4">
      <MapStatsCards stats={mapStats} />
      
      <MapComponent 
        center={mapCenter} 
        zoom={12}
        style={style}
      >
        {clientesFiltrados.map((cliente) => (
          <DashboardMarker
            key={cliente.id}
            cliente={cliente}
            onSelect={onClienteSelect}
            Marker={Marker}
            Popup={Popup}
          />
        ))}
      </MapComponent>

      <MapLegend />
    </div>
  );
}

function MapStatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="p-3 text-center">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {stats.total}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Total Clientes
        </div>
      </Card>
      
      <Card className="p-3 text-center">
        <div className="text-lg font-bold text-green-600 dark:text-green-400">
          {stats.activos}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Activos
        </div>
      </Card>
      
      <Card className="p-3 text-center">
        <div className="text-lg font-bold text-red-600 dark:text-red-400">
          {stats.inactivos}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Inactivos
        </div>
      </Card>
      
      <Card className="p-3 text-center">
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {stats.conCoordenadas}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          En Mapa
        </div>
      </Card>
      
      <Card className="p-3 text-center">
        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
          {stats.sinCoordenadas}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Sin Ubicar
        </div>
      </Card>
    </div>
  );
}

interface DashboardMarkerProps {
  cliente: Cliente;
  onSelect?: (cliente: Cliente) => void;
  Marker: any;
  Popup: any;
}

function DashboardMarker({ cliente, onSelect, Marker, Popup }: DashboardMarkerProps) {
  if (!cliente.latitud || !cliente.longitud) return null;

  const markerIcon = createDashboardIcon(cliente.estado === 'Activo');

  return (
    <Marker
      position={[cliente.latitud, cliente.longitud]}
      icon={markerIcon}
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
            <p><strong>🏢 Razón Social:</strong><br />{cliente.razonsocial}</p>
            <p><strong>📍 Dirección:</strong><br />{cliente.direccion}</p>
            <p><strong>📞 Teléfono:</strong> {cliente.telefono || 'No disponible'}</p>
            {cliente.codigoalte && (
              <p><strong>🔢 Código:</strong> {cliente.codigoalte}</p>
            )}
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

function MapLegend() {
  return (
    <Card className="p-4">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
        🗺️ Leyenda del Mapa
      </h3>
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Clientes Activos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Clientes Inactivos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Ruta Optimizada</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        💡 Haz clic en cualquier marcador para ver más detalles del cliente
      </p>
    </Card>
  );
}

// Crear iconos para el dashboard
function createDashboardIcon(isActive: boolean) {
  if (typeof window === 'undefined') return null;

  const L = require('leaflet');

  const color = isActive ? '#10b981' : '#ef4444';
  
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    "></div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-dashboard-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
}