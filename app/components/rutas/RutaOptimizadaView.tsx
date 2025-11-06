import type { RutaOptimizada, ClienteOptimizado } from "~/types/database";
import { Card } from "../ui/Card";

interface RutaOptimizadaViewProps {
  rutaOptimizada: RutaOptimizada;
  onCerrar: () => void;
}

export function RutaOptimizadaView({ rutaOptimizada, onCerrar }: RutaOptimizadaViewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <RutaOptimizadaHeader 
          rutaOptimizada={rutaOptimizada} 
          onCerrar={onCerrar} 
        />
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <RutaOptimizadaStats rutaOptimizada={rutaOptimizada} />
          <RutaOptimizadaClientes clientes={rutaOptimizada.clientes_optimizados} />
        </div>
      </div>
    </div>
  );
}

function RutaOptimizadaHeader({ 
  rutaOptimizada, 
  onCerrar 
}: { 
  rutaOptimizada: RutaOptimizada;
  onCerrar: () => void;
}) {
  return (
    <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">🧭 Ruta Optimizada</h2>
        <p className="text-blue-100">{rutaOptimizada.nombre}</p>
      </div>
      <button
        onClick={onCerrar}
        className="text-white hover:text-blue-100 text-2xl"
      >
        ✕
      </button>
    </div>
  );
}

function RutaOptimizadaStats({ rutaOptimizada }: { rutaOptimizada: RutaOptimizada }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="text-center p-4">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {rutaOptimizada.clientes_optimizados.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Clientes a visitar
        </div>
      </Card>
      <Card className="text-center p-4">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {rutaOptimizada.distancia_total} km
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Distancia total
        </div>
      </Card>
      <Card className="text-center p-4">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {Math.floor(rutaOptimizada.tiempo_estimado / 60)}h {rutaOptimizada.tiempo_estimado % 60}m
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Tiempo estimado
        </div>
      </Card>
    </div>
  );
}

function RutaOptimizadaClientes({ clientes }: { clientes: ClienteOptimizado[] }) {
  if (clientes.length === 0) {
    return (
      <Card className="text-center py-8">
        <div className="text-4xl mb-4">📍</div>
        <p className="text-gray-500 dark:text-gray-400">
          No hay clientes con coordenadas para optimizar
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        📋 Orden de Visitas Optimizado
      </h3>
      <div className="space-y-3">
        {clientes.map((cliente, index) => (
          <ClienteOptimizadoCard 
            key={cliente.id} 
            cliente={cliente}
            isLast={index === clientes.length - 1}
          />
        ))}
      </div>
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Información sobre la Optimización
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Se utilizó el algoritmo del vecino más cercano</li>
          <li>• El tiempo incluye 2 min/km de viaje + 15 min por visita</li>
          <li>• Las distancias son calculadas en línea recta (fórmula de Haversine)</li>
          <li>• Para mayor precisión, considera usar un servicio de rutas reales</li>
        </ul>
      </div>
    </div>
  );
}

function ClienteOptimizadoCard({ 
  cliente, 
  isLast 
}: { 
  cliente: ClienteOptimizado;
  isLast: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {cliente.orden_visita}
          </div>
          {!isLast && (
            <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600 mx-auto mt-2"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {cliente.nombre}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {cliente.direccion}
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="text-gray-900 dark:text-gray-100 font-medium">
                {Math.round(cliente.tiempo_estimado)} min
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                📞 {cliente.telefono}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              📍 {cliente.latitud?.toFixed(4)}, {cliente.longitud?.toFixed(4)}
            </span>
            <span>
              📏 {cliente.distancia_anterior.toFixed(2)} km desde anterior
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}