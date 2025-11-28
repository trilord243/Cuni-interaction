import { useRef } from 'react'
import { Physics } from '@react-three/rapier'
import { Sky, Environment } from '@react-three/drei'
import { Ground } from './Ground'
import { Player } from './Player'
import { CameraController } from './CameraController'
import { InteractiveZone } from './InteractiveZone'
import type { RapierRigidBody } from '@react-three/rapier'

interface SceneProps {
  onZoneEnter: (zoneName: string, zoneData: any) => void
  onZoneExit: () => void
}

export function Scene({ onZoneEnter, onZoneExit }: SceneProps) {
  const playerRef = useRef<RapierRigidBody>(null)

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
        <Player ref={playerRef} />

        {/* Example obstacle - can be removed */}
        <mesh castShadow receiveShadow position={[5, 1, -5]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#4fc3f7" />
        </mesh>

        {/* Interactive Zones - Ejemplos */}
        <InteractiveZone
          position={[10, 1.5, 0]}
          size={[6, 3, 6]}
          name="Edificio Principal"
          onEnter={() =>
            onZoneEnter('Edificio Principal', {
              title: 'Edificio Principal',
              message:
                'Bienvenido al Edificio Principal del Campus Unimet. Aquí se encuentran las oficinas administrativas y salones de clase.',
            })
          }
          onExit={onZoneExit}
          showDebug={true}
        />

        <InteractiveZone
          position={[-10, 1.5, -10]}
          size={[5, 3, 5]}
          name="Biblioteca"
          onEnter={() =>
            onZoneEnter('Biblioteca', {
              title: 'Biblioteca Central',
              message:
                'La Biblioteca Central cuenta con más de 50,000 volúmenes y espacios de estudio para todos los estudiantes.',
            })
          }
          onExit={onZoneExit}
          showDebug={true}
        />
      </Physics>

      {/* Camera controller */}
      <CameraController target={playerRef} />
    </>
  )
}
