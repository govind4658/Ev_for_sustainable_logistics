import { Leaf, MessageSquare } from 'lucide-react'

interface RightPanelProps {
  currentLoad: number
  deliveryProgress: number
}

export default function RightPanel({ currentLoad, deliveryProgress }: RightPanelProps) {
  return (
    <div className="col-span-3 space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Sustainability Metrics</h2>
          <Leaf className="text-green-500" />
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600">CO₂ Saved vs. Diesel</p>
          <p className="text-2xl font-bold text-green-500">1,245 kg</p>
          <p className="text-xs text-gray-600">50% reduction from baseline</p>
        </div>
        <div className="h-32 bg-gray-100 rounded-lg mb-4">
          {/* Placeholder for energy source chart */}
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Eco Score</span>
            <span className="text-sm font-semibold">85/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Current Delivery</h2>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${deliveryProgress}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{Math.round(deliveryProgress)}% Complete</span>
            <span>ETA: {new Date().getHours() + 2}:{new Date().getMinutes().toString().padStart(2, '0')} PM</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Fleet Communication</h2>
          <MessageSquare className="text-blue-600" />
        </div>
        <p className="text-sm text-gray-600">No new messages</p>
      </div>
    </div>
  )
}

