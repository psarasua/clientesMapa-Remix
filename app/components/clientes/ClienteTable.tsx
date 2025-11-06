import { Link } from "react-router";
import type { Cliente } from "~/lib/database.server";

interface ClienteTableProps {
  clientes: Cliente[];
}

export function ClienteTable({ clientes }: ClienteTableProps) {
  if (clientes.length === 0) {
    return <EmptyClienteState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <ClienteTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {clientes.map((cliente) => (
            <ClienteTableRow key={cliente.id} cliente={cliente} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClienteTableHeader() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Cliente
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Contacto
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ubicación
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

interface ClienteTableRowProps {
  cliente: Cliente;
}

function ClienteTableRow({ cliente }: ClienteTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {cliente.nombre}
          </div>
          <div className="text-sm text-gray-500">
            ID: {cliente.id}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {cliente.telefono || "No registrado"}
        </div>
        <div className="text-sm text-gray-500">
          {cliente.rut || "Sin RUT"}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {cliente.direccion}
        </div>
        <div className="text-sm text-gray-500">
          {cliente.latitud && cliente.longitud 
            ? `${cliente.latitud}, ${cliente.longitud}`
            : "Sin coordenadas"
          }
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ClienteStatusBadge status={cliente.estado || "Activo"} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <ClienteActions clienteId={cliente.id} />
      </td>
    </tr>
  );
}

interface ClienteStatusBadgeProps {
  status: string;
}

function ClienteStatusBadge({ status }: ClienteStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "inactivo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}

interface ClienteActionsProps {
  clienteId: number;
}

function ClienteActions({ clienteId }: ClienteActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        to={`/clientes/${clienteId}`}
        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50"
      >
        Ver
      </Link>
      <Link
        to={`/clientes/${clienteId}/editar`}
        className="text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded-md hover:bg-yellow-50"
      >
        Editar
      </Link>
    </div>
  );
}

function EmptyClienteState() {
  return (
    <div className="p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay clientes registrados
      </h3>
      <p className="text-gray-600 mb-6">
        Comienza agregando tu primer cliente
      </p>
      <Link
        to="/clientes/nuevo"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        + Agregar Cliente
      </Link>
    </div>
  );
}