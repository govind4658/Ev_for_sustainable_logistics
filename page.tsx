'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import LeftPanel from '../components/LeftPanel'
import CenterPanel from '../components/CenterPanel'
import RightPanel from '../components/RightPanel'
import RouteOptimizer from '../components/RouteOptimizer'

export default function Dashboard() {
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [currentSpeed, setCurrentSpeed] = useState(55)
  const [totalDistance, setTotalDistance] = useState(12458.7)
  const [currentLoad, setCurrentLoad] = useState(12450)
  const [deliveryProgress, setDeliveryProgress] = useState(75)

  useEffect(() => {
    // Simulated data updates
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))))
      setCurrentSpeed(prev => Math.max(0, Math.min(75, prev + (Math.random() > 0.5 ? 1 : -1))))
      setTotalDistance(prev => prev + (currentSpeed / 3600))
      setCurrentLoad(prev => Math.max(0, Math.min(14500, prev + Math.round((Math.random() - 0.5) * 100))))
      setDeliveryProgress(prev => Math.min(100, prev + 0.5))
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSpeed])

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <LeftPanel 
            batteryLevel={batteryLevel} 
            currentSpeed={currentSpeed} 
            totalDistance={totalDistance} 
          />
          <CenterPanel />
          <RightPanel 
            currentLoad={currentLoad} 
            deliveryProgress={deliveryProgress} 
          />
        </div>
        <RouteOptimizer 
          batteryLevel={batteryLevel} 
          currentLoad={currentLoad} 
        />
      </div>
    </div>
  )
}

