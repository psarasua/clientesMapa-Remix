import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { 
  createRepartoWithClientes, 
  getAllCamiones,
  getAllRutas,
  getAllClientes,
  type CreateReparto 
} from "~/lib/database.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  try {
    const [camiones, rutas, clientes] = await Promise.all([
      getAllCamiones(),
      getAllRutas(),
      getAllClientes()
    ]);
    
    return { camiones, rutas, clientes };
  } catch (error) {
    console.error("Error loading form data:", error);
    return { camiones: [], rutas: [], clientes: [] };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const formData = await request.formData();
  
  // Validar campos requeridos
  const camionId = formData.get("camion_id")?.toString();
  const rutaId = formData.get("ruta_id")?.toString();
  
  if (!camionId || !rutaId) {
    return {
      error: "Camión y Ruta son obligatorios"
    };
  }
  
  // Obtener clientes seleccionados
  const clienteIds: number[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("cliente_") && value === "on") {
      const clienteId = parseInt(key.replace("cliente_", ""));
      if (!isNaN(clienteId)) {
        clienteIds.push(clienteId);
      }
    }
  }
  
  if (clienteIds.length === 0) {
    return {
      error: "Debe seleccionar al menos un cliente para el reparto"
    };
  }
  
  // Preparar datos del reparto
  const repartoData: CreateReparto = {
    camion_id: parseInt(camionId),
    ruta_id: parseInt(rutaId),
  };
  
  try {
    const nuevoReparto = await createRepartoWithClientes(repartoData, clienteIds);
    return redirect(`/repartos/${nuevoReparto.id}`);
  } catch (error) {
    console.error("Error creating reparto:", error);
    return {
      error: "Error al crear el reparto. Por favor, intenta nuevamente."
    };
  }
}

export default function NuevoReparto() {
  const { camiones, rutas, clientes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/repartos"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a repartos
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Reparto</h1>
          <p className="text-gray-600 mt-2">
            Crea un nuevo reparto asignando camión, ruta y clientes
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <Form method="post" className="p-6 space-y-8">
            {/* Error message */}
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {actionData.error}
              </div>
            )}

            {/* Asignación de Camión y Ruta */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Asignación de Recursos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="camion_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Camión <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="camion_id"
                    name="camion_id"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar camión</option>
                    {camiones.map((camion) => (
                      <option key={camion.id} value={camion.id}>
                        {camion.nombre} (ID: {camion.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ruta_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Ruta <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="ruta_id"
                    name="ruta_id"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar ruta</option>
                    {rutas.map((ruta) => (
                      <option key={ruta.id} value={ruta.id}>
                        {ruta.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Selección de Clientes */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Clientes del Reparto <span className="text-red-500">*</span>
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona los clientes que formarán parte de este reparto
              </p>
              
              <div className="border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                  {clientes.map((cliente) => (
                    <label
                      key={cliente.id}
                      className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    >
                      <input
                        type="checkbox"
                        name={`cliente_${cliente.id}`}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {cliente.nombre}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {cliente.direccion}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {clientes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay clientes disponibles. 
                  <Link to="/clientes/nuevo" className="text-blue-600 hover:text-blue-700 ml-1">
                    Crear nuevo cliente
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Link
                to="/repartos"
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
                {isSubmitting ? "Creando..." : "Crear Reparto"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}