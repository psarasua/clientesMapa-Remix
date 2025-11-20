import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { createCliente, type CreateCliente } from "~/lib/database.server";
import { FormPageSkeleton } from "~/components/ui/FormSkeleton";
import { useNavigationLoading } from "~/hooks/useNavigationLoading";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const formData = await request.formData();
  
  // Validar campos requeridos
  const nombre = formData.get("nombre")?.toString();
  const razonsocial = formData.get("razonsocial")?.toString();
  const direccion = formData.get("direccion")?.toString();
  
  if (!nombre || !razonsocial || !direccion) {
    return {
      error: "Los campos Nombre, Razón Social y Dirección son obligatorios"
    };
  }
  
  // Preparar datos del cliente
  const clienteData: CreateCliente = {
    nombre: nombre.trim(),
    razonsocial: razonsocial.trim(),
    direccion: direccion.trim(),
    codigoalte: formData.get("codigoalte")?.toString()?.trim() || null,
    telefono: formData.get("telefono")?.toString()?.trim() || null,
    rut: formData.get("rut")?.toString()?.trim() || null,
    estado: "Activo",
  };
  
  // Procesar coordenadas si se proporcionan
  const latitudStr = formData.get("latitud")?.toString()?.trim();
  const longitudStr = formData.get("longitud")?.toString()?.trim();
  
  if (latitudStr && longitudStr) {
    const latitud = parseFloat(latitudStr);
    const longitud = parseFloat(longitudStr);
    
    if (!isNaN(latitud) && !isNaN(longitud)) {
      clienteData.latitud = latitud;
      clienteData.longitud = longitud;
    }
  }
  
  try {
    const nuevoCliente = await createCliente(clienteData);
    return redirect(`/clientes/${nuevoCliente.id}`);
  } catch (error) {
    console.error("Error creating cliente:", error);
    return {
      error: "Error al crear el cliente. Por favor, intenta nuevamente."
    };
  }
}

export default function NuevoCliente() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { isLoading } = useNavigationLoading();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <FormPageSkeleton 
          title="Nuevo Cliente"
          subtitle="Cargando formulario..."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/clientes"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a clientes
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Cliente</h1>
          <p className="text-gray-600 mt-2">
            Completa la información del nuevo cliente
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
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label htmlFor="razonsocial" className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="razonsocial"
                    name="razonsocial"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Juan Pérez S.A."
                  />
                </div>

                <div>
                  <label htmlFor="codigoalte" className="block text-sm font-medium text-gray-700 mb-2">
                    Código Alternativo
                  </label>
                  <input
                    type="text"
                    id="codigoalte"
                    name="codigoalte"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Código interno (opcional)"
                  />
                </div>

                <div>
                  <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-2">
                    RUT
                  </label>
                  <input
                    type="text"
                    id="rut"
                    name="rut"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 12.345.678-9"
                  />
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información de Contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: +56 9 1234 5678"
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Dirección completa"
                  />
                </div>
              </div>
            </div>

            {/* Geolocalización */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Ubicación Geográfica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitud" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitud
                  </label>
                  <input
                    type="number"
                    id="latitud"
                    name="latitud"
                    step="0.0000001"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: -33.4489"
                  />
                </div>

                <div>
                  <label htmlFor="longitud" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud
                  </label>
                  <input
                    type="number"
                    id="longitud"
                    name="longitud"
                    step="0.0000001"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: -70.6693"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Las coordenadas son opcionales. Puedes obtenerlas desde Google Maps o GPS.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Link
                to="/clientes"
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
                {isSubmitting ? "Creando..." : "Crear Cliente"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}