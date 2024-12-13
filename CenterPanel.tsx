import { CloudSun } from 'lucide-react'
import RouteManager from './RouteManager'

interface CenterPanelProps {
  batteryLevel: number
  currentLoad: number
}

export default function CenterPanel({ batteryLevel, currentLoad }: CenterPanelProps) {
  return (
    <div className="col-span-6 space-y-6">
      <RouteManager batteryLevel={batteryLevel} currentLoad={currentLoad} />

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Weather Conditions</h2>
            <CloudSun className="text-yellow-500" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold">72°F</div>
            <div className="text-gray-600">Sunny</div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Optimal driving conditions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Load Status</h2>
          <div className="text-2xl font-bold">12,450 lbs</div>
          <p className="text-sm text-gray-600">50% of capacity</p>
        </div>
      </div>
    </div>
  )
}

