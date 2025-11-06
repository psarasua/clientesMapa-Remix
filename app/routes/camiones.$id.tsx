import type { LoaderFunctionArgs } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  return { message: "Camión detalle - En desarrollo" };
}

export default function CamionDetalle() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Camión Detalle</h1>
        <p className="text-gray-600 mt-2">Esta página está en desarrollo</p>
      </div>
    </div>
  );
}