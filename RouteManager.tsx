'use client'
import { useState, useEffect } from 'react'
import RouteOptimizer from './RouteOptimizer'
import OptimizedMap from './OptimizedMap'

interface ChargingStation {
  position: {
    lat: number
    lng: number
  }
  name: string
  id?: number
  address?: string
  pincode?: string | null
}

interface RouteManagerProps {
  batteryLevel: number
  currentLoad: number
}

interface ApiResponse {
  response: Array<{
    response: Array<{
      id: number
      station_name: string | null
      address: string
      lat: number
      lng: number
      pincode: string | null
    }>
  }>
}

const RouteManager: React.FC<RouteManagerProps> = ({ batteryLevel, currentLoad }) => {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuthToken = async () => {
    try {
      const response = await fetch('https://www.ulipstaging.dpiit.gov.in/ulip/v1.0.0/user/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJnb3ZpbmRfdXNyIiwiaWF0IjoxNzMzMjE0MjIwLCJhcHBzIjoiZGF0YXB1c2gifQ._hGAdSP6ISLX_hSYaZ0V-OtDWmytMmCoa15hGKqBYOo6U6FHezoeDZyqAq1WIieSA05Dannb2dyZUXBYZV_bRA'
        },
        body: JSON.stringify({
          username: "govind_usr",
          password: "govind@12345678"
        })
      })
      return response.headers.get('Authorization')
    } catch (error) {
      console.error('Auth error:', error)
      return null
    }
  }

  const fetchChargingStations = async () => {
    try {
      setLoading(true)
      const authToken = await fetchAuthToken()
      
      if (!authToken) {
        throw new Error('Authentication failed')
      }

      // Fetching stations for multiple major cities
      const cities = [
        { stateId: "21", cityId: "6602" }, // Example city 1
        { stateId: "22", cityId: "6603" }  // Example city 2
      ]

      const stationsPromises = cities.map(city =>
        fetch('https://www.ulipstaging.dpiit.gov.in/ulip/v1.0.0/EVYATRA/01', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authToken
          },
          body: JSON.stringify({
            stateId: city.stateId,
            cityId: city.cityId,
            lat: "",
            long: ""
          })
        })
      )

      const responses = await Promise.all(stationsPromises)
      const data: ApiResponse[] = await Promise.all(responses.map(r => r.json()))

      const allStations = data.flatMap(cityData => 
        cityData.response[0].response.map(station => ({
          position: {
            lat: station.lat,
            lng: station.lng
          },
          name: station.station_name || `Station ${station.id}`,
          id: station.id,
          address: station.address,
          pincode: station.pincode
        }))
      )

      setChargingStations(allStations)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch charging stations:', error)
      setError('Failed to load charging stations')
      setLoading(false)
      
      // Fallback to default stations if API fails
      setChargingStations([
        { position: { lat: 28.6139, lng: 77.2090 }, name: "Delhi Charging Station" },
        { position: { lat: 19.0760, lng: 72.8777 }, name: "Mumbai Charging Station" },
        { position: { lat: 12.9716, lng: 77.5946 }, name: "Bangalore Charging Station" },
        { position: { lat: 22.5726, lng: 88.3639 }, name: "Kolkata Charging Station" },
        { position: { lat: 13.0827, lng: 80.2707 }, name: "Chennai Charging Station" },
      ])
    }
  }

  useEffect(() => {
    fetchChargingStations()
  }, [])

  const handleCalculateRoute = (start: string, end: string) => {
    setOrigin(start)
    setDestination(end)
  }

  return (
    <div className="space-y-6">
      {loading && <div className="text-center">Loading charging stations...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      <OptimizedMap 
        origin={origin} 
        destination={destination} 
        chargingStations={chargingStations} 
      />
      <RouteOptimizer 
        batteryLevel={batteryLevel} 
        currentLoad={currentLoad} 
        onCalculateRoute={handleCalculateRoute}
      />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Available Charging Stations</h3>
        <div className="space-y-2">
          {chargingStations.map((station, index) => (
            <div key={station.id || index} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{station.name}</div>
              {station.address && (
                <div className="text-sm text-gray-600">{station.address}</div>
              )}
              <div className="text-sm text-gray-500">
                Lat: {station.position.lat.toFixed(4)}, Long: {station.position.lng.toFixed(4)}
              </div>
              {station.pincode && (
                <div className="text-sm text-gray-500">Pincode: {station.pincode}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RouteManager

