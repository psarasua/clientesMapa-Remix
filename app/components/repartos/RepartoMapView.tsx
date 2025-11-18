import React, { useEffect, useRef } from 'react';
import type { Cliente } from '~/types/database';

// Declaraciones TypeScript para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface RepartoMapViewProps {
  clientes: Cliente[];
  repartoId: number;
  onClienteClick?: (clienteId: number) => void;
}

export const RepartoMapView = React.forwardRef<any, RepartoMapViewProps>(({ clientes, repartoId, onClienteClick }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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

      // Agregar marcadores numerados para cada cliente
      const markers: any[] = [];
      clientesConCoordenadas.forEach((cliente, index) => {
        // Crear icono personalizado con número
        const divIcon = window.L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background: #2563eb;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 14px;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = window.L.marker([cliente.latitud!, cliente.longitud!], { icon: divIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 220px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="
                  background: #2563eb;
                  color: white;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 12px;
                  margin-right: 8px;
                ">
                  ${index + 1}
                </div>
                <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">${cliente.nombre}</h3>
              </div>
              <div style="margin: 0 0 8px 0; padding: 4px 8px; background: #f3f4f6; border-radius: 4px;">
                <p style="margin: 0; font-size: 12px; color: #374151;"><strong>📍 Dirección:</strong></p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">${cliente.direccion}</p>
              </div>
              ${cliente.telefono ? `
                <div style="margin: 0 0 4px 0; padding: 2px 8px; background: #ecfdf5; border-radius: 4px;">
                  <p style="margin: 0; font-size: 12px; color: #065f46;"><strong>📞 Teléfono:</strong> ${cliente.telefono}</p>
                </div>
              ` : ''}
              ${cliente.rut ? `
                <div style="margin: 0 0 4px 0; padding: 2px 8px; background: #eff6ff; border-radius: 4px;">
                  <p style="margin: 0; font-size: 12px; color: #1e40af;"><strong>🆔 RUT:</strong> ${cliente.rut}</p>
                </div>
              ` : ''}
              <div style="margin: 8px 0 0 0; padding: 4px 8px; background: #fef3c7; border-radius: 4px;">
                <p style="margin: 0; font-size: 11px; color: #92400e;"><strong>Cliente ID:</strong> ${cliente.id}</p>
              </div>
            </div>
          `);
        
        // Guardar referencia del marcador con el ID del cliente
        marker.clienteId = cliente.id;
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
      markersRef.current = markers;
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [clientes]);

  // Función para hacer zoom a un cliente específico
  const zoomToCliente = (clienteId: number) => {
    if (!mapInstanceRef.current) return;

    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente || !cliente.latitud || !cliente.longitud) return;

    // Centrar y hacer zoom a la ubicación del cliente
    mapInstanceRef.current.flyTo([cliente.latitud, cliente.longitud], 18, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25
    });

    // Encontrar y abrir el popup del marcador correspondiente
    const marker = markersRef.current.find(m => m.clienteId === clienteId);
    if (marker) {
      // Cerrar todos los popups primero
      mapInstanceRef.current.closePopup();
      
      setTimeout(() => {
        marker.openPopup();
      }, 800); // Delay para que termine la animación del flyTo
    }

    // Llamar callback si existe
    if (onClienteClick) {
      onClienteClick(clienteId);
    }
  };

  // Función para mostrar todos los clientes
  const showAllClientes = () => {
    if (!mapInstanceRef.current || markersRef.current.length === 0) return;

    // Cerrar todos los popups
    mapInstanceRef.current.closePopup();

    // Ajustar la vista para mostrar todos los marcadores
    if (markersRef.current.length > 1) {
      const group = new window.L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1), {
        animate: true,
        duration: 1.5
      });
    } else if (markersRef.current.length === 1) {
      const cliente = clientesConCoordenadas[0];
      mapInstanceRef.current.flyTo([cliente.latitud!, cliente.longitud!], 15, {
        animate: true,
        duration: 1.5
      });
    }
  };

  // Exponer las funciones para uso externo
  React.useImperativeHandle(ref, () => ({
    zoomToCliente,
    showAllClientes
  }), [clientes]);

  const clientesConCoordenadas = clientes.filter(
    cliente => cliente.latitud && cliente.longitud
  );

  if (clientesConCoordenadas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center p-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin ubicaciones disponibles
          </h3>
          <p className="text-gray-600 max-w-sm">
            Los clientes del reparto #{repartoId} no tienen coordenadas de ubicación configuradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Leyenda flotante */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000] border border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div style={{
              background: '#2563eb',
              color: 'white',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              #
            </div>
            <span>Cliente numerado</span>
          </div>
          <div className="text-xs text-gray-500">
            {clientesConCoordenadas.length} ubicaciones en mapa
          </div>
        </div>
      </div>
    </div>
  );
});

RepartoMapView.displayName = 'RepartoMapView';