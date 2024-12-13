import { Bell, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h1 className="text-xl font-bold">EV Fleet Dashboard</h1>
            <p className="text-sm text-gray-600">Driver: John Smith</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </div>
          <Settings className="w-6 h-6 text-gray-600 cursor-pointer" />
        </div>
      </div>
    </header>
  )
}

