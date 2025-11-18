import { useState, useMemo } from "react";
import type { Cliente } from "~/types/database";

interface ClienteManagerProps {
  clientes: Cliente[];
  clientesAsignados: Cliente[];
  selectedClientes: number[];
  onClienteToggle: (clienteId: number) => void;
}

export function ClienteManager({ 
  clientes, 
  clientesAsignados, 
  selectedClientes, 
  onClienteToggle 
}: ClienteManagerProps) {
  const [activeTab, setActiveTab] = useState<'asignados' | 'agregar'>('asignados');
  const [searchTerm, setSearchTerm] = useState("");
  
  const clientesAsignadosIds = clientesAsignados.map(c => c.id);
  const clientesDisponibles = clientes.filter(c => !clientesAsignadosIds.includes(c.id));
  
  // Filtrar clientes disponibles por búsqueda
  const filteredDisponibles = useMemo(() => {
    if (!searchTerm.trim()) return clientesDisponibles;
    
    const term = searchTerm.toLowerCase();
    return clientesDisponibles.filter(cliente => 
      cliente.nombre.toLowerCase().includes(term) ||
      cliente.direccion?.toLowerCase().includes(term) ||
      cliente.telefono?.includes(term) ||
      cliente.rut?.includes(term)
    );
  }, [clientesDisponibles, searchTerm]);

  const handleRemoveCliente = (clienteId: number) => {
    onClienteToggle(clienteId);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('asignados')}
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'asignados'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Clientes Asignados ({clientesAsignados.length})
          </button>
          <button
            onClick={() => setActiveTab('agregar')}
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'agregar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Agregar Clientes ({selectedClientes.filter(id => !clientesAsignadosIds.includes(id)).length})
          </button>
        </nav>
      </div>

      {/* Contenido de Clientes Asignados */}
      {activeTab === 'asignados' && (
        <div className="space-y-3">
          {clientesAsignados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">No hay clientes asignados</p>
              <p className="text-gray-600">
                Utiliza la pestaña "Agregar Clientes" para asignar clientes a este reparto
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {clientesAsignados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {cliente.nombre}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {cliente.direccion}
                        </div>
                        {(cliente.telefono || cliente.rut) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {cliente.telefono && <span>📞 {cliente.telefono}</span>}
                            {cliente.telefono && cliente.rut && <span className="mx-2">•</span>}
                            {cliente.rut && <span>🆔 {cliente.rut}</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 ml-4 flex-shrink-0">
                        ID: {cliente.id}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCliente(cliente.id)}
                    className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-100 p-2 rounded-md transition-colors"
                    title="Quitar cliente del reparto"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenido de Agregar Clientes */}
      {activeTab === 'agregar' && (
        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar clientes para agregar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Lista de clientes disponibles */}
          <div className="border border-gray-200 rounded-md">
            {filteredDisponibles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No se encontraron clientes disponibles con "<strong>{searchTerm}</strong>"</p>
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="text-blue-600 hover:text-blue-700 mt-2"
                    >
                      Limpiar búsqueda
                    </button>
                  </>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Todos los clientes ya están asignados a este reparto</p>
                  </>
                )}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredDisponibles.map((cliente, index) => (
                  <label
                    key={cliente.id}
                    className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                      index !== filteredDisponibles.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClientes.includes(cliente.id)}
                      onChange={() => onClienteToggle(cliente.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {cliente.nombre}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {cliente.direccion}
                          </div>
                          {(cliente.telefono || cliente.rut) && (
                            <div className="text-xs text-gray-400 mt-1">
                              {cliente.telefono && <span>📞 {cliente.telefono}</span>}
                              {cliente.telefono && cliente.rut && <span className="mx-2">•</span>}
                              {cliente.rut && <span>🆔 {cliente.rut}</span>}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 ml-4 flex-shrink-0">
                          ID: {cliente.id}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Resumen de nuevos clientes seleccionados */}
          {selectedClientes.filter(id => !clientesAsignadosIds.includes(id)).length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm text-blue-700">
                  <strong>{selectedClientes.filter(id => !clientesAsignadosIds.includes(id)).length}</strong> nuevo{selectedClientes.filter(id => !clientesAsignadosIds.includes(id)).length !== 1 ? 's' : ''} cliente{selectedClientes.filter(id => !clientesAsignadosIds.includes(id)).length !== 1 ? 's' : ''} para agregar
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campo oculto para el formulario */}
      <input 
        type="hidden" 
        name="clientes" 
        value={JSON.stringify(selectedClientes)} 
      />
    </div>
  );
}