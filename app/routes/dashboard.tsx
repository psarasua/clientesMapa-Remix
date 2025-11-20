import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getDashboardStats } from "~/lib/database.server";
import type { DashboardStats, SessionUser } from "~/types/database";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { DashboardSkeleton } from "~/components/dashboard/DashboardSkeleton";
import { useNavigationLoading } from "~/hooks/useNavigationLoading";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = redirectIfNotAuthenticated(request);
  const stats = await getDashboardStats();
  
  return { user, stats };
}

export default function DashboardPage() {
  const { user, stats } = useLoaderData<{ user: SessionUser; stats: DashboardStats }>();
  const { isLoading } = useNavigationLoading();

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader
          title="Dashboard"
          subtitle="Panel de control principal"
        />
        <DashboardSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Panel de control principal"
      />
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Clientes</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalClientes}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/clientes" className="font-medium text-blue-600 hover:text-blue-500">
                  Ver todos
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Clientes Activos</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.clientesActivos}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Repartos</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalRepartos}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/repartos" className="font-medium text-yellow-600 hover:text-yellow-500">
                  Ver todos
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Camiones</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalCamiones}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/camiones" className="font-medium text-purple-600 hover:text-purple-500">
                  Ver todos
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/clientes/nuevo"
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                + Nuevo Cliente
              </Link>
              <Link
                to="/camiones/nuevo"
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                + Nuevo Camión
              </Link>
              <Link
                to="/repartos/nuevo"
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
              >
                + Nuevo Reparto
              </Link>
            </div>
          </div>
        </div>

        {/* Sistema de Reportes - En Construcción */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sistema de Reportes en Construcción
              </h3>
              <p className="text-gray-500 mb-6">
                Próximamente: Dashboard avanzado con gráficos, reportes de eficiencia, 
                estadísticas por período y exportación a PDF/Excel
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                📊 Funcionalidad pendiente de implementación
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }