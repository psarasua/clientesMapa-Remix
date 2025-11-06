import { Link } from "react-router";
import type { RutaWithStats } from "~/types/database";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface RutaTableProps {
  rutas: RutaWithStats[];
  onOptimizar: (rutaId: number) => void;
  onAsignarPorZona: () => void;
}

export function RutaTable({ rutas, onOptimizar, onAsignarPorZona }: RutaTableProps) {
  if (rutas.length === 0) {
    return <EmptyRutaState onAsignarPorZona={onAsignarPorZona} />;
  }

  return (
    <div className="space-y-4">
      <RutaTableHeader onAsignarPorZona={onAsignarPorZona} />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">
                Ruta
              </th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">
                Clientes
              </th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">
                Repartos
              </th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">
                Estado
              </th>
              <th className="text-right p-4 font-medium text-gray-900 dark:text-gray-100">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {rutas.map((ruta) => (
              <RutaTableRow 
                key={ruta.id} 
                ruta={ruta} 
                onOptimizar={onOptimizar}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RutaTableHeader({ onAsignarPorZona }: { onAsignarPorZona: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Gestión de Rutas Optimizadas
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          onClick={onAsignarPorZona}
          className="text-sm"
        >
          📍 Asignar por Zona
        </Button>
        <Link 
          to="/rutas/nuevo"
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          ➕ Nueva Ruta
        </Link>
      </div>
    </div>
  );
}

function RutaTableRow({ 
  ruta, 
  onOptimizar 
}: { 
  ruta: RutaWithStats; 
  onOptimizar: (rutaId: number) => void;
}) {
  const clientesConCoordenadas = ruta.clientes_asignados.filter(
    c => c.latitud && c.longitud
  ).length;

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="p-4">
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {ruta.nombre}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ID: {ruta.id}
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-sm">
          <div className="text-gray-900 dark:text-gray-100">
            {ruta.total_clientes} clientes
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {clientesConCoordenadas} con coordenadas
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {ruta.total_repartos} repartos
        </div>
      </td>
      <td className="p-4">
        <RutaStatusBadge 
          totalClientes={ruta.total_clientes}
          clientesConCoordenadas={clientesConCoordenadas}
        />
      </td>
      <td className="p-4">
        <RutaActions 
          rutaId={ruta.id}
          onOptimizar={onOptimizar}
          puedeOptimizar={clientesConCoordenadas >= 2}
        />
      </td>
    </tr>
  );
}

function RutaStatusBadge({ 
  totalClientes, 
  clientesConCoordenadas 
}: { 
  totalClientes: number;
  clientesConCoordenadas: number;
}) {
  if (totalClientes === 0) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        Sin clientes
      </span>
    );
  }

  if (clientesConCoordenadas === 0) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
        Sin coordenadas
      </span>
    );
  }

  const porcentaje = Math.round((clientesConCoordenadas / totalClientes) * 100);
  
  if (porcentaje === 100) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        🎯 Optimizable
      </span>
    );
  }

  return (
    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
      {porcentaje}% listo
    </span>
  );
}

function RutaActions({ 
  rutaId, 
  onOptimizar, 
  puedeOptimizar 
}: { 
  rutaId: number;
  onOptimizar: (rutaId: number) => void;
  puedeOptimizar: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => onOptimizar(rutaId)}
        disabled={!puedeOptimizar}
        className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        title={!puedeOptimizar ? "Se necesitan al menos 2 clientes con coordenadas" : "Optimizar ruta"}
      >
        🧭 Optimizar
      </button>
      <Link
        to={`/rutas/${rutaId}`}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
      >
        👁️ Ver
      </Link>
      <Link
        to={`/rutas/${rutaId}/editar`}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
      >
        ✏️ Editar
      </Link>
    </div>
  );
}

function EmptyRutaState({ onAsignarPorZona }: { onAsignarPorZona: () => void }) {
  return (
    <Card className="text-center py-12">
      <div className="text-6xl mb-4">🗺️</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No hay rutas registradas
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Comienza creando rutas para organizar tus repartos de manera eficiente
      </p>
      <div className="flex justify-center gap-4">
        <Link 
          to="/rutas/nuevo"
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          ➕ Crear Primera Ruta
        </Link>
        <Button 
          variant="secondary" 
          onClick={onAsignarPorZona}
        >
          📍 Asignar por Zona
        </Button>
      </div>
    </Card>
  );
}