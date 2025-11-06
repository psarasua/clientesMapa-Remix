import { useEffect, useState } from 'react';
import type { RutaOptimizada, ClienteOptimizado } from '~/types/database';
import { MapComponent, useLeafletComponents } from '../ui/MapComponent';
import { Card } from '../ui/Card';

interface RutaMapProps {
  rutaOptimizada: RutaOptimizada;
  showRouteNumbers?: boolean;
  showDistances?: boolean;
  animateRoute?: boolean;
  style?: React.CSSProperties;
}

export function RutaMap({ 
  rutaOptimizada, 
  showRouteNumbers = true,
  showDistances = true,
  animateRoute = false,
  style = { height: '600px', width: '100%' }
}: RutaMapProps) {
  const components = useLeafletComponents();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]);
  const [animationStep, setAnimationStep] = useState(0);

  // Calcular centro del mapa basado en clientes
  useEffect(() => {
    if (rutaOptimizada.clientes_optimizados.length > 0) {
      const clientes = rutaOptimizada.clientes_optimizados;
      const avgLat = clientes.reduce((sum, c) => sum + c.latitud!, 0) / clientes.length;
      const avgLon = clientes.reduce((sum, c) => sum + c.longitud!, 0) / clientes.length;
      setMapCenter([avgLat, avgLon]);
    }
  }, [rutaOptimizada]);

  // Animación de ruta
  useEffect(() => {
    if (animateRoute && rutaOptimizada.clientes_optimizados.length > 0) {
      const interval = setInterval(() => {
        setAnimationStep(prev => {
          const next = prev + 1;
          return next > rutaOptimizada.clientes_optimizados.length ? 0 : next;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [animateRoute, rutaOptimizada.clientes_optimizados.length]);

  if (!components) {
    return (
      <div 
        style={style} 
        className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-500 dark:text-gray-400">Cargando mapa de ruta...</p>
        </div>
      </div>
    );
  }

  const { Marker, Popup, Polyline } = components;
  const clientesAMostrar = animateRoute 
    ? rutaOptimizada.clientes_optimizados.slice(0, animationStep)
    : rutaOptimizada.clientes_optimizados;

  return (
    <div className="space-y-4">
      {/* Información de la ruta */}
      <RutaInfo rutaOptimizada={rutaOptimizada} />
      
      {/* Mapa */}
      <MapComponent 
        center={mapCenter} 
        zoom={13}
        style={style}
      >
        {/* Marcadores de clientes */}
        {clientesAMostrar.map((cliente) => (
          <RutaMarker
            key={cliente.id}
            cliente={cliente}
            showNumber={showRouteNumbers}
            showDistance={showDistances}
            Marker={Marker}
            Popup={Popup}
          />
        ))}

        {/* Líneas de ruta */}
        {clientesAMostrar.length > 1 && (
          <RutaPolyline 
            clientes={clientesAMostrar}
            Polyline={Polyline}
          />
        )}

        {/* Indicador de animación */}
        {animateRoute && animationStep > 0 && (
          <AnimationIndicator 
            currentStep={animationStep}
            totalSteps={rutaOptimizada.clientes_optimizados.length}
            Marker={Marker}
            currentCliente={rutaOptimizada.clientes_optimizados[animationStep - 1]}
          />
        )}
      </MapComponent>

      {/* Controles de animación */}
      {animateRoute && (
        <AnimationControls 
          currentStep={animationStep}
          totalSteps={rutaOptimizada.clientes_optimizados.length}
          onStepChange={setAnimationStep}
        />
      )}
    </div>
  );
}

function RutaInfo({ rutaOptimizada }: { rutaOptimizada: RutaOptimizada }) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            🗺️ {rutaOptimizada.nombre}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ruta optimizada con {rutaOptimizada.clientes_optimizados.length} paradas
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              {rutaOptimizada.distancia_total} km
            </div>
            <div className="text-gray-500">Distancia</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600 dark:text-green-400">
              {Math.floor(rutaOptimizada.tiempo_estimado / 60)}h {rutaOptimizada.tiempo_estimado % 60}m
            </div>
            <div className="text-gray-500">Tiempo</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface RutaMarkerProps {
  cliente: ClienteOptimizado;
  showNumber: boolean;
  showDistance: boolean;
  Marker: any;
  Popup: any;
}

function RutaMarker({ cliente, showNumber, showDistance, Marker, Popup }: RutaMarkerProps) {
  if (!cliente.latitud || !cliente.longitud) return null;

  const markerIcon = createRutaIcon(cliente.orden_visita);

  return (
    <Marker
      position={[cliente.latitud, cliente.longitud]}
      icon={markerIcon}
    >
      <Popup>
        <div className="p-3 min-w-[250px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {cliente.orden_visita}
            </div>
            <h3 className="font-semibold text-gray-900">
              {cliente.nombre}
            </h3>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>📍 Dirección:</strong><br />{cliente.direccion}</p>
            <p><strong>📞 Teléfono:</strong> {cliente.telefono}</p>
            
            {showDistance && (
              <div className="pt-2 border-t border-gray-200">
                <p><strong>📏 Distancia desde anterior:</strong> {cliente.distancia_anterior.toFixed(2)} km</p>
                <p><strong>⏱️ Tiempo estimado:</strong> {cliente.tiempo_estimado} minutos</p>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-200">
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

function RutaPolyline({ clientes, Polyline }: { clientes: ClienteOptimizado[], Polyline: any }) {
  if (clientes.length < 2) return null;

  const positions = clientes.map(c => [c.latitud!, c.longitud!]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#10b981',
        weight: 4,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }}
    />
  );
}

function AnimationIndicator({ 
  currentStep, 
  totalSteps, 
  Marker, 
  currentCliente 
}: { 
  currentStep: number;
  totalSteps: number;
  Marker: any;
  currentCliente: ClienteOptimizado;
}) {
  if (!currentCliente.latitud || !currentCliente.longitud) return null;

  const pulsingIcon = createPulsingIcon();

  return (
    <Marker
      position={[currentCliente.latitud, currentCliente.longitud]}
      icon={pulsingIcon}
      zIndexOffset={1000}
    />
  );
}

function AnimationControls({ 
  currentStep, 
  totalSteps, 
  onStepChange 
}: {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
        >
          ⏮️ Anterior
        </button>
        
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Paso {currentStep} de {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        
        <button
          onClick={() => onStepChange(Math.min(totalSteps, currentStep + 1))}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
        >
          Siguiente ⏭️
        </button>
      </div>
    </Card>
  );
}

// Crear iconos personalizados para marcadores de ruta
function createRutaIcon(numero: number) {
  if (typeof window === 'undefined') return null;

  const L = require('leaflet');

  const iconHtml = `
    <div style="
      background-color: #3b82f6;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: bold;
    ">${numero}</div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-ruta-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

function createPulsingIcon() {
  if (typeof window === 'undefined') return null;

  const L = require('leaflet');

  const iconHtml = `
    <div style="
      width: 40px;
      height: 40px;
      position: relative;
    ">
      <div style="
        background-color: #ef4444;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        position: absolute;
        top: 10px;
        left: 10px;
        animation: pulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    </style>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-pulse-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}