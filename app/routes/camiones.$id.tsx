import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link, useNavigate } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getCamionById, getRepartosByCamion } from "~/lib/database.server";
import type { Camion, Reparto } from "~/types/database";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";

interface LoaderData {
  camion: Camion;
  repartos: Reparto[];
}

export async function loader({ request, params }: LoaderFunctionArgs): Promise<LoaderData> {
  await redirectIfNotAuthenticated(request);
  
  const camionId = parseInt(params.id!);
  if (isNaN(camionId)) {
    throw new Response("ID de camión inválido", { status: 400 });
  }

  try {
    const camion = await getCamionById(camionId);
    if (!camion) {
      throw new Response("Camión no encontrado", { status: 404 });
    }

    const repartos = await getRepartosByCamion(camionId);
    
    return {
      camion,
      repartos
    };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error("Error loading camion:", error);
    throw new Response("Error interno del servidor", { status: 500 });
  }
}

export default function CamionDetalle() {
  const { camion, repartos } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  const repartosActivos = repartos.filter(r => r.estado === 'pendiente' || r.estado === 'en_progreso');
  const repartosCompletados = repartos.filter(r => r.estado === 'completado');

  return (
    <PageLayout>
      <PageHeader
        title={`Camión #${camion.id}`}
        subtitle={`Conductor: ${camion.nombre}`}
        breadcrumb={
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/camiones" className="text-gray-500 hover:text-gray-700">
                  Camiones
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-900">Camión #{camion.id}</span>
              </li>
            </ol>
          </nav>
        }
        action={
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => navigate(`/camiones/${camion.id}/editar`)}
            >
              ✏️ Editar
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/camiones')}
            >
              ← Volver
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Camión */}
        <div className="lg:col-span-1">
          <Card padding="md">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚛</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Vehículo #{camion.id}
              </h3>
              <p className="text-gray-600 mb-6">
                {camion.nombre}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Repartos:</span>
                <span className="font-semibold text-gray-900">{repartos.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Completados:</span>
                <span className="font-semibold text-green-700">{repartosCompletados.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600">Activos:</span>
                <span className="font-semibold text-orange-700">{repartosActivos.length}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                repartosActivos.length > 0 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {repartosActivos.length > 0 ? '🚛 En Ruta' : '✅ Disponible'}
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Repartos */}
        <div className="lg:col-span-2">
          <Card padding="md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                📦 Historial de Repartos
              </h3>
              <Link
                to={`/repartos/nuevo?camion=${camion.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Nuevo Reparto
              </Link>
            </div>

            {repartos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Sin repartos asignados
                </h4>
                <p className="text-gray-600 mb-6">
                  Este camión no tiene repartos registrados aún.
                </p>
                <Link
                  to={`/repartos/nuevo?camion=${camion.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Crear Primer Reparto
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {repartos.map((reparto) => (
                  <div key={reparto.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">#{reparto.id}</span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            reparto.estado === 'completado' ? 'bg-green-100 text-green-800' :
                            reparto.estado === 'en_progreso' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reparto.estado}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">
                            Ruta: {reparto.ruta_id ? `#${reparto.ruta_id}` : 'Sin asignar'}
                          </p>
                          {reparto.fecha_programada && (
                            <p className="text-sm text-gray-500">
                              📅 {new Date(reparto.fecha_programada).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/repartos/${reparto.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver Detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}