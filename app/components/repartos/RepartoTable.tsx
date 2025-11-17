import { Link } from "react-router";
import type { Reparto } from "~/types/database";

interface RepartoTableProps {
  repartos: Reparto[];
}

export function RepartoTable({ repartos }: RepartoTableProps) {
  if (repartos.length === 0) {
    return <EmptyRepartoState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <RepartoTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {repartos.map((reparto) => (
            <RepartoTableRow key={reparto.id} reparto={reparto} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RepartoTableHeader() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Reparto ID
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Camión
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ruta
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
}

interface RepartoTableRowProps {
  reparto: Reparto;
}

function RepartoTableRow({ reparto }: RepartoTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          #{reparto.id}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {reparto.camion_nombre || "Sin asignar"}
        </div>
        <div className="text-sm text-gray-500">
          ID: {reparto.camion_id || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {reparto.ruta_nombre || "Sin ruta"}
        </div>
        <div className="text-sm text-gray-500">
          ID: {reparto.ruta_id || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <RepartoActions repartoId={reparto.id} />
      </td>
    </tr>
  );
}

interface RepartoActionsProps {
  repartoId: number;
}

function RepartoActions({ repartoId }: RepartoActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        to={`/repartos/${repartoId}`}
        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50"
      >
        Ver
      </Link>
      <Link
        to={`/repartos/${repartoId}/editar`}
        className="text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded-md hover:bg-yellow-50"
      >
        Editar
      </Link>
    </div>
  );
}

function EmptyRepartoState() {
  return (
    <div className="p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay repartos planificados
      </h3>
      <p className="text-gray-600 mb-6">
        Crea tu primer reparto asignando camiones y clientes
      </p>
      <Link
        to="/repartos/nuevo"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        + Crear Reparto
      </Link>
    </div>
  );
}