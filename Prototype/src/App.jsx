import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)

  if (!showDashboard) {
    return <LandingPage onContinue={() => setShowDashboard(true)} />
  }

  return <DashboardPage />
}

export default App
