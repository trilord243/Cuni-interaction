import { RigidBody } from '@react-three/rapier'
import { useState } from 'react'

interface InteractiveZoneProps {
  position: [number, number, number]
  size?: [number, number, number]
  onEnter: () => void
  onExit: () => void
  name?: string
  showDebug?: boolean
}

export function InteractiveZone({
  position,
  size = [5, 3, 5],
  onEnter,
  onExit,
  name: _name = 'Interactive Zone',
  showDebug = true,
}: InteractiveZoneProps) {
  const [isActive, setIsActive] = useState(false)

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      onIntersectionEnter={() => {
        setIsActive(true)
        onEnter()
      }}
      onIntersectionExit={() => {
        setIsActive(false)
        onExit()
      }}
    >
      {/* Zona invisible con visualización opcional para debug */}
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={isActive ? '#4caf50' : '#2196f3'}
          transparent
          opacity={showDebug ? 0.3 : 0}
          wireframe={showDebug}
        />
      </mesh>

      {/* Texto flotante para debug */}
      {showDebug && (
        <mesh position={[0, size[1] / 2 + 0.5, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </RigidBody>
  )
}
