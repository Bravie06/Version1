import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import { DataProvider } from './hooks/DataProvider'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)

  return (
    <DataProvider>
      {!showDashboard ? (
        <LandingPage onContinue={() => setShowDashboard(true)} />
      ) : (
        <DashboardPage />
      )}
    </DataProvider>
  )
}

export default App
