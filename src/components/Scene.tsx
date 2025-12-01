import { useRef, useState, useCallback, useEffect } from 'react'
import { Physics } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Sky, Environment } from '@react-three/drei'
import { Ground } from './Ground'
import { Player } from './Player'
import { CameraController } from './CameraController'
import { InvisibleWalls } from './InvisibleWalls'
import { InteractiveZone } from './InteractiveZone'
import { useGuidedTour } from './GuidedTour'
import type { Waypoint } from './GuidedTour'
import { Building } from './Building'

interface SceneProps {
  onZoneEnter: (zoneName: string, zoneData: any) => void
  onZoneExit: () => void
  autoMode?: boolean
  onRegisterAdvance?: (advanceCallback: () => void) => void
  onTourComplete?: () => void
  freeMode?: boolean
}

// Define waypoints for the guided tour (linear layout for easy repositioning)
const TOUR_WAYPOINTS: Waypoint[] = [
  {
    position: [-20, 1, 8],
    name: 'Edificio EMG',
    description: 'Edificio de Ingeniería EMG - Laboratorios de computación, robótica y ciencias aplicadas',
  },
  {
    position: [0, 1, 8],
    name: 'Biblioteca',
    description: 'Biblioteca Central - Más de 50,000 volúmenes y espacios modernos de estudio',
  },
  {
    position: [20, 1, 8],
    name: 'Capilla',
    description: 'Capilla Unimet - Espacio de reflexión y eventos espirituales de la universidad',
  },
  {
    position: [40, 1, 25],
    name: 'Centro Deportivo',
    description: 'Centro Deportivo - Canchas, gimnasio y áreas recreativas para toda la comunidad',
  },
  {
    position: [-35, 1, 20],
    name: 'Cafetería Principal',
    description: 'Cafetería Principal - Servicios de alimentación y áreas de descanso',
  },
  {
    position: [5, 1, 10],
    name: 'Edificio Administrativo',
    description: 'Edificio Administrativo - Oficinas de rectoría, admisiones y servicios estudiantiles',
  },
  {
    position: [0, 1, 0],
    name: 'Fin del Tour',
    description: 'Gracias por visitar el Campus Unimet. Esperamos que hayas disfrutado el recorrido.',
  },
]

export function Scene({ onZoneEnter, onZoneExit, autoMode = false, onRegisterAdvance, onTourComplete, freeMode = false }: SceneProps) {
  const playerRef = useRef<RapierRigidBody>(null)
  const [currentTarget, setCurrentTarget] = useState<[number, number, number] | null>(null)
  const lastInputTime = useRef(0)
  const lastPopupWaypoint = useRef<number>(-1) // Track which waypoint popup was shown for
  const INPUT_COOLDOWN = 500 // ms

  const tour = useGuidedTour({
    waypoints: TOUR_WAYPOINTS,
    onWaypointChange: (index, waypoint) => {
      setCurrentTarget(waypoint.position)
    },
  })

  const handleNavigationInput = useCallback(
    (direction: 'forward' | 'backward') => {
      if (autoMode) return // Ignore manual input in auto mode

      const now = Date.now()
      if (now - lastInputTime.current < INPUT_COOLDOWN) return

      lastInputTime.current = now

      if (direction === 'forward') {
        tour.goToNext()
      } else {
        tour.goToPrevious()
      }
    },
    [tour, autoMode]
  )

  const handleTargetReached = useCallback(() => {
    tour.stopMoving()

    // Show popup when waypoint is reached (only once per waypoint)
    if (lastPopupWaypoint.current !== tour.currentIndex) {
      const currentWaypoint = TOUR_WAYPOINTS[tour.currentIndex]
      if (currentWaypoint) {
        lastPopupWaypoint.current = tour.currentIndex
        onZoneEnter(currentWaypoint.name, {
          title: currentWaypoint.name,
          message: currentWaypoint.description,
        })

        // Check if this is the last waypoint
        if (tour.currentIndex === TOUR_WAYPOINTS.length - 1) {
          onTourComplete?.()
        }
      }
    }
  }, [tour, onZoneEnter, onTourComplete])

  // Initialize first waypoint - just set the target, don't show popup yet
  useEffect(() => {
    setCurrentTarget(TOUR_WAYPOINTS[0].position)
  }, [])

  // Create a stable advance function
  const advanceToNext = useCallback(() => {
    if (tour.canGoNext && !tour.isMoving) {
      tour.goToNext()
    }
  }, [tour])

  // Register advance function with parent (only once)
  useEffect(() => {
    if (onRegisterAdvance) {
      onRegisterAdvance(advanceToNext)
    }
  }, [onRegisterAdvance, advanceToNext])

  return (
    <>
      {/* Sky background */}
      <Sky
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0.6}
        azimuth={0.25}
      />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[50, 50, 25]}
        intensity={1.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Environment for reflections */}
      <Environment preset="sunset" />

      {/* Physics world */}
      <Physics gravity={[0, -9.81, 0]}>
        <Ground />
        <Player
          ref={playerRef}
          targetPosition={currentTarget}
          onTargetReached={handleTargetReached}
          onNavigationInput={handleNavigationInput}
          freeMode={freeMode}
        />

        {/* Buildings - Linear layout (left to right) */}
        {/* EMG - Left */}
        <Building
          modelPath="/EMG.glb"
          position={[-20, 0, 0]}
          scale={0.25}
          colliderSize={[5, 4, 5]}
        />

        {/* Biblioteca - Center */}
        <Building
          modelPath="/Biblioteca.glb"
          position={[0, 0, 0]}
          scale={0.28}
          colliderSize={[5, 4, 5]}
        />

        {/* Capilla - Right */}
        <Building
          modelPath="/Capilla.glb"
          position={[20, 0, 0]}
          scale={0.32}
          colliderSize={[3.5, 4, 3.5]}
        />

        {/* Barreras invisibles para evitar caídas */}
        <InvisibleWalls size={50} height={10} />

        {/* Waypoint markers */}
        {TOUR_WAYPOINTS.map((waypoint, index) => (
          <mesh
            key={index}
            castShadow
            receiveShadow
            position={[waypoint.position[0], waypoint.position[1] + 1, waypoint.position[2]]}
          >
            <boxGeometry args={[2, 3, 2]} />
            <meshStandardMaterial
              color={
                index === 0 || index === TOUR_WAYPOINTS.length - 1
                  ? '#4caf50' // Verde para inicio/fin
                  : ['#ff6b6b', '#4fc3f7', '#ffd93d', '#9c27b0', '#ff9800', '#f06292'][
                      index % 6
                    ]
              }
            />
          </mesh>
        ))}

        {/* Interactive zones for free mode - only active in free mode */}
        {freeMode && TOUR_WAYPOINTS.map((waypoint, index) => (
          <InteractiveZone
            key={`zone-${index}`}
            position={[waypoint.position[0], waypoint.position[1] + 1.5, waypoint.position[2]]}
            size={[8, 4, 8]}
            name={waypoint.name}
            onEnter={() => {
              onZoneEnter(waypoint.name, {
                title: waypoint.name,
                message: waypoint.description,
              })
            }}
            onExit={onZoneExit}
            showDebug={false}
          />
        ))}
      </Physics>

      {/* Camera controller */}
      <CameraController target={playerRef} />
    </>
  )
}
