import type { ReactNode } from "react";
import { Link, Form, useLocation, useOutletContext } from "react-router";
import type { SessionUser } from "~/types/database";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  // Manejar el caso donde el contexto puede ser null
  let user: SessionUser | null = null;
  try {
    const context = useOutletContext<{ user: SessionUser | null }>();
    user = context?.user || null;
  } catch (error) {
    // Si no hay contexto disponible, user permanece null
    console.warn("No user context available in PageLayout");
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Repartos</h1>
              {user && <p className="text-gray-600">Bienvenido, {user.nombre_completo}</p>}
            </div>
            {user && (
              <Form method="post" action="/logout">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </Form>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <AppNavigation />

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </main>
    </div>
  );
}

function AppNavigation() {
  const location = useLocation();
  
  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/clientes", label: "Clientes" },
    { to: "/camiones", label: "Camiones" },
    { to: "/repartos", label: "Repartos" },
    { to: "/rutas", label: "Rutas" },
  ];
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
                           (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${
                  isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } px-1 pt-1 pb-4 text-sm font-medium`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumb, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}