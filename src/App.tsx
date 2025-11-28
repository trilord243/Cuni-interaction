import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { Popup } from './components/Popup'

interface PopupData {
  title: string
  message: string
}

function App() {
  const [currentPopup, setCurrentPopup] = useState<PopupData | null>(null)

  const handleZoneEnter = (_zoneName: string, zoneData: PopupData) => {
    setCurrentPopup(zoneData)
  }

  const handleZoneExit = () => {
    setCurrentPopup(null)
  }

  const handleClosePopup = () => {
    setCurrentPopup(null)
  }

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 12, 8], fov: 35 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene onZoneEnter={handleZoneEnter} onZoneExit={handleZoneExit} />
        </Suspense>
      </Canvas>

      <div className="instructions">
        Use <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or{' '}
        <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to move
        <br />
        Press <kbd>Space</kbd> to jump
      </div>

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
