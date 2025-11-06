import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { createCamion, type CreateCamion } from "~/lib/database.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const formData = await request.formData();
  
  // Validar campos requeridos
  const nombre = formData.get("nombre")?.toString();
  
  if (!nombre) {
    return {
      error: "El nombre del camión es obligatorio"
    };
  }
  
  // Preparar datos del camión
  const camionData: CreateCamion = {
    nombre: nombre.trim(),
  };
  
  try {
    const nuevoCamion = await createCamion(camionData);
    return redirect(`/camiones/${nuevoCamion.id}`);
  } catch (error) {
    console.error("Error creating camion:", error);
    return {
      error: "Error al crear el camión. Por favor, intenta nuevamente."
    };
  }
}

export default function NuevoCamion() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/camiones"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a camiones
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Camión</h1>
          <p className="text-gray-600 mt-2">
            Agrega un nuevo camión a tu flota
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <Form method="post" className="p-6 space-y-6">
            {/* Error message */}
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {actionData.error}
              </div>
            )}

            {/* Información básica */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información del Camión
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre/Conductor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Juan Pérez, Mercedes Sprinter, etc."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Puede ser el nombre del conductor o identificación del vehículo
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Link
                to="/camiones"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? "Creando..." : "Crear Camión"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}