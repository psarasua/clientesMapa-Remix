import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { 
  getRutasWithStats, 
  optimizarRuta, 
  asignarClientesPorZona 
} from "~/lib/database.server";
import type { RutaWithStats, RutaOptimizada } from "~/types/database";
import { PageLayout } from "~/components/ui/Layout";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { RutaTable } from "~/components/rutas/RutaTable";
import { RutaOptimizadaView } from "~/components/rutas/RutaOptimizadaView";
import { RutaMap } from "~/components/rutas/RutaMap";
import { LeafletStyles } from "~/components/clientes/ClienteMap";
import { useState } from "react";

interface LoaderData {
  rutas: RutaWithStats[];
}

interface ActionData {
  type: 'optimizar' | 'asignar_zona';
  rutaOptimizada?: RutaOptimizada;
  asignaciones?: {mensaje: string, asignaciones: any[]};
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  await redirectIfNotAuthenticated(request);
  
  const rutas = await getRutasWithStats();
  
  return {
    rutas
  };
}

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
  await redirectIfNotAuthenticated(request);
  
  const formData = await request.formData();
  const actionType = formData.get('action') as string;
  
  try {
    if (actionType === 'optimizar') {
      const rutaId = parseInt(formData.get('rutaId') as string);
      const rutaOptimizada = await optimizarRuta(rutaId);
      
      if (!rutaOptimizada) {
        return { type: 'optimizar', error: 'No se pudo optimizar la ruta' };
      }
      
      return { 
        type: 'optimizar', 
        rutaOptimizada 
      };
    }
    
    if (actionType === 'asignar_zona') {
      const asignaciones = await asignarClientesPorZona();
      return { 
        type: 'asignar_zona', 
        asignaciones 
      };
    }
    
    return { type: 'optimizar', error: 'Acción no válida' };
  } catch (error) {
    console.error('Error in rutas action:', error);
    return { 
      type: 'optimizar', 
      error: 'Error interno del servidor' 
    };
  }
}

export default function RutasPage() {
  const { rutas } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [mostrarOptimizada, setMostrarOptimizada] = useState(false);

  const handleOptimizar = (rutaId: number) => {
    const form = new FormData();
    form.append('action', 'optimizar');
    form.append('rutaId', rutaId.toString());
    
    const submitForm = document.createElement('form');
    submitForm.method = 'POST';
    submitForm.style.display = 'none';
    
    for (const [key, value] of form.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value.toString();
      submitForm.appendChild(input);
    }
    
    document.body.appendChild(submitForm);
    submitForm.submit();
    document.body.removeChild(submitForm);
  };

  const handleAsignarPorZona = () => {
    const form = new FormData();
    form.append('action', 'asignar_zona');
    
    const submitForm = document.createElement('form');
    submitForm.method = 'POST';
    submitForm.style.display = 'none';
    
    for (const [key, value] of form.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value.toString();
      submitForm.appendChild(input);
    }
    
    document.body.appendChild(submitForm);
    submitForm.submit();
    document.body.removeChild(submitForm);
  };

  // Mostrar modal de ruta optimizada si hay datos
  if (actionData?.type === 'optimizar' && actionData.rutaOptimizada && !mostrarOptimizada) {
    setMostrarOptimizada(true);
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            🗺️ Gestión de Rutas Optimizadas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Optimiza tus rutas de reparto usando algoritmos de distancia y asignación automática por zonas
          </p>
        </div>

        {/* Mensajes de resultado */}
        {actionData?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ❌ {actionData.error}
          </div>
        )}

        {actionData?.type === 'asignar_zona' && actionData.asignaciones && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="font-medium mb-2">
              ✅ {actionData.asignaciones.mensaje}
            </div>
            {actionData.asignaciones.asignaciones.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">
                  Ver detalles de asignaciones
                </summary>
                <div className="mt-2 text-sm">
                  {actionData.asignaciones.asignaciones.map((asignacion, index) => (
                    <div key={index} className="border-l-2 border-green-300 pl-2 py-1">
                      <strong>{asignacion.cliente}</strong> → {asignacion.ruta} 
                      <span className="text-green-600"> ({asignacion.coordenadas})</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Tabla de rutas */}
        <RutaTable 
          rutas={rutas}
          onOptimizar={handleOptimizar}
          onAsignarPorZona={handleAsignarPorZona}
        />

        {/* Modal de ruta optimizada */}
        {mostrarOptimizada && actionData?.rutaOptimizada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">🧭 Ruta Optimizada con Mapa</h2>
                  <p className="text-blue-100">{actionData.rutaOptimizada.nombre}</p>
                </div>
                <button
                  onClick={() => setMostrarOptimizada(false)}
                  className="text-white hover:text-blue-100 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
                <RutaMap 
                  rutaOptimizada={actionData.rutaOptimizada}
                  showRouteNumbers={true}
                  showDistances={true}
                  animateRoute={false}
                  style={{ height: '400px', width: '100%' }}
                />
                <div className="mt-6">
                  <RutaOptimizadaView 
                    rutaOptimizada={actionData.rutaOptimizada}
                    onCerrar={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Estilos de Leaflet */}
      <LeafletStyles />
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}