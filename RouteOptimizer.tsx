'use client'
import { useState, useEffect } from 'react'
import { Route } from 'lucide-react'

interface RouteOptimizerProps {
  batteryLevel: number
  currentLoad: number
  onCalculateRoute: (start: string, end: string) => void
}

interface ChargingStation {
  id: number
  station_name: string | null
  address: string
  lat: number
  lng: number
  distance?: number
  duration?: number
}

interface RouteInfo {
  totalDistance: number
  estimatedDuration: number
  suggestedStops: ChargingStation[]
  routeWarnings: string[]
}

export default function RouteOptimizer({ batteryLevel, currentLoad, onCalculateRoute }: RouteOptimizerProps) {
  const [startPoint, setStartPoint] = useState('')
  const [endPoint, setEndPoint] = useState('')
  const [optimizationPriority, setOptimizationPriority] = useState('balanced')
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Constants for EV calculations
  const BATTERY_RANGE_KM = 300 // Assumed max range on full battery
  const SAFE_BATTERY_THRESHOLD = 20 // Minimum battery percentage to maintain
  const AVERAGE_CONSUMPTION = 0.2 // kWh per km (example value)

  const fetchNearbyChargingStations = async (lat: number, lng: number, radius: number = 50) => {
    try {
      const authToken = await fetchAuthToken() // Implementation from previous component
      const response = await fetch('https://www.ulipstaging.dpiit.gov.in/ulip/v1.0.0/EVYATRA/01', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          lat: lat.toString(),
          long: lng.toString(),
          stateId: "",
          cityId: ""
        })
      })
      const data = await response.json()
      return data.response[0].response
    } catch (error) {
      console.error('Error fetching charging stations:', error)
      return []
    }
  }

  const calculateRouteWithChargingStations = async (
    origin: string,
    destination: string,
    batteryLevel: number
  ) => {
    try {
      setLoading(true)
      setError(null)

      // 1. Get route details from Google Maps API
      const directionsService = new google.maps.DirectionsService()
      const routeResult = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING
      })

      if (!routeResult.routes[0]) {
        throw new Error('No route found')
      }

      const route = routeResult.routes[0]
      const totalDistance = route.legs[0].distance?.value || 0 // in meters
      const totalDuration = route.legs[0].duration?.value || 0 // in seconds

      // 2. Calculate if charging stops are needed
      const distanceKm = totalDistance / 1000
      const currentRange = (batteryLevel / 100) * BATTERY_RANGE_KM
      const needsCharging = distanceKm > currentRange

      const routeWarnings: string[] = []
      const suggestedStops: ChargingStation[] = []

      if (needsCharging) {
        // 3. Find potential charging points along the route
        const steps = route.legs[0].steps
        let accumulatedDistance = 0
        
        for (const step of steps) {
          accumulatedDistance += step.distance?.value || 0
          
          if (accumulatedDistance / 1000 >= (currentRange * 0.7)) { // Look for stations at 70% of range
            const location = step.end_location
            const nearbyStations = await fetchNearbyChargingStations(
              location.lat(),
              location.lng()
            )

            if (nearbyStations.length > 0) {
              // Add distance and duration to station info
              const stationWithDetails = await Promise.all(
                nearbyStations.slice(0, 3).map(async (station: ChargingStation) => {
                  const detourResult = await directionsService.route({
                    origin: `${step.end_location.lat()},${step.end_location.lng()}`,
                    destination: `${station.lat},${station.lng}`,
                    travelMode: google.maps.TravelMode.DRIVING
                  })

                  return {
                    ...station,
                    distance: detourResult.routes[0].legs[0].distance?.value,
                    duration: detourResult.routes[0].legs[0].duration?.value
                  }
                })
              )

              suggestedStops.push(...stationWithDetails)
              accumulatedDistance = 0 // Reset distance after finding a charging station
            }
          }
        }

        if (suggestedStops.length === 0) {
          routeWarnings.push('No charging stations found along the route. Consider an alternative route or ensure full charge before departure.')
        }
      }

      setRouteInfo({
        totalDistance: distanceKm,
        estimatedDuration: totalDuration / 3600, // Convert to hours
        suggestedStops,
        routeWarnings
      })

    } catch (error) {
      setError('Failed to calculate optimal route. Please try again.')
      console.error('Route calculation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onCalculateRoute(startPoint, endPoint)
    await calculateRouteWithChargingStations(startPoint, endPoint, batteryLevel)
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Route Optimization Engine</h2>
        <Route className="text-blue-600" />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="start-point" className="block text-sm font-medium text-gray-700">Starting Point</label>
            <input 
              type="text" 
              id="start-point" 
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
              placeholder="Enter starting location" 
            />
          </div>
          <div>
            <label htmlFor="end-point" className="block text-sm font-medium text-gray-700">Destination</label>
            <input 
              type="text" 
              id="end-point" 
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
              placeholder="Enter destination" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Battery Level</label>
              <div className={`mt-1 p-2 rounded-md text-white ${
                batteryLevel > 50 ? 'bg-green-500' : 
                batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {batteryLevel}%
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Load</label>
              <div className="mt-1 p-2 bg-gray-100 rounded-md text-blue-600">{currentLoad} lbs</div>
            </div>
          </div>
          <div>
            <label htmlFor="optimization-priority" className="block text-sm font-medium text-gray-700">Optimization Priority</label>
            <select 
              id="optimization-priority" 
              value={optimizationPriority}
              onChange={(e) => setOptimizationPriority(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="balanced">Balanced</option>
              <option value="eco">Eco-Friendly</option>
              <option value="time">Fastest Time</option>
              <option value="cost">Lowest Cost</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Optimal Route'}
          </button>
        </form>
        
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {routeInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-lg mb-2">Route Summary</h3>
                <p>Total Distance: {routeInfo.totalDistance.toFixed(1)} km</p>
                <p>Estimated Duration: {routeInfo.estimatedDuration.toFixed(1)} hours</p>
                <p>Battery Range: {(batteryLevel / 100 * BATTERY_RANGE_KM).toFixed(1)} km</p>
              </div>

              {routeInfo.suggestedStops.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h3 className="font-medium text-lg mb-2">Suggested Charging Stops</h3>
                  <div className="space-y-2">
                    {routeInfo.suggestedStops.map((station, index) => (
                      <div key={station.id} className="p-2 bg-white rounded-md shadow-sm">
                        <p className="font-medium">
                          {station.station_name || `Charging Station ${station.id}`}
                        </p>
                        <p className="text-sm text-gray-600">{station.address}</p>
                        {station.distance && station.duration && (
                          <p className="text-sm text-gray-500">
                            Detour: {(station.distance / 1000).toFixed(1)} km 
                            ({(station.duration / 60).toFixed(0)} mins)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {routeInfo.routeWarnings.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-md">
                  <h3 className="font-medium text-lg mb-2">Route Warnings</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {routeInfo.routeWarnings.map((warning, index) => (
                      <li key={index} className="text-yellow-700">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

