'use client'

import React, { useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';

interface LocationPickerProps {
  label: string;
  onLocationSelect: (location: google.maps.LatLngLiteral) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  label,
  onLocationSelect,
}) => {
  const [address, setAddress] = useState('');

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCT3SoP4-ZRy0T_1HcMpQojBL2VynUYmv8",
    libraries: ["places"],
  });

  const handleSelect = async (value: string) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    onLocationSelect(latLng);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <PlacesAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <label htmlFor={label} className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              {...getInputProps({
                placeholder: `Enter ${label.toLowerCase()}`,
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50",
                id: label,
              })}
            />
            <div className="absolute z-10 w-full bg-white shadow-md max-h-60 overflow-auto">
              {loading && <div className="p-2">Loading...</div>}
              {suggestions.map(suggestion => {
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      style,
                      className: "p-2 hover:bg-gray-100",
                    })}
                    key={suggestion.placeId}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
};

export default LocationPicker;

