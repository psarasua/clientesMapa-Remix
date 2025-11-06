import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getRutaById } from "~/lib/database.server";
import type { Ruta } from "~/types/database";
import { PageLayout } from "~/components/ui/Layout";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";

interface LoaderData {
  ruta: Ruta | null;
}

export async function loader({ request, params }: LoaderFunctionArgs): Promise<LoaderData> {
  await redirectIfNotAuthenticated(request);
  
  const rutaId = parseInt(params.id!);
  const ruta = await getRutaById(rutaId);
  
  return { ruta };
}

export default function RutaDetailPage() {
  const { ruta } = useLoaderData<LoaderData>();

  if (!ruta) {
    return (
      <PageLayout>
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Ruta no encontrada
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            La ruta que buscas no existe o ha sido eliminada
          </p>
          <Link 
            to="/rutas"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white"
          >
            ↩️ Volver a Rutas
          </Link>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🗺️ {ruta.nombre}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Detalle de la ruta #{ruta.id}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/rutas/${ruta.id}/editar`}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            >
              ✏️ Editar
            </Link>
            <Link 
              to="/rutas"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            >
              ↩️ Volver
            </Link>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📋 Información de la Ruta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID
              </label>
              <p className="text-gray-900 dark:text-gray-100">{ruta.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <p className="text-gray-900 dark:text-gray-100">{ruta.nombre}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🚧 Funcionalidades Próximamente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                📊 Estadísticas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total de clientes asignados, repartos activos, distancia promedio
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                🗺️ Mapa Interactivo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualización de clientes y rutas optimizadas en mapa
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                📋 Lista de Clientes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestión de clientes asignados a esta ruta
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                📈 Historial
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Historial de repartos y métricas de rendimiento
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}