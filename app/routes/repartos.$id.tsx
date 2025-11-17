import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, Form, Link, redirect } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getRepartoById, deleteReparto, getAllRepartos } from "~/lib/database.server";
import type { Reparto } from "~/types/database";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { useState } from "react";
import React from "react";
import toast from "react-hot-toast";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const id = parseInt(params.id!);
  if (isNaN(id)) {
    throw new Response("ID de reparto inválido", { status: 400 });
  }

  try {
    // Usar getAllRepartos con filtro para obtener datos con joins
    const repartos = await getAllRepartos({ camion_id: undefined, ruta_id: undefined });
    const reparto = repartos.find(r => r.id === id);

    if (!reparto) {
      throw new Response("Reparto no encontrado", { status: 404 });
    }

    return { reparto };
  } catch (error) {
    console.error("Error loading reparto:", error);
    throw new Response("Error interno del servidor", { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const id = parseInt(params.id!);
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "delete") {
    try {
      await deleteReparto(id);
      return redirect("/repartos?deleted=true");
    } catch (error) {
      console.error("Error deleting reparto:", error);
      return redirect("/repartos?error=delete");
    }
  }
  
  return null;
}

export default function RepartoDetalle() {
  const { reparto } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Manejar notificación de actualización
  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('updated') === 'true') {
      toast.success('Reparto actualizado exitosamente');
      // Limpiar el parámetro de la URL
      url.searchParams.delete('updated');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  return (
    <PageLayout>
      <PageHeader
        title={`Reparto #${reparto.id}`}
        subtitle="Detalles del reparto"
        action={
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => navigate("/repartos")}
            >
              ← Volver a Repartos
            </Button>
            <Link 
              to={`/repartos/${reparto.id}/editar`}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ✏️ Editar
            </Link>
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteModal(true)}
            >
              🗑️ Eliminar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📦 Información del Reparto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">ID del Reparto</div>
                    <div className="text-xl font-bold text-gray-900">#{reparto.id}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Estado</div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      📋 Planificado
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Asignaciones</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">🚛 Camión Asignado</div>
                      <div className="text-sm text-gray-600">
                        {reparto.camion_nombre || "Sin asignar"}
                        {reparto.camion_id && ` (ID: ${reparto.camion_id})`}
                      </div>
                    </div>
                    {reparto.camion_id && (
                      <Link 
                        to={`/camiones/${reparto.camion_id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver Camión →
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">🗺️ Ruta Asignada</div>
                      <div className="text-sm text-gray-600">
                        {reparto.ruta_nombre || "Sin asignar"}
                        {reparto.ruta_id && ` (ID: ${reparto.ruta_id})`}
                      </div>
                    </div>
                    {reparto.ruta_id && (
                      <Link 
                        to={`/rutas/${reparto.ruta_id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver Ruta →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Panel de Acciones */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">⚡ Acciones Rápidas</h3>
              
              <div className="space-y-3">
                <Link 
                  to={`/repartos/${reparto.id}/editar`}
                  className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300 px-4 py-3 rounded-lg font-medium transition-colors text-center block"
                >
                  ✏️ Editar Reparto
                </Link>
                
                <Button 
                  variant="danger" 
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full"
                >
                  🗑️ Eliminar Reparto
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-500">
                  💡 <strong>Tip:</strong> Puedes asignar o cambiar el camión y la ruta desde la página de edición.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar el reparto <strong>#{reparto.id}</strong>?
            </p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <Button 
                  type="submit" 
                  variant="danger"
                >
                  🗑️ Eliminar
                </Button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}