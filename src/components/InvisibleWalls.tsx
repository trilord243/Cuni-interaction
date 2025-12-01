import { RigidBody } from '@react-three/rapier'

interface InvisibleWallsProps {
  size?: number
  height?: number
}

export function InvisibleWalls({ size = 50, height = 10 }: InvisibleWallsProps) {
  const wallThickness = 1

  return (
    <group>
      {/* Pared Norte */}
      <RigidBody type="fixed" position={[0, height / 2, -size]}>
        <mesh>
          <boxGeometry args={[size * 2, height, wallThickness]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Pared Sur */}
      <RigidBody type="fixed" position={[0, height / 2, size]}>
        <mesh>
          <boxGeometry args={[size * 2, height, wallThickness]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Pared Este */}
      <RigidBody type="fixed" position={[size, height / 2, 0]}>
        <mesh>
          <boxGeometry args={[wallThickness, height, size * 2]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Pared Oeste */}
      <RigidBody type="fixed" position={[-size, height / 2, 0]}>
        <mesh>
          <boxGeometry args={[wallThickness, height, size * 2]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>
    </group>
  )
}
