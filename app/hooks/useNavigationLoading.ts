import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

export function useNavigationLoading() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mostrar loading cuando hay navegación en progreso
    if (navigation.state === "loading" || navigation.state === "submitting") {
      setIsLoading(true);
    } else {
      // Pequeño delay para evitar flashing en navegaciones muy rápidas
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);

  const getLoadingMessage = () => {
    switch (navigation.state) {
      case "submitting":
        return "Guardando cambios...";
      case "loading":
        return "Cargando página...";
      default:
        return "Cargando...";
    }
  };

  return {
    isLoading,
    loadingMessage: getLoadingMessage(),
    navigationState: navigation.state
  };
}