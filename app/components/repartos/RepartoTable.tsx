import { Link, Form } from "react-router";
import type { Reparto } from "~/types/database";
import { useState } from "react";
import toast from "react-hot-toast";

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
        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Total Clientes
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
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {reparto.total_clientes || 0} cliente{(reparto.total_clientes || 0) !== 1 ? 's' : ''}
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
  const handleDelete = async () => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom((t) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 max-w-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            ¿Estás seguro de que quieres eliminar el reparto <strong>#{repartoId}</strong>?
          </p>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        position: 'top-center',
      });
    });

    if (confirmed) {
      // Crear un formulario y enviarlo
      const form = document.createElement('form');
      form.method = 'POST';
      form.style.display = 'none';
      
      const intentInput = document.createElement('input');
      intentInput.type = 'hidden';
      intentInput.name = 'intent';
      intentInput.value = 'delete';
      form.appendChild(intentInput);
      
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'repartoId';
      idInput.value = repartoId.toString();
      form.appendChild(idInput);
      
      document.body.appendChild(form);
      
      // Mostrar loading toast
      toast.promise(
        new Promise((resolve, reject) => {
          form.addEventListener('submit', () => resolve('success'));
          setTimeout(() => form.submit(), 100);
        }),
        {
          loading: 'Eliminando reparto...',
          success: 'Reparto eliminado exitosamente',
          error: 'Error al eliminar el reparto',
        }
      );
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Link
        to={`/repartos/${repartoId}/mapa`}
        className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md hover:bg-green-50"
        title="Ver ubicaciones en mapa"
      >
        🗺️ Mapa
      </Link>
      <Link
        to={`/repartos/${repartoId}/editar`}
        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50"
      >
        Editar
      </Link>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50"
      >
        Eliminar
      </button>
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