import { useState, useMemo } from "react";
import type { Cliente } from "~/types/database";

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedClientes: number[];
  onClienteToggle: (clienteId: number) => void;
}

export function ClienteSelector({ clientes, selectedClientes, onClienteToggle }: ClienteSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Filtrar clientes basado en búsqueda
  const filteredClientes = useMemo(() => {
    let filtered = clientes;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cliente => 
        cliente.nombre.toLowerCase().includes(term) ||
        cliente.direccion?.toLowerCase().includes(term) ||
        cliente.telefono?.includes(term) ||
        cliente.rut?.includes(term)
      );
    }

    // Filtrar solo seleccionados si está activado
    if (showOnlySelected) {
      filtered = filtered.filter(cliente => selectedClientes.includes(cliente.id));
    }

    return filtered;
  }, [clientes, searchTerm, showOnlySelected, selectedClientes]);

  const handleSelectAll = () => {
    const visibleIds = filteredClientes.map(c => c.id);
    const allSelected = visibleIds.every(id => selectedClientes.includes(id));
    
    if (allSelected) {
      // Deseleccionar todos los visibles
      visibleIds.forEach(id => {
        if (selectedClientes.includes(id)) {
          onClienteToggle(id);
        }
      });
    } else {
      // Seleccionar todos los visibles
      visibleIds.forEach(id => {
        if (!selectedClientes.includes(id)) {
          onClienteToggle(id);
        }
      });
    }
  };

  const clearSelection = () => {
    selectedClientes.forEach(id => onClienteToggle(id));
  };

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{selectedClientes.length}</span> clientes seleccionados
          {searchTerm && (
            <span className="ml-2">
              de <span className="font-medium">{filteredClientes.length}</span> encontrados
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {selectedClientes.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50"
            >
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar clientes por nombre, dirección, teléfono, RUT..."
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

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showOnlySelected}
            onChange={(e) => setShowOnlySelected(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
          />
          <span className="text-sm text-gray-700">Mostrar solo seleccionados</span>
        </label>

        {filteredClientes.length > 0 && !showOnlySelected && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50"
          >
            {filteredClientes.every(c => selectedClientes.includes(c.id)) ? 'Deseleccionar' : 'Seleccionar'} todos los visibles
          </button>
        )}
      </div>

      {/* Lista de clientes */}
      <div className="border border-gray-200 rounded-md">
        {filteredClientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>No se encontraron clientes con "<strong>{searchTerm}</strong>"</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 hover:text-blue-700 mt-2"
                >
                  Limpiar búsqueda
                </button>
              </>
            ) : showOnlySelected ? (
              <>
                <p>No hay clientes seleccionados</p>
                <button
                  type="button"
                  onClick={() => setShowOnlySelected(false)}
                  className="text-blue-600 hover:text-blue-700 mt-2"
                >
                  Mostrar todos los clientes
                </button>
              </>
            ) : (
              <p>No hay clientes disponibles</p>
            )}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredClientes.map((cliente, index) => (
              <label
                key={cliente.id}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                  index !== filteredClientes.length - 1 ? 'border-b border-gray-100' : ''
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

      {/* Resumen final */}
      {selectedClientes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-700">
              <strong>{selectedClientes.length}</strong> cliente{selectedClientes.length !== 1 ? 's' : ''} seleccionado{selectedClientes.length !== 1 ? 's' : ''} para este reparto
            </span>
          </div>
        </div>
      )}
    </div>
  );
}