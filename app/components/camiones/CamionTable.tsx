import { Link } from "react-router";
import type { Camion } from "~/types/database";

interface CamionTableProps {
  camiones: Camion[];
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
          Camión
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

interface CamionTableRowProps {
  camion: Camion;
}

function CamionTableRow({ camion }: CamionTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      {/* Camión - Solo ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {camion.id}
        </div>
      </td>
      
      {/* Nombre */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {camion.nombre}
        </div>
      </td>
      
      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <CamionActions camionId={camion.id} nombre={camion.nombre} />
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
  nombre: string;
}

function CamionActions({ camionId, nombre }: CamionActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Link
        to={`/camiones/${camionId}`}
        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded-md hover:bg-blue-50 flex items-center"
        title={`Ver detalles de ${nombre}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      </Link>
      <Link
        to={`/camiones/${camionId}/editar`}
        className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded-md hover:bg-yellow-50 flex items-center"
        title={`Editar ${nombre}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </Link>
      <button
        onClick={() => {
          if (confirm(`¿Estás seguro de que quieres eliminar el camión "${nombre}"?`)) {
            // TODO: Implementar función de eliminar
            alert('Función de eliminar en desarrollo');
          }
        }}
        className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md hover:bg-red-50 flex items-center"
        title={`Eliminar ${nombre}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
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