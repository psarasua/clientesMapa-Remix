import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, Form, redirect } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getRutaById, updateRuta } from "~/lib/database.server";
import type { Ruta } from "~/types/database";
import { PageLayout } from "~/components/ui/Layout";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Card } from "~/components/ui/Card";

interface LoaderData {
  ruta: Ruta | null;
}

interface ActionData {
  error?: string;
  fieldErrors?: {
    nombre?: string;
  };
}

export async function loader({ request, params }: LoaderFunctionArgs): Promise<LoaderData> {
  await redirectIfNotAuthenticated(request);
  
  const rutaId = parseInt(params.id!);
  const ruta = await getRutaById(rutaId);
  
  return { ruta };
}

export async function action({ request, params }: ActionFunctionArgs): Promise<ActionData | Response> {
  await redirectIfNotAuthenticated(request);
  
  const rutaId = parseInt(params.id!);
  const formData = await request.formData();
  const nombre = formData.get('nombre') as string;
  
  const fieldErrors: ActionData['fieldErrors'] = {};
  
  if (!nombre || nombre.trim().length === 0) {
    fieldErrors.nombre = 'El nombre es obligatorio';
  }
  
  if (nombre && nombre.trim().length < 2) {
    fieldErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }
  
  try {
    await updateRuta(rutaId, { nombre: nombre.trim() });
    return redirect(`/rutas/${rutaId}`);
  } catch (error) {
    console.error('Error updating ruta:', error);
    return { error: 'Error al actualizar la ruta' };
  }
}

export default function EditarRutaPage() {
  const { ruta } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  if (!ruta) {
    return (
      <PageLayout>
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Ruta no encontrada
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            La ruta que intentas editar no existe o ha sido eliminada
          </p>
          <Button onClick={() => window.history.back()}>
            ↩️ Volver
          </Button>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ✏️ Editar Ruta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Modifica la información de la ruta "{ruta.nombre}"
          </p>
        </div>

        <Card className="p-6">
          <Form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                ❌ {actionData.error}
              </div>
            )}

            <div>
              <Input
                label="Nombre de la Ruta"
                name="nombre"
                type="text"
                placeholder="Ej: Lunes Centro, Martes Norte, etc."
                value={ruta.nombre}
                error={actionData?.fieldErrors?.nombre}
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Asigna un nombre descriptivo que identifique fácilmente la ruta
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Advertencia
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Cambiar el nombre de la ruta no afectará los repartos ya asignados, 
                pero puede generar confusión en reportes históricos.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">
                ✅ Guardar Cambios
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => window.history.back()}
              >
                ↩️ Cancelar
              </Button>
            </div>
          </Form>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            💡 Los cambios se aplicarán inmediatamente a la ruta
          </p>
        </div>
      </div>
    </PageLayout>
  );
}