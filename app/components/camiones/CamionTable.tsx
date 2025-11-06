import { Link } from "react-router";
import type { CamionWithStats } from "~/lib/database.server";

interface CamionTableProps {
  camiones: CamionWithStats[];
}

export function CamionTable({ camiones }: CamionTableProps) {
  if (camiones.length === 0) {
    return <EmptyCamionState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <CamionTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {camiones.map((camion) => (
            <CamionTableRow key={camion.id} camion={camion} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CamionTableHeader() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          ID
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Nombre/Conductor
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Repartos
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

interface CamionTableRowProps {
  camion: CamionWithStats;
}

function CamionTableRow({ camion }: CamionTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          #{camion.id}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {camion.nombre}
          </div>
          <div className="text-sm text-gray-500">
            Conductor asignado
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          Total: {camion.total_repartos || 0}
        </div>
        <div className="text-sm text-gray-500">
          Activos: {camion.repartos_activos || 0}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CamionStatusBadge 
          status={camion.repartos_activos && camion.repartos_activos > 0 ? "en_ruta" : "disponible"} 
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <CamionActions camionId={camion.id} />
      </td>
    </tr>
  );
}

interface CamionStatusBadgeProps {
  status: string;
}

function CamionStatusBadge({ status }: CamionStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800";
      case "en_ruta":
        return "bg-blue-100 text-blue-800";
      case "mantenimiento":
        return "bg-yellow-100 text-yellow-800";
      case "fuera_servicio":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "disponible":
        return "Disponible";
      case "en_ruta":
        return "En Ruta";
      case "mantenimiento":
        return "Mantenimiento";
      case "fuera_servicio":
        return "Fuera Servicio";
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

interface CamionActionsProps {
  camionId: number;
}

function CamionActions({ camionId }: CamionActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        to={`/camiones/${camionId}`}
        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50"
      >
        Ver
      </Link>
      <Link
        to={`/camiones/${camionId}/editar`}
        className="text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded-md hover:bg-yellow-50"
      >
        Editar
      </Link>
    </div>
  );
}

function EmptyCamionState() {
  return (
    <div className="p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay camiones registrados
      </h3>
      <p className="text-gray-600 mb-6">
        Agrega camiones a tu flota para comenzar con los repartos
      </p>
      <Link
        to="/camiones/nuevo"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        + Agregar Camión
      </Link>
    </div>
  );
}