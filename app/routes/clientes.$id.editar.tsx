import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, Form, useActionData } from "react-router";
import { useState, useEffect, useRef } from "react";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";
import { getClienteById, updateCliente } from "~/lib/database.server";
import type { Cliente, UpdateCliente, SessionUser } from "~/types/database";
import { MapComponent, useLeafletComponents } from "~/components/ui/MapComponent";
import { LeafletStyles } from "~/components/clientes/ClienteMap";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await redirectIfNotAuthenticated(request);
  
  if (!params.id) {
    throw new Response("ID de cliente requerido", { status: 400 });
  }

  const cliente = await getClienteById(parseInt(params.id));
  
  if (!cliente) {
    throw new Response("Cliente no encontrado", { status: 404 });
  }

  return { user, cliente };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await redirectIfNotAuthenticated(request);
  
  if (!params.id) {
    throw new Response("ID de cliente requerido", { status: 400 });
  }

  const formData = await request.formData();
  const clienteId = parseInt(params.id);

  try {
    const updateData: UpdateCliente = {
      id: clienteId,
      codigoalte: formData.get("codigoalte")?.toString() || undefined,
      razonsocial: formData.get("razonsocial")?.toString() || undefined,
      nombre: formData.get("nombre")?.toString() || "",
      direccion: formData.get("direccion")?.toString() || "",
      telefono: formData.get("telefono")?.toString() || undefined,
      rut: formData.get("rut")?.toString() || undefined,
      estado: formData.get("estado")?.toString() || "Activo",
      longitud: formData.get("longitud") ? parseFloat(formData.get("longitud")!.toString()) : undefined,
      latitud: formData.get("latitud") ? parseFloat(formData.get("latitud")!.toString()) : undefined,
    };

    const updatedCliente = await updateCliente(clienteId, updateData);
    
    return { success: true, cliente: updatedCliente };
  } catch (error) {
    console.error("Error updating cliente:", error);
    return { 
      success: false, 
      error: "Error al actualizar el cliente. Por favor, intenta de nuevo." 
    };
  }
}

