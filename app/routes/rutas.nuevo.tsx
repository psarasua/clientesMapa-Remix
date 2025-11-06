import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useActionData, Form, redirect } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { createRuta } from "~/lib/database.server";
import { PageLayout } from "~/components/ui/Layout";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Card } from "~/components/ui/Card";

interface ActionData {
  error?: string;
  fieldErrors?: {
    nombre?: string;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  return {};
}

export async function action({ request }: ActionFunctionArgs): Promise<ActionData | Response> {
  await redirectIfNotAuthenticated(request);
  
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
    await createRuta({ nombre: nombre.trim() });
    return redirect('/rutas');
  } catch (error) {
    console.error('Error creating ruta:', error);
    return { error: 'Error al crear la ruta' };
  }
}

export default function NuevaRutaPage() {
  const actionData = useActionData<ActionData>();

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            🗺️ Nueva Ruta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Crea una nueva ruta para organizar tus repartos
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
                error={actionData?.fieldErrors?.nombre}
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Asigna un nombre descriptivo que identifique fácilmente la ruta
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Sugerencias para nombres de rutas:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>Por día:</strong> Lunes, Martes, Miércoles, etc.</li>
                <li>• <strong>Por zona:</strong> Norte, Sur, Centro, Este, Oeste</li>
                <li>• <strong>Por tipo:</strong> Express, Regular, Premium</li>
                <li>• <strong>Combinado:</strong> Lunes Norte, Martes Centro, etc.</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">
                ✅ Crear Ruta
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
            💡 Después de crear la ruta, podrás asignar clientes y optimizar el recorrido
          </p>
        </div>
      </div>
    </PageLayout>
  );
}