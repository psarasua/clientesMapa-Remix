import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useNavigate, Form, redirect } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { 
  getRepartoById, 
  updateReparto, 
  getAllCamiones, 
  getAllRutas 
} from "~/lib/database.server";
import type { Reparto, Camion, Ruta } from "~/types/database";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/hooks/useToast";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const id = parseInt(params.id!);
  if (isNaN(id)) {
    throw new Response("ID de reparto inválido", { status: 400 });
  }

  try {
    const [reparto, camiones, rutas] = await Promise.all([
      getRepartoById(id),
      getAllCamiones(),
      getAllRutas()
    ]);

    if (!reparto) {
      throw new Response("Reparto no encontrado", { status: 404 });
    }

    return { reparto, camiones, rutas };
  } catch (error) {
    console.error("Error loading reparto:", error);
    throw new Response("Error interno del servidor", { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const id = parseInt(params.id!);
  const formData = await request.formData();
  
  const camionId = formData.get("camion_id");
  const rutaId = formData.get("ruta_id");
  
  try {
    const updateData = {
      camion_id: camionId ? parseInt(camionId.toString()) : null,
      ruta_id: rutaId ? parseInt(rutaId.toString()) : null
    };

    await updateReparto(id, updateData);
    return redirect(`/repartos/${id}?updated=true`);
  } catch (error) {
    console.error("Error updating reparto:", error);
    return { error: "Error al actualizar el reparto. Inténtalo de nuevo." };
  }
}

export default function EditarReparto() {
  const { reparto, camiones, rutas } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  
  // Hook para manejar notificaciones automáticamente
  useToast();

  return (
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
              onClick={() => navigate(`/repartos/${reparto.id}`)}
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