export default function EditarCliente() {
  const { user, cliente } = useLoaderData<{ user: SessionUser; cliente: Cliente }>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    navigate(`/clientes/${cliente.id}`);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  // Redirigir si se guardó exitosamente
  if (actionData?.success) {
    navigate(`/clientes/${cliente.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Volver al Cliente
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Editando: {cliente.nombre}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          
          {/* Header del Formulario */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Editar Cliente</h1>
                <p className="text-blue-100 text-sm">Actualiza la información del cliente</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <Form method="post" onSubmit={handleSubmit} className="p-6">
            {actionData?.error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-red-800 font-medium">{actionData.error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Información Principal */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Información Principal
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Nombre *"
                      name="nombre"
                      type="text"
                      defaultValue={cliente.nombre}
                      required
                      placeholder="Ej: Farmacia San Juan"
                    />
                    
                    <FormField
                      label="Razón Social"
                      name="razonsocial"
                      type="text"
                      defaultValue={cliente.razonsocial || ""}
                      placeholder="Ej: Farmacia San Juan S.A."
                    />
                    
                    <FormField
                      label="Código Alternativo"
                      name="codigoalte"
                      type="text"
                      defaultValue={cliente.codigoalte || ""}
                      placeholder="Ej: FSJ001"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      <select
                        name="estado"
                        defaultValue={cliente.estado || "Activo"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Contacto
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Teléfono"
                      name="telefono"
                      type="tel"
                      defaultValue={cliente.telefono || ""}
                      placeholder="Ej: +54 11 1234-5678"
                    />
                    
                    <FormField
                      label="RUT/CUIT"
                      name="rut"
                      type="text"
                      defaultValue={cliente.rut || ""}
                      placeholder="Ej: 27-12345678-9"
                    />
                    
                    <FormField
                      label="Dirección *"
                      name="direccion"
                      type="text"
                      defaultValue={cliente.direccion}
                      required
                      placeholder="Ej: Av. Corrientes 1234, CABA"
                    />
                  </div>
                </div>
              </div>

              {/* Coordenadas GPS con Mapa Interactivo */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Ubicación GPS
                  </h3>
                  
                  <InteractiveLocationSelector
                    initialLat={cliente.latitud}
                    initialLng={cliente.longitud}
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
}

function FormField({ label, name, type, defaultValue, required, placeholder, step }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
      />
    </div>
  );
}

interface InteractiveLocationSelectorProps {
  initialLat?: number | null;
  initialLng?: number | null;
}

function InteractiveLocationSelector({ initialLat, initialLng }: InteractiveLocationSelectorProps) {
  const components = useLeafletComponents();
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [-34.6037, -58.3816] // Buenos Aires por defecto
  );
  const markerRef = useRef<any>(null);

  // Actualizar los inputs hidden cuando cambien las coordenadas
  useEffect(() => {
    if (coordinates) {
      const latInput = document.querySelector('input[name="latitud"]') as HTMLInputElement;
      const lngInput = document.querySelector('input[name="longitud"]') as HTMLInputElement;
      if (latInput) latInput.value = coordinates.lat.toString();
      if (lngInput) lngInput.value = coordinates.lng.toString();
    }
  }, [coordinates]);

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setCoordinates({ lat, lng });
  };

  const handleMarkerDragEnd = (e: any) => {
    const { lat, lng } = e.target.getLatLng();
    setCoordinates({ lat, lng });
  };

  if (!components) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <p className="text-gray-600">Cargando mapa interactivo...</p>
      </div>
    );
  }

  const { Marker } = components;

  return (
    <div className="space-y-4">
      {/* Inputs ocultos para el formulario */}
      <input type="hidden" name="latitud" defaultValue={coordinates?.lat || ""} />
      <input type="hidden" name="longitud" defaultValue={coordinates?.lng || ""} />
      
      {/* Coordenadas actuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-3 border">
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
          <div className="text-sm font-mono text-gray-900">
            {coordinates ? coordinates.lat.toFixed(6) : 'No seleccionada'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
          <div className="text-sm font-mono text-gray-900">
            {coordinates ? coordinates.lng.toFixed(6) : 'No seleccionada'}
          </div>
        </div>
      </div>

      {/* Mapa interactivo */}
      <div className="bg-white rounded-lg p-3 border">
        <div className="mb-3">
          <p className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Haz clic en el mapa o arrastra el marcador para establecer la ubicación
          </p>
        </div>
        
        <div className="rounded-lg overflow-hidden border">
          <MapComponent 
            center={mapCenter}
            zoom={15}
            style={{ height: '400px', width: '100%' }}
          >
            <MapClickHandler onMapClick={handleMapClick} />
            {coordinates && (
              <DraggableMarker
                position={[coordinates.lat, coordinates.lng]}
                onDragEnd={handleMarkerDragEnd}
                Marker={Marker}
              />
            )}
          </MapComponent>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            // Centrar en Buenos Aires
            setMapCenter([-34.6037, -58.3816]);
            setCoordinates({ lat: -34.6037, lng: -58.3816 });
          }}
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        >
          📍 Buenos Aires
        </button>
        
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setMapCenter([lat, lng]);
                setCoordinates({ lat, lng });
              });
            }
          }}
          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
        >
          🎯 Mi Ubicación
        </button>
        
        {coordinates && (
          <button
            type="button"
            onClick={() => setCoordinates(null)}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            🗑️ Limpiar
          </button>
        )}
      </div>

      <LeafletStyles />
    </div>
  );
}

interface DraggableMarkerProps {
  position: [number, number];
  onDragEnd: (e: any) => void;
  Marker: any;
}

function DraggableMarker({ position, onDragEnd, Marker }: DraggableMarkerProps) {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: onDragEnd,
      }}
    />
  );
}

interface MapClickHandlerProps {
  onMapClick: (e: any) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  const components = useLeafletComponents();
  
  if (!components) return null;
  
  const { useMap } = components;
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      map.on('click', onMapClick);
      return () => {
        map.off('click', onMapClick);
      };
    }
  }, [map, onMapClick]);

  return null;
}