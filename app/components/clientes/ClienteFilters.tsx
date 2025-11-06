import { SearchInput } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";

interface ClienteFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewCliente: () => void;
}

export function ClienteFilters({ 
  searchValue, 
  onSearchChange, 
  onNewCliente 
}: ClienteFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6">
        <div className="flex gap-4">
          <SearchInput
            placeholder="Buscar por nombre o dirección..."
            defaultValue={searchValue}
            onChange={onSearchChange}
            className="flex-1"
          />
          <Button onClick={onNewCliente}>
            + Nuevo Cliente
          </Button>
        </div>
      </div>
    </div>
  );
}