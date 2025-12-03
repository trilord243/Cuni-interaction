import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { Scene, ZONE_DATA } from './components/Scene'
import { IntroScene } from './components/IntroScene'
import Loader from './loader/Loader'
import { MobileControls } from './components/MobileControls'
import { setMobileControls } from './hooks/useKeyboard'

function LoadingScreen({ onStart }: { onStart: () => void }) {
  const { progress, active } = useProgress()
  const [isLoaded, setIsLoaded] = useState(false)
  const [show, setShow] = useState(true)
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768
    }
    return false
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768)
    }
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => setIsLoaded(true), 500)
      return () => clearTimeout(timer)
    }
  }, [active, progress])

  if (!show) return null

  // Mostrar pantalla 3D de inicio cuando termine de cargar
  if (isLoaded) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 9999,
        }}
      >
        {/* Canvas 3D de fondo */}
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
        >
          <Suspense fallback={null}>
            <IntroScene />
          </Suspense>
        </Canvas>

        {/* Overlay con título y botón */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
            padding: isMobileView ? "20px" : "0",
            boxSizing: "border-box",
          }}
        >
          <h1 style={{
            color: "white",
            fontSize: isMobileView ? "1.8rem" : "4rem",
            fontFamily: "system-ui, sans-serif",
            marginBottom: "10px",
            textShadow: "0 0 30px rgba(246, 134, 41, 0.5), 0 4px 20px rgba(0,0,0,0.5)",
            letterSpacing: isMobileView ? "1px" : "2px",
            textAlign: "center",
          }}>
            Campus UNIMET 3D
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: isMobileView ? "0.9rem" : "1.3rem",
            marginBottom: isMobileView ? "30px" : "50px",
            fontFamily: "system-ui, sans-serif",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            textAlign: "center",
            padding: "0 10px",
          }}>
            Explora el campus de la Universidad Metropolitana
          </p>
          <button
            onClick={() => {
              onStart()
              setShow(false)
            }}
            style={{
              background: "linear-gradient(135deg, #F68629 0%, #FF8200 100%)",
              color: "white",
              border: "3px solid rgba(255,255,255,0.3)",
              padding: isMobileView ? "16px 40px" : "20px 60px",
              borderRadius: "50px",
              fontSize: isMobileView ? "1rem" : "1.4rem",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 0 40px rgba(246, 134, 41, 0.6), 0 10px 40px rgba(0,0,0,0.3)",
              transition: "transform 0.3s, box-shadow 0.3s",
              fontFamily: "system-ui, sans-serif",
              pointerEvents: "auto",
              textTransform: "uppercase",
              letterSpacing: isMobileView ? "2px" : "3px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)"
              e.currentTarget.style.boxShadow = "0 0 60px rgba(246, 134, 41, 0.8), 0 15px 50px rgba(0,0,0,0.4)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "0 0 40px rgba(246, 134, 41, 0.6), 0 10px 40px rgba(0,0,0,0.3)"
            }}
          >
            {isMobileView ? "Iniciar" : "Iniciar Experiencia"}
          </button>
          {!isMobileView && (
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.9rem",
              marginTop: "30px",
              fontFamily: "system-ui, sans-serif",
            }}>
              Usa WASD para moverte | Shift para correr | E para interactuar
            </p>
          )}
          {isMobileView && (
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.8rem",
              marginTop: "20px",
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
            }}>
              Usa los controles táctiles para moverte
            </p>
          )}
        </div>
      </div>
    )
  }

  return <Loader message={`Cargando... ${progress.toFixed(0)}%`} />
}

