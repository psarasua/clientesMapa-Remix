import { SearchInput } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";

interface RepartoFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewReparto: () => void;
  selectedCamion?: string;
  selectedRuta?: string;
  onCamionChange?: (camionId: string) => void;
  onRutaChange?: (rutaId: string) => void;
  camiones?: Array<{id: number, nombre: string}>;
  rutas?: Array<{id: number, nombre: string}>;
}

export function RepartoFilters({ 
  searchValue, 
  onSearchChange, 
  onNewReparto,
  selectedCamion,
  selectedRuta,
  onCamionChange,
  onRutaChange,
  camiones = [],
  rutas = []
}: RepartoFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchInput
            placeholder="Buscar repartos..."
            defaultValue={searchValue}
            onChange={onSearchChange}
            className="md:col-span-2"
          />
          
          {/* Filtro por Camión */}
          <div>
            <select
              value={selectedCamion || ""}
              onChange={(e) => onCamionChange?.(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los camiones</option>
              {camiones.map((camion) => (
                <option key={camion.id} value={camion.id.toString()}>
                  {camion.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Ruta */}
          <div>
            <select
              value={selectedRuta || ""}
              onChange={(e) => onRutaChange?.(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las rutas</option>
              {rutas.map((ruta) => (
                <option key={ruta.id} value={ruta.id.toString()}>
                  {ruta.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onNewReparto}>
            + Nuevo Reparto
          </Button>
        </div>
      </div>
    </div>
  );
}