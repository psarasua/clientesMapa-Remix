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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <SearchInput
                placeholder="Buscar camión por nombre o conductor..."
                defaultValue={searchValue}
                onChange={onSearchChange}
                className="pl-10 w-full"
              />
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={onNewCamion}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Camión
            </Button>
          </div>
        </div>
        

      </div>
    </div>
  );
}