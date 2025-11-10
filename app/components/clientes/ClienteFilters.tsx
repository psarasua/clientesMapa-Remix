import { SearchInput } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";

interface ClienteFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function ClienteFilters({ 
  searchValue, 
  onSearchChange 
}: Omit<ClienteFiltersProps, 'onNewCliente'>) {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6">
        <SearchInput
          placeholder="Buscar por nombre o dirección..."
          defaultValue={searchValue}
          onChange={onSearchChange}
          className="w-full"
        />
      </div>
    </div>
  );
}