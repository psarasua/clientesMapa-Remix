import { useEffect, useRef } from 'react';
import type { Cliente } from '~/types/database';

// Declaraciones TypeScript para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface RepartoMapProps {
  clientes: Cliente[];
  isOpen: boolean;
  onClose: () => void;
  repartoId: number;
}

export function RepartoMap({ clientes, isOpen, onClose, repartoId }: RepartoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      if (!window.L) {
        // Cargar CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Cargar JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Filtrar clientes con coordenadas válidas
      const clientesConCoordenadas = clientes.filter(
        cliente => cliente.latitud && cliente.longitud
      );

      if (clientesConCoordenadas.length === 0) {
        return;
      }

      // Crear mapa
      const map = window.L.map(mapRef.current).setView([-34.9011, -56.1645], 12); // Montevideo por defecto

      // Agregar tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Agregar marcadores para cada cliente
      const markers: any[] = [];
      clientesConCoordenadas.forEach((cliente, index) => {
        const marker = window.L.marker([cliente.latitud!, cliente.longitud!])
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${cliente.nombre}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${cliente.direccion}</p>
              ${cliente.telefono ? `<p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Tel:</strong> ${cliente.telefono}</p>` : ''}
              ${cliente.rut ? `<p style="margin: 0; font-size: 12px;"><strong>RUT:</strong> ${cliente.rut}</p>` : ''}
            </div>
          `);
        
        markers.push(marker);
      });

      // Ajustar la vista para mostrar todos los marcadores
      if (markers.length > 1) {
        const group = new window.L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      } else if (markers.length === 1) {
        map.setView([clientesConCoordenadas[0].latitud!, clientesConCoordenadas[0].longitud!], 15);
      }

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, clientes]);

  if (!isOpen) return null;

  const clientesConCoordenadas = clientes.filter(
    cliente => cliente.latitud && cliente.longitud
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              🗺️ Mapa del Reparto #{repartoId}
            </h2>
            <p className="text-sm text-gray-600">
              {clientesConCoordenadas.length} de {clientes.length} clientes con ubicación
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {clientesConCoordenadas.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin ubicaciones disponibles
                </h3>
                <p className="text-gray-600 max-w-sm">
                  Los clientes de este reparto no tienen coordenadas de ubicación configuradas.
                </p>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full" />
          )}
        </div>

        {/* Footer con información */}
        {clientesConCoordenadas.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Clientes del reparto
                </span>
                <span>{clientesConCoordenadas.length} ubicaciones</span>
              </div>
              <div className="text-xs text-gray-500">
                Haz clic en los marcadores para ver detalles del cliente
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}