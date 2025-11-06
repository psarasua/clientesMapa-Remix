import { redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { createLogoutCookie } from "~/lib/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const logoutCookie = createLogoutCookie();
  
  return redirect("/login", {
    headers: {
      "Set-Cookie": logoutCookie,
    },
  });
}

export async function loader() {
  return redirect("/login");
}