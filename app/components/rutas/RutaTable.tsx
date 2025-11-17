import { Link } from "react-router";
import type { Ruta } from "~/types/database";

interface RutaTableProps {
  rutas: Ruta[];
}

export function RutaTable({ rutas }: RutaTableProps) {
  if (rutas.length === 0) {
    return <EmptyRutaState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <RutaTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {rutas.map((ruta) => (
            <RutaTableRow key={ruta.id} ruta={ruta} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RutaTableHeader() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ruta ID
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Nombre
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
}



interface RutaTableRowProps {
  ruta: Ruta;
}

function RutaTableRow({ ruta }: RutaTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          #{ruta.id}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {ruta.nombre}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <RutaActions rutaId={ruta.id} />
      </td>
    </tr>
  );
}

interface RutaActionsProps {
  rutaId: number;
}

function RutaActions({ rutaId }: RutaActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        to={`/rutas/${rutaId}`}
        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50"
      >
        Ver
      </Link>
      <Link
        to={`/rutas/${rutaId}/editar`}
        className="text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded-md hover:bg-yellow-50"
      >
        Editar
      </Link>
    </div>
  );
}

function EmptyRutaState() {
  return (
    <div className="p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay rutas registradas
      </h3>
      <p className="text-gray-600 mb-6">
        Crea tu primera ruta para organizar los repartos
      </p>
      <Link
        to="/rutas/nuevo"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        + Crear Ruta
      </Link>
    </div>
  );
}