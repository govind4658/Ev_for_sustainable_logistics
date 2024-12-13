'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useLoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'

interface ChargingStation {
  position: google.maps.LatLngLiteral;
  name: string;
}

interface OptimizedMapProps {
  origin: string;
  destination: string;
  chargingStations: ChargingStation[];
}

const OptimizedMap: React.FC<OptimizedMapProps> = ({ origin, destination, chargingStations }) => {
  const mapRef = useRef<GoogleMap>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const center = { lat: 20.5937, lng: 78.9629 }; // Center of India

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCT3SoP4-ZRy0T_1HcMpQojBL2VynUYmv8",
    libraries: ["places"],
  });

  useEffect(() => {
    if (isLoaded && origin && destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            setDirections(result);
          }
        }
      );
    }
  }, [isLoaded, origin, destination]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Optimized Route Map</h2>
        <MapPin className="text-blue-600" />
      </div>
      <div className="h-[400px] rounded-lg">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          zoom={5}
          center={center}
          onLoad={onMapLoad}
        >
          {chargingStations.map((station, index) => (
            <Marker
              key={index}
              position={station.position}
              title={station.name}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
              }}
            />
          ))}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    </div>
  );
};

export default OptimizedMap;

