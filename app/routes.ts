import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("clientes", "routes/clientes._index.tsx"),
  route("clientes/nuevo", "routes/clientes.nuevo.tsx"),
  route("clientes/:id", "routes/clientes.$id.tsx"),
  route("clientes/:id/editar", "routes/clientes.$id.editar.tsx"),
  route("camiones", "routes/camiones._index.tsx"),
  route("camiones/nuevo", "routes/camiones.nuevo.tsx"),
  route("camiones/:id", "routes/camiones.$id.tsx"),
  route("camiones/:id/editar", "routes/camiones.$id.editar.tsx"),
  route("repartos", "routes/repartos._index.tsx"),
  route("repartos/nuevo", "routes/repartos.nuevo.tsx"),
  route("repartos/:id/editar", "routes/repartos.$id.editar.tsx"),
  route("repartos/:id/mapa", "routes/repartos.$id.mapa.tsx"),
  route("rutas", "routes/rutas._index.tsx"),
  route("rutas/nuevo", "routes/rutas.nuevo.tsx"),
  route("rutas/:id", "routes/rutas.$id.tsx"),
  route("rutas/:id/editar", "routes/rutas.$id.editar.tsx"),
] satisfies RouteConfig;
