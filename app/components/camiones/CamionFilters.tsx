import { SearchInput } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";

interface CamionFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewCamion: () => void;
}

export function CamionFilters({ 
  searchValue, 
  onSearchChange, 
  onNewCamion 
}: CamionFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6">
        <div className="flex gap-4">
          <SearchInput
            placeholder="Buscar por nombre de camión..."
            defaultValue={searchValue}
            onChange={onSearchChange}
            className="flex-1"
          />
          <Button onClick={onNewCamion}>
            + Nuevo Camión
          </Button>
        </div>
      </div>
    </div>
  );
}