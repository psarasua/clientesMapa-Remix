import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, useActionData } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getAllRutas, deleteRuta } from "~/lib/database.server";
import type { Ruta } from "~/types/database";
import React from "react";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { RutaTable } from "~/components/rutas/RutaTable";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { RutaTableSkeleton } from "~/components/rutas/RutaSkeleton";
import { useNavigationLoading } from "~/hooks/useNavigationLoading";
import { useToast } from "~/hooks/useToast";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const rutas = await getAllRutas();
  
  return { rutas };
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const formData = await request.formData();
  const intent = formData.get("intent");
  const rutaId = formData.get("rutaId");
  
  if (intent === "delete" && rutaId) {
    try {
      await deleteRuta(parseInt(rutaId.toString()));
      return { success: "Ruta eliminada exitosamente" };
    } catch (error) {
      console.error("Error deleting ruta:", error);
      return { error: "Error al eliminar la ruta" };
    }
  }
  
  return null;
}

export default function RutasPage() {
  const { rutas } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { isLoading } = useNavigationLoading();
  const { success, error } = useToast();

  // Mostrar toast notifications
  React.useEffect(() => {
    if (actionData?.success) {
      success(actionData.success);
    }
    if (actionData?.error) {
      error(actionData.error);
    }
  }, [actionData, success, error]);

  const handleNewRuta = () => {
    navigate("/rutas/nuevo");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader
          title="Rutas"
          subtitle="Gestión de rutas de reparto"
          action={
            <Button disabled>
              + Nueva Ruta
            </Button>
          }
        />

        <Card padding="none">
          <RutaTableSkeleton />
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Rutas"
        subtitle={`Gestión de rutas de reparto (${rutas.length} rutas)`}
        action={
          <Button onClick={handleNewRuta}>
            + Nueva Ruta
          </Button>
        }
      />

      <Card padding="none">
        <RutaTable rutas={rutas} />
      </Card>
    </PageLayout>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}