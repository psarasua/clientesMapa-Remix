import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  
  if (user) {
    // Usuario autenticado, redirigir al dashboard
    return redirect("/dashboard");
  } else {
    // Usuario no autenticado, redirigir al login
    return redirect("/login");
  }
}