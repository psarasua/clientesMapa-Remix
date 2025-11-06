import { useEffect, useState } from 'react';
import type { LatLngExpression } from 'leaflet';

// Leaflet components - imported dynamically to avoid SSR issues
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;
let Polyline: any;
let useMap: any;

interface MapComponentProps {
  children?: React.ReactNode;
  center?: LatLngExpression;
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
}

// Hook para cargar Leaflet dinámicamente
export function useLeaflet() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded) {
      import('react-leaflet').then((module) => {
        MapContainer = module.MapContainer;
        TileLayer = module.TileLayer;
        Marker = module.Marker;
        Popup = module.Popup;
        Polyline = module.Polyline;
        useMap = module.useMap;
        setIsLoaded(true);
      });
    }
  }, [isLoaded]);

  return isLoaded;
}

// Componente de mapa base
export function MapComponent({ 
  children, 
  center = [-34.6037, -58.3816], // Buenos Aires por defecto
  zoom = 12,
  style = { height: '400px', width: '100%' },
  className = ''
}: MapComponentProps) {
  const isLoaded = useLeaflet();

  if (!isLoaded) {
    return (
      <div 
        style={style} 
        className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-500 dark:text-gray-400">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={style} className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  );
}

// Exportar componentes de Leaflet para uso externo
export const getLeafletComponents = () => ({
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
});

// Hook para acceso a los componentes
export function useLeafletComponents() {
  const isLoaded = useLeaflet();
  return isLoaded ? getLeafletComponents() : null;
}