function App() {
  const [currentZone, setCurrentZone] = useState<string | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isCinematic, setIsCinematic] = useState(true)
  const [showGame, setShowGame] = useState(false)
  // Inicializar isMobile basado en el tamaño actual de la ventana
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768
    }
    return false
  })
  const audioRef = useRef<HTMLAudioElement>(null)
  const coinSoundRef = useRef<HTMLAudioElement>(null)

  // Detectar si es móvil (solo pantallas pequeñas, no solo touch)
  useEffect(() => {
    const checkMobile = () => {
      // Solo considerar móvil si la pantalla es pequeña
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isSmallScreen)
    }
    // No llamar checkMobile() aquí porque ya inicializamos el estado correctamente
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Manejar controles móviles
  const handleMobileMove = useCallback((direction: { forward: boolean; backward: boolean; left: boolean; right: boolean; sprint: boolean }) => {
    setMobileControls(direction)
  }, [])

  const handleMobileInteract = useCallback(() => {
    if (currentZone && !isInteracting) {
      setIsInteracting(true)
      if (coinSoundRef.current) {
        coinSoundRef.current.currentTime = 0
        coinSoundRef.current.play()
      }
    }
  }, [currentZone, isInteracting])

  // Iniciar música al comenzar el juego
  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsMusicPlaying(true)
    }
    setShowGame(true)
    setIsCinematic(true)
  }

  // Cuando termina la cinemática
  const handleCinematicEnd = () => {
    setIsCinematic(false)
  }

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
          <Scene
            onZoneChange={setCurrentZone}
            cinematicMode={isCinematic && showGame}
            onCinematicEnd={handleCinematicEnd}
          />
        </Suspense>
      </Canvas>

      {/* Pantalla de carga */}
      <LoadingScreen onStart={startMusic} />

      {/* Mensaje para saltar cinemática */}
      {showGame && isCinematic && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '20px' : '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          animation: 'fadeInUp 0.5s ease-out',
        }}>
          {isMobile ? (
            // Botón táctil para saltar en móvil
            <button
              onClick={() => {
                setIsCinematic(false)
                handleCinematicEnd()
              }}
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '30px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 'bold',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
              }}
            >
              Toca para saltar
            </button>
          ) : (
            <div style={{
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '30px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backdropFilter: 'blur(10px)',
            }}>
              <span style={{ opacity: 0.8 }}>Presiona</span>
              <kbd style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontWeight: 'bold',
              }}>Space</kbd>
              <span style={{ opacity: 0.8 }}>o</span>
              <kbd style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontWeight: 'bold',
              }}>Enter</kbd>
              <span style={{ opacity: 0.8 }}>para saltar</span>
            </div>
          )}
        </div>
      )}

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
          top: isMobile ? '10px' : '20px',
          right: isMobile ? '10px' : '20px',
          width: isMobile ? '44px' : '50px',
          height: isMobile ? '44px' : '50px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '20px' : '24px',
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

      {/* Controles de teclado (solo desktop) */}
      {!isMobile && (
        <div className="instructions">
          <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> mover
          <span style={{ margin: '0 10px' }}>|</span>
          <kbd>Shift</kbd> correr
          <span style={{ margin: '0 10px' }}>|</span>
          <kbd>E</kbd> interactuar
        </div>
      )}

      {/* Controles móviles táctiles */}
      <MobileControls
        onMove={handleMobileMove}
        onInteract={handleMobileInteract}
        visible={isMobile && showGame && !isCinematic}
      />

      {/* Estilos de animación */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 10px 2px rgba(246, 134, 41, 0.6), 0 0 20px 5px rgba(246, 134, 41, 0.3);
          }
          50% {
            box-shadow: 0 0 25px 8px rgba(246, 134, 41, 0.8), 0 0 40px 15px rgba(246, 134, 41, 0.4);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>

      {/* UI de interacción en la parte inferior */}
      {zoneData && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '220px' : '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          animation: !isInteracting ? 'slideUp 0.4s ease-out' : 'scaleIn 0.3s ease-out',
          width: isMobile ? 'auto' : 'auto',
          maxWidth: isMobile ? '280px' : 'none',
        }}>
          {!isInteracting ? (
            // Prompt pequeño - en móvil solo emoji y nombre
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#003087',
              padding: isMobile ? '8px 14px' : '12px 24px',
              borderRadius: '25px',
              border: isMobile ? '2px solid #F68629' : '3px solid #F68629',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '6px' : '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              fontFamily: 'system-ui, sans-serif',
              animation: 'pulse 2s infinite',
            }}>
              <span style={{ fontSize: isMobile ? '16px' : '24px' }}>{zoneData.emoji}</span>
              <span style={{ fontWeight: '700', fontSize: isMobile ? '11px' : '15px', color: '#003087' }}>{zoneData.title}</span>
              {!isMobile && (
                <div style={{
                  background: 'linear-gradient(135deg, #F68629 0%, #FF8200 100%)',
                  color: '#fff',
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
                    color: '#003087',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>E</kbd>
                  Saber más
                </div>
              )}
            </div>
          ) : (
            // Panel expandido - mucho más pequeño en móvil
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              color: '#003087',
              padding: isMobile ? '12px 16px' : '24px 32px',
              borderRadius: isMobile ? '16px' : '20px',
              border: isMobile ? '2px solid #F68629' : '3px solid #F68629',
              maxWidth: isMobile ? '280px' : '500px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: isMobile ? '28px' : '48px', marginBottom: isMobile ? '6px' : '10px' }}>{zoneData.emoji}</div>
              <h2 style={{
                margin: isMobile ? '0 0 6px 0' : '0 0 10px 0',
                fontSize: isMobile ? '14px' : '22px',
                fontWeight: '700',
                color: '#003087',
              }}>
                {zoneData.title}
              </h2>
              <p style={{
                margin: isMobile ? '0 0 10px 0' : '0 0 16px 0',
                fontSize: isMobile ? '11px' : '15px',
                lineHeight: '1.4',
                color: '#1859A9',
              }}>
                {zoneData.description}
              </p>
              <button
                onClick={() => setIsInteracting(false)}
                style={{
                  background: 'linear-gradient(135deg, #F68629 0%, #FF8200 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: isMobile ? '8px 20px' : '12px 28px',
                  borderRadius: '25px',
                  fontSize: isMobile ? '12px' : '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(246, 134, 41, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(246, 134, 41, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(246, 134, 41, 0.4)'
                }}
              >
                ¡Entendido!
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default App
