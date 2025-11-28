import { forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useKeyboard } from '../hooks/useKeyboard'
import type { RapierRigidBody } from '@react-three/rapier'

const MOVE_SPEED = 5
const JUMP_FORCE = 5

export const Player = forwardRef<RapierRigidBody>((_props, ref) => {
  const keys = useKeyboard()

  useFrame(() => {
    if (!ref || typeof ref === 'function' || !ref.current) return

    const impulse = { x: 0, y: 0, z: 0 }
    const linvel = ref.current.linvel()

    // Movement
    if (keys.forward) impulse.z -= MOVE_SPEED
    if (keys.backward) impulse.z += MOVE_SPEED
    if (keys.left) impulse.x -= MOVE_SPEED
    if (keys.right) impulse.x += MOVE_SPEED

    // Apply movement impulse
    ref.current.setLinvel(
      {
        x: impulse.x,
        y: linvel.y,
        z: impulse.z,
      },
      true
    )

    // Jump (only if close to ground)
    if (keys.jump && Math.abs(linvel.y) < 0.1) {
      ref.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true)
    }
  })

  return (
    <RigidBody
      ref={ref}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 5, 0]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.5, 0.5]} />
      <group>
        {/* Body */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.5, 1, 8, 16]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        {/* Head indicator */}
        <mesh castShadow position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffd93d" />
        </mesh>
      </group>
    </RigidBody>
  )
})

Player.displayName = 'Player'
