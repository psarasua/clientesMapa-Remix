import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { PageLayout } from "./Layout";

export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <PageLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-6">
          <ErrorDisplay error={error} />
        </div>
      </div>
    </PageLayout>
  );
}

interface ErrorDisplayProps {
  error: unknown;
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (isRouteErrorResponse(error)) {
    return <RouteErrorDisplay error={error} />;
  }
  
  if (error instanceof Error) {
    return <GeneralErrorDisplay error={error} />;
  }
  
  return <UnknownErrorDisplay />;
}

function RouteErrorDisplay({ error }: { error: any }) {
  const is404 = error.status === 404;
  
  return (
    <div className="space-y-8">
      {/* Icono y título principal */}
      <div className="space-y-4">
        <div className="text-8xl">
          {is404 ? "🔍" : "⚠️"}
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          {is404 ? "¡Ups! Página no encontrada" : "¡Vaya! Algo salió mal"}
        </h1>
        <p className="text-xl text-gray-600">
          {is404 
            ? "La página que buscas no existe o fue movida."
            : "Encontramos un problema al procesar tu solicitud."
          }
        </p>
      </div>

      {/* Detalles del error */}
      <div className="bg-gray-50 rounded-2xl p-6 border-l-4 border-red-400">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm font-bold">{error.status}</span>
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Detalles del Error
            </h3>
            <p className="text-gray-700 mb-1">
              <strong>Estado:</strong> {error.status} - {error.statusText}
            </p>
            {error.data && (
              <p className="text-gray-600 text-sm">
                <strong>Descripción:</strong> {error.data}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Acciones sugeridas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ¿Qué puedes hacer?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            icon="🏠"
            title="Ir al Dashboard"
            description="Volver al panel principal"
            to="/dashboard"
            variant="primary"
          />
          <ActionCard
            icon="👥"
            title="Ver Clientes"
            description="Gestionar tus clientes"
            to="/clientes"
            variant="secondary"
          />
          {is404 && (
            <>
              <ActionCard
                icon="🚛"
                title="Ver Camiones"
                description="Gestionar la flota"
                to="/camiones"
                variant="secondary"
              />
              <ActionCard
                icon="📦"
                title="Ver Repartos"
                description="Gestionar entregas"
                to="/repartos"
                variant="secondary"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GeneralErrorDisplay({ error }: { error: Error }) {
  const isDevelopment = import.meta.env.DEV;
  
  return (
    <div className="space-y-8">
      {/* Icono y título principal */}
      <div className="space-y-4">
        <div className="text-8xl">🐛</div>
        <h1 className="text-4xl font-bold text-gray-900">
          ¡Ups! Error del Sistema
        </h1>
        <p className="text-xl text-gray-600">
          Encontramos un problema técnico. No te preocupes, ya estamos trabajando en solucionarlo.
        </p>
      </div>

      {/* Detalles del error */}
      <div className="bg-red-50 rounded-2xl p-6 border-l-4 border-red-400">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-lg">⚡</span>
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Información del Error
            </h3>
            <p className="text-gray-700 mb-2">
              <strong>Mensaje:</strong> {error.message}
            </p>
            {isDevelopment && error.stack && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                  🔧 Ver detalles técnicos (desarrollo)
                </summary>
                <pre className="mt-3 text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-60 text-gray-800">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>

      {/* Acciones sugeridas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Opciones disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            icon="🔄"
            title="Recargar Página"
            description="Intentar nuevamente"
            onClick={() => window.location.reload()}
            variant="primary"
          />
          <ActionCard
            icon="🏠"
            title="Ir al Dashboard"
            description="Volver al inicio"
            to="/dashboard"
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}

function UnknownErrorDisplay() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="text-8xl">🤔</div>
        <h1 className="text-4xl font-bold text-gray-900">
          Error Desconocido
        </h1>
        <p className="text-xl text-gray-600">
          Ocurrió algo inesperado. Por favor, intenta nuevamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard
          icon="🔄"
          title="Recargar Página"
          description="Intentar nuevamente"
          onClick={() => window.location.reload()}
          variant="primary"
        />
        <ActionCard
          icon="🏠"
          title="Ir al Dashboard"
          description="Volver al inicio"
          to="/dashboard"
          variant="secondary"
        />
      </div>
    </div>
  );
}

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  to?: string;
  onClick?: () => void;
  variant: "primary" | "secondary";
}

function ActionCard({ icon, title, description, to, onClick, variant }: ActionCardProps) {
  const baseClasses = "block p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg";
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300"
  };

  const content = (
    <div className="text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className={`text-sm ${variant === "primary" ? "text-blue-100" : "text-gray-600"}`}>
        {description}
      </p>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${variantClasses[variant]}`}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} w-full`}>
      {content}
    </button>
  );
}