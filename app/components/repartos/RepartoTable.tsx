import { Link } from "react-router";
import type { RepartoWithDetails } from "~/lib/database.server";

interface RepartoTableProps {
  repartos: RepartoWithDetails[];
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
          ID
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Camión
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ruta
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Clientes
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Estado
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
}

interface RepartoTableRowProps {
  reparto: RepartoWithDetails;
}

function RepartoTableRow({ reparto }: RepartoTableRowProps) {
  const clienteCount = reparto.clientes?.length || 0;
  const estadoReparto = clienteCount === 0 ? 'sin_clientes' : 'planificado';

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          #{reparto.id}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {reparto.camion?.nombre || "Sin asignar"}
          </div>
          <div className="text-sm text-gray-500">
            {reparto.camion ? `ID: ${reparto.camion.id}` : "Sin camión"}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {reparto.ruta?.nombre || "Sin ruta"}
        </div>
        <div className="text-sm text-gray-500">
          {reparto.ruta ? `ID: ${reparto.ruta.id}` : "No asignada"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {clienteCount} cliente{clienteCount !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-gray-500">
          {clienteCount > 0 
            ? reparto.clientes?.slice(0, 2).map(c => c.nombre).join(', ') + (clienteCount > 2 ? '...' : '')
            : "Sin clientes"
          }
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <RepartoStatusBadge status={estadoReparto} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <RepartoActions repartoId={reparto.id} />
      </td>
    </tr>
  );
}

interface RepartoStatusBadgeProps {
  status: string;
}

function RepartoStatusBadge({ status }: RepartoStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planificado":
        return "bg-blue-100 text-blue-800";
      case "en_curso":
        return "bg-yellow-100 text-yellow-800";
      case "completado":
        return "bg-green-100 text-green-800";
      case "sin_clientes":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planificado":
        return "Planificado";
      case "en_curso":
        return "En Curso";
      case "completado":
        return "Completado";
      case "sin_clientes":
        return "Sin Clientes";
      default:
        return "Desconocido";
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
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