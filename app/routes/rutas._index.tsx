import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getAllRutas } from "~/lib/database.server";
import type { Ruta } from "~/types/database";
import { PageLayout, PageHeader } from "~/components/ui/Layout";
import { ErrorBoundary as CustomErrorBoundary } from "~/components/ui/ErrorBoundary";
import { RutaTable } from "~/components/rutas/RutaTable";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  const rutas = await getAllRutas();
  
  return { rutas };
}

export default function RutasPage() {
  const { rutas } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleNewRuta = () => {
    navigate("/rutas/nuevo");
  };

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