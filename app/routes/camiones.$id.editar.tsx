import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getCamionById, updateCamion, type UpdateCamion } from "~/lib/database.server";
import type { Camion } from "~/types/database";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { Card } from "~/components/ui/Card";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";

interface LoaderData {
  camion: Camion;
}

export async function loader({ request, params }: LoaderFunctionArgs): Promise<LoaderData> {
  await redirectIfNotAuthenticated(request);
  
  const camionId = parseInt(params.id!);
  if (isNaN(camionId)) {
    throw new Response("ID de camión inválido", { status: 400 });
  }

  const camion = await getCamionById(camionId);
  if (!camion) {
    throw new Response("Camión no encontrado", { status: 404 });
  }

  return { camion };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const camionId = parseInt(params.id!);
  const formData = await request.formData();
  
  // Validar campos requeridos
  const nombre = formData.get("nombre")?.toString();
  
  if (!nombre) {
    return {
      error: "El nombre del camión es obligatorio"
    };
  }
  
  // Preparar datos de actualización
  const updateData: Partial<UpdateCamion> = {
    nombre: nombre.trim(),
  };
  
  try {
    const camionActualizado = await updateCamion(camionId, updateData);
    if (!camionActualizado) {
      return {
        error: "No se pudo encontrar el camión para actualizar"
      };
    }
    return redirect(`/camiones/${camionId}`);
  } catch (error) {
    console.error("Error updating camion:", error);
    return {
      error: "Error al actualizar el camión. Por favor, intenta nuevamente."
    };
  }
}

export default function EditarCamion() {
  const { camion } = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <PageLayout>
      <PageHeader
        title={`Editar Camión #${camion.id}`}
        subtitle={`Modificar información de ${camion.nombre}`}
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
                <Link to={`/camiones/${camion.id}`} className="text-gray-500 hover:text-gray-700">
                  Camión #{camion.id}
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-900">Editar</span>
              </li>
            </ol>
          </nav>
        }
      />

      <div className="max-w-2xl">
        <Card padding="md">
          <Form method="post" className="space-y-6">
            {/* Error message */}
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {actionData.error}
              </div>
            )}

            {/* Información del camión */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🚛</span>
                  Información del Vehículo
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Conductor / Nombre del Vehículo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      defaultValue={camion.nombre}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ej: Juan Pérez, Mercedes Sprinter, Camión #5..."
                    />
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Actualiza el nombre del conductor o identificación del vehículo
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del camión actual */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">#{camion.id}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Información Actual
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>ID:</strong> {camion.id}</p>
                      <p><strong>Nombre Actual:</strong> {camion.nombre}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Link
                to={`/camiones/${camion.id}`}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </Form>
        </Card>
      </div>
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}