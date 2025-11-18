import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useNavigate, Form, redirect } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { 
  getRepartoById, 
  updateReparto, 
  getAllCamiones, 
  getAllRutas,
  getAllClientes,
  getClientesByRepartoId,
  addClienteToReparto,
  removeClienteFromReparto
} from "~/lib/database.server";
import type { Reparto, Camion, Ruta } from "~/types/database";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { ClienteManager } from "~/components/repartos/ClienteManager";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const id = parseInt(params.id!);
  if (isNaN(id)) {
    throw new Response("ID de reparto inválido", { status: 400 });
  }

  try {
    const [reparto, camiones, rutas, todosLosClientes, clientesDelReparto] = await Promise.all([
      getRepartoById(id),
      getAllCamiones(),
      getAllRutas(),
      getAllClientes(),
      getClientesByRepartoId(id)
    ]);

    if (!reparto) {
      throw new Response("Reparto no encontrado", { status: 404 });
    }

    return { 
      reparto, 
      camiones, 
      rutas, 
      clientes: todosLosClientes,
      clientesActuales: clientesDelReparto.map(c => c.id),
      clientesAsignados: clientesDelReparto
    };
  } catch (error) {
    console.error('Error updating reparto:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const id = parseInt(params.id!);
  const formData = await request.formData();
  
  const camionId = formData.get("camion_id");
  const rutaId = formData.get("ruta_id");
  
  try {
    // Actualizar datos básicos del reparto
    const updateData = {
      camion_id: camionId ? parseInt(camionId.toString()) : null,
      ruta_id: rutaId ? parseInt(rutaId.toString()) : null
    };

    await updateReparto(id, updateData);

    // Obtener clientes seleccionados del formulario
    const clientesData = formData.get("clientes");
    let clientesSeleccionados: number[] = [];
    
    if (clientesData) {
      try {
        clientesSeleccionados = JSON.parse(clientesData.toString());
      } catch (error) {
        console.error('Error parsing clientes data:', error);
      }
    }

    // Obtener clientes actuales del reparto
    const clientesActuales = await getClientesByRepartoId(id);
    const clientesActualesIds = clientesActuales.map(c => c.id);

    // Agregar nuevos clientes
    const clientesAAgregar = clientesSeleccionados.filter(id => !clientesActualesIds.includes(id));
    for (const clienteId of clientesAAgregar) {
      await addClienteToReparto({ reparto_id: id, cliente_id: clienteId });
    }

    // Remover clientes no seleccionados
    const clientesARemover = clientesActualesIds.filter(id => !clientesSeleccionados.includes(id));
    for (const clienteId of clientesARemover) {
      await removeClienteFromReparto(id, clienteId);
    }

    return redirect('/repartos?updated=true');
  } catch (error) {
    console.error("Error updating reparto:", error);
    return { error: "Error al actualizar el reparto" };
  }
}

export default function EditarReparto() {
  const { reparto, camiones, rutas, clientes, clientesActuales, clientesAsignados } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [selectedClientes, setSelectedClientes] = useState<number[]>(clientesActuales);

  // Sincronizar estado cuando cambie el loader data
  useEffect(() => {
    setSelectedClientes(clientesActuales);
  }, [clientesActuales]);

  const handleClienteToggle = (clienteId: number) => {
    setSelectedClientes(prev => 
      prev.includes(clienteId) 
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId]
    );
  };

  // Mostrar error si existe
  if (actionData?.error) {
    toast.error(actionData.error);
  }  return (
    <PageLayout>
      <PageHeader
        title={`Editar Reparto #${reparto.id}`}
        subtitle="Modificar asignación de camión y ruta"
        action={
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/repartos/${reparto.id}`)}
          >
            ← Volver
          </Button>
        }
      />

      <Card>
        <Form method="post" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selección de Camión */}
            <div>
              <label htmlFor="camion_id" className="block text-sm font-medium text-gray-700 mb-2">
                Camión
              </label>
              <select
                id="camion_id"
                name="camion_id"
                defaultValue={reparto.camion_id || ""}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin asignar</option>
                {camiones.map((camion) => (
                  <option key={camion.id} value={camion.id}>
                    {camion.nombre} (ID: {camion.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de Ruta */}
            <div>
              <label htmlFor="ruta_id" className="block text-sm font-medium text-gray-700 mb-2">
                Ruta
              </label>
              <select
                id="ruta_id"
                name="ruta_id"
                defaultValue={reparto.ruta_id || ""}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin asignar</option>
                {rutas.map((ruta) => (
                  <option key={ruta.id} value={ruta.id}>
                    {ruta.nombre} (ID: {ruta.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selección de Clientes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gestión de Clientes
            </label>
            <ClienteManager 
              clientes={clientes}
              clientesAsignados={clientesAsignados}
              selectedClientes={selectedClientes}
              onClienteToggle={handleClienteToggle}
            />
          </div>

          {/* Información actual */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Asignación Actual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Camión:</span>
                  <div className="font-medium">
                    {reparto.camion_nombre || "Sin asignar"} 
                    {reparto.camion_id && ` (ID: ${reparto.camion_id})`}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Ruta:</span>
                  <div className="font-medium">
                    {reparto.ruta_nombre || "Sin asignar"}
                    {reparto.ruta_id && ` (ID: ${reparto.ruta_id})`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/repartos')}
            >
              Cancelar
            </Button>
            <Button type="submit">
              💾 Guardar Cambios
            </Button>
          </div>
        </Form>
      </Card>
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}