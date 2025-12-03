import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { Scene, ZONE_DATA } from './components/Scene'
import Loader from './loader/Loader'

function LoadingScreen() {
  const { progress, active } = useProgress()
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!active && progress === 100) {
      // Esperar un poco antes de ocultar el loader
      const timer = setTimeout(() => setShow(false), 500)
      return () => clearTimeout(timer)
    }
  }, [active, progress])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 9999,
      background: '#374151',
    }}>
      <Loader message={`Cargando... ${progress.toFixed(0)}%`} />
    </div>
  )
}

function App() {
  const [currentZone, setCurrentZone] = useState<string | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const coinSoundRef = useRef<HTMLAudioElement>(null)

  // Controlar música
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  // Manejar tecla E para interactuar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && currentZone && !isInteracting) {
        setIsInteracting(true)
        // Reproducir sonido de moneda
        if (coinSoundRef.current) {
          coinSoundRef.current.currentTime = 0
          coinSoundRef.current.play()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentZone, isInteracting])

  // Reset interacción cuando cambia la zona
  useEffect(() => {
    setIsInteracting(false)
  }, [currentZone])

  const zoneData = currentZone ? ZONE_DATA[currentZone] : null

  return (
    <>
      <Canvas
        shadows="soft"
        camera={{ position: [0, 12, 8], fov: 35 }}
        gl={{
          antialias: true,
          toneMapping: 1,
          toneMappingExposure: 0.9,
        }}
      >
        <Suspense fallback={null}>
          <Scene onZoneChange={setCurrentZone} />
        </Suspense>
      </Canvas>

      {/* Pantalla de carga */}
      <LoadingScreen />

      {/* Audio de fondo */}
      <audio
        ref={audioRef}
        src="/Super Mario 64  Ambience Mushroom Castle   4K.mp3"
        loop
      />

      {/* Sonido de interacción */}
      <audio
        ref={coinSoundRef}
        src="/Super Mario 64 Coin Sound.mp3"
      />

      {/* Botón de música */}
      <button
        onClick={toggleMusic}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s',
          zIndex: 1000,
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title={isMusicPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>

      {/* Controles */}
      <div className="instructions">
        <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> mover
        <span style={{ margin: '0 10px' }}>|</span>
        <kbd>Shift</kbd> correr
        <span style={{ margin: '0 10px' }}>|</span>
        <kbd>E</kbd> interactuar
      </div>

      {/* UI de interacción en la parte inferior */}
      {zoneData && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
        }}>
          {!isInteracting ? (
            // Prompt pequeño
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#333',
              padding: '12px 24px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              fontFamily: 'system-ui, sans-serif',
            }}>
              <span style={{ fontSize: '24px' }}>{zoneData.emoji}</span>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{zoneData.title}</span>
              <div style={{
                background: '#ffd700',
                color: '#000',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <kbd style={{
                  background: '#fff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>E</kbd>
                Saber más
              </div>
            </div>
          ) : (
            // Panel expandido
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              color: '#333',
              padding: '24px 32px',
              borderRadius: '20px',
              maxWidth: '500px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{zoneData.emoji}</div>
              <h2 style={{
                margin: '0 0 12px 0',
                fontSize: '22px',
                fontWeight: '700',
                color: '#222',
              }}>
                {zoneData.title}
              </h2>
              <p style={{
                margin: '0 0 20px 0',
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#555',
              }}>
                {zoneData.description}
              </p>
              <button
                onClick={() => setIsInteracting(false)}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '25px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                ¡Entendido! ✨
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default App
