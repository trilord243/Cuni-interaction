import { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { Popup } from './components/Popup'

interface PopupData {
  title: string
  message: string
}

function App() {
  const [currentPopup, setCurrentPopup] = useState<PopupData | null>(null)
  const [autoMode, setAutoMode] = useState(true)
  const [freeMode, setFreeMode] = useState(false)
  const advanceCallbackRef = useRef<(() => void) | null>(null)

  const handleZoneEnter = (_zoneName: string, zoneData: PopupData) => {
    setCurrentPopup(zoneData)
  }

  const handleZoneExit = () => {
    setCurrentPopup(null)
  }

  const handleClosePopup = () => {
    setCurrentPopup(null)
    // When popup closes in auto mode, advance to next waypoint
    if (autoMode && advanceCallbackRef.current) {
      advanceCallbackRef.current()
    }
  }

  const handleRegisterAdvance = (callback: () => void) => {
    advanceCallbackRef.current = callback
  }

  const handleTourComplete = () => {
    setFreeMode(true)
    setAutoMode(false)
  }

  const handleSkipTour = () => {
    setFreeMode(true)
    setAutoMode(false)
    setCurrentPopup(null) // Close any open popup
  }

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 12, 8], fov: 35 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene
            onZoneEnter={handleZoneEnter}
            onZoneExit={handleZoneExit}
            autoMode={autoMode}
            onRegisterAdvance={handleRegisterAdvance}
            onTourComplete={handleTourComplete}
            freeMode={freeMode}
          />
        </Suspense>
      </Canvas>

      <div className="instructions">
        {freeMode ? (
          <>
            <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> o{' '}
            <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> para moverte libremente
          </>
        ) : (
          <>
            Tour Guiado - Cierra el popup para avanzar al siguiente punto
          </>
        )}
      </div>

      {/* Skip tour button - only visible during guided tour */}
      {!freeMode && (
        <button
          onClick={handleSkipTour}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 1000,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.backgroundColor = '#f57c00'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#ff9800'
          }}
        >
          ⏭️ Saltar Tour
        </button>
      )}

      {currentPopup && (
        <Popup
          title={currentPopup.title}
          message={currentPopup.message}
          onClose={handleClosePopup}
        />
      )}
    </>
  )
}

export default App
