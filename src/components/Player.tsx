import { forwardRef, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useKeyboard } from '../hooks/useKeyboard'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

const GUIDED_MOVE_SPEED = 8
const FREE_MOVE_SPEED = 5

export interface PlayerHandle extends RapierRigidBody {}

interface PlayerProps {
  targetPosition?: [number, number, number] | null
  onTargetReached?: () => void
  onNavigationInput?: (direction: 'forward' | 'backward') => void
  freeMode?: boolean
}

export const Player = forwardRef<RapierRigidBody, PlayerProps>(
  ({ targetPosition, onTargetReached, onNavigationInput, freeMode = false }, ref) => {
    const keys = useKeyboard()
    const gltf = useGLTF('/CuniAnimacion.glb')
    const groupRef = useRef<THREE.Group>(null)
    const { actions } = useAnimations(gltf.animations, groupRef)

    // Log available animations (for debugging)
    useEffect(() => {
      if (gltf.animations.length > 0) {
        console.log('Available animations:', gltf.animations.map(a => a.name))
      }
    }, [gltf.animations])

    // Listen for navigation input in guided mode
    useEffect(() => {
      if (freeMode || !onNavigationInput) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          onNavigationInput('forward')
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          onNavigationInput('backward')
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onNavigationInput, freeMode])

    useFrame(() => {
      if (!ref || typeof ref === 'function' || !ref.current) return

      const linvel = ref.current.linvel()
      const moveSpeed = new THREE.Vector2(linvel.x, linvel.z).length()
      const isMoving = moveSpeed > 0.1

      // Play walk animation if moving
      if (isMoving) {
        // Try common animation names
        const walkAction = actions['Walk'] || actions['walk'] || actions['WalkCycle'] || actions['Armature|Walk']
        if (walkAction && !walkAction.isRunning()) {
          walkAction.play()
        }
      } else {
        // Stop all animations when not moving
        Object.values(actions).forEach(action => action?.stop())
      }

      if (freeMode) {
        // Free mode: keyboard control
        const impulse = { x: 0, y: 0, z: 0 }

        if (keys.forward) impulse.z -= FREE_MOVE_SPEED
        if (keys.backward) impulse.z += FREE_MOVE_SPEED
        if (keys.left) impulse.x -= FREE_MOVE_SPEED
        if (keys.right) impulse.x += FREE_MOVE_SPEED

        ref.current.setLinvel(
          {
            x: impulse.x,
            y: linvel.y,
            z: impulse.z,
          },
          true
        )

        // Rotate towards movement direction
        if (groupRef.current && (impulse.x !== 0 || impulse.z !== 0)) {
          const angle = Math.atan2(impulse.x, impulse.z)
          groupRef.current.rotation.y = angle
        }
      } else if (targetPosition) {
        // Guided mode: move towards target waypoint
        const currentPos = ref.current.translation()
        const target = new THREE.Vector3(...targetPosition)
        const current = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z)

        const direction = new THREE.Vector3().subVectors(target, current)
        const distance = new THREE.Vector2(direction.x, direction.z).length()

        if (distance < 0.5) {
          // Reached target
          ref.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true)
          onTargetReached?.()
        } else {
          // Move towards target
          direction.y = 0 // Keep movement horizontal
          direction.normalize()

          ref.current.setLinvel(
            {
              x: direction.x * GUIDED_MOVE_SPEED,
              y: linvel.y,
              z: direction.z * GUIDED_MOVE_SPEED,
            },
            true
          )

          // Rotate towards movement direction
          if (groupRef.current) {
            const angle = Math.atan2(direction.x, direction.z)
            groupRef.current.rotation.y = angle
          }
        }
      }
    })

  return (
    <RigidBody
      ref={ref}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 5, 15]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.5, 0.5]} />
      <group ref={groupRef} scale={0.6}>
        <primitive object={gltf.scene} />
      </group>
    </RigidBody>
  )
})

Player.displayName = 'Player'

// Preload the model for better performance
useGLTF.preload('/CuniAnimacion.glb')
