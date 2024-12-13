import { useState } from 'react'
import { Battery, Zap } from 'lucide-react'

interface LeftPanelProps {
  batteryLevel: number
  currentSpeed: number
  totalDistance: number
}

export default function LeftPanel({ batteryLevel, currentSpeed, totalDistance }: LeftPanelProps) {
  const [powerMode, setPowerMode] = useState('standard')
  const [regenStatus, setRegenStatus] = useState('Standing By')

  const handlePowerModeChange = (mode: string) => {
    setPowerMode(mode)
  }

  return (
    <div className="col-span-3 space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Battery Status</h2>
          <Battery className="text-green-500" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-green-500">{batteryLevel}%</div>
          <div>
            <p>Range: {Math.round((batteryLevel / 100) * 330)} mi</p>
            <p>Time to empty: {Math.round((batteryLevel / 100) * 6.5)}h {Math.round(((batteryLevel / 100) * 6.5 % 1) * 60)}m</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${batteryLevel}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Current Speed</h2>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">{Math.round(currentSpeed)}<span className="text-xl ml-1">mph</span></div>
          <p className="text-sm text-gray-600">
            {currentSpeed > 65 ? 'Above' : currentSpeed < 45 ? 'Below' : ''} Optimal Range Speed
          </p>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">Total Distance</p>
          <p className="text-xl font-semibold">{totalDistance.toFixed(1)} mi</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Power Mode</h2>
        <div className="flex space-x-2">
          {['eco', 'standard', 'performance'].map(mode => (
            <button
              key={mode}
              className={`flex-1 py-2 px-3 rounded-md text-sm capitalize ${powerMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => handlePowerModeChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Regenerative Braking</h2>
          <Zap className={regenStatus === 'Active' ? 'text-green-500' : 'text-gray-400'} />
        </div>
        <p className="text-sm text-gray-600">{regenStatus}</p>
        <p className="text-xs text-green-500">+2.3 kWh Recovered Today</p>
      </div>
    </div>
  )
}

