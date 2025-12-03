import { forwardRef, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useKeyboard } from '../hooks/useKeyboard'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

const MOVE_SPEED = 5
const SPRINT_SPEED = 12

export const Player = forwardRef<RapierRigidBody, object>(
  (_props, ref) => {
    const keys = useKeyboard()
    const walkGltf = useGLTF('/CuniAnimacion.glb')
    const idleGltf = useGLTF('/IdleCuni.glb')
    const groupRef = useRef<THREE.Group>(null)
    const { actions: walkActions } = useAnimations(walkGltf.animations, groupRef)
    const { actions: idleActions } = useAnimations(idleGltf.animations, groupRef)
    const wasMoving = useRef(false)

    // Start with idle animation
    useEffect(() => {
      const idleAction = Object.values(idleActions)[0]
      if (idleAction) {
        idleAction.play()
      }
    }, [idleActions])

    useFrame(() => {
      if (!ref || typeof ref === 'function' || !ref.current) return

      const linvel = ref.current.linvel()
      const moveSpeed = new THREE.Vector2(linvel.x, linvel.z).length()
      const isMoving = moveSpeed > 0.1

      // Switch animations based on movement
      if (isMoving && !wasMoving.current) {
        // Started moving - switch to walk
        Object.values(idleActions).forEach(action => action?.stop())
        const walkAction = walkActions['Walk'] || walkActions['walk'] || walkActions['WalkCycle'] || walkActions['Armature|Walk'] || Object.values(walkActions)[0]
        if (walkAction) {
          walkAction.play()
        }
        wasMoving.current = true
      } else if (!isMoving && wasMoving.current) {
        // Stopped moving - switch to idle
        Object.values(walkActions).forEach(action => action?.stop())
        const idleAction = Object.values(idleActions)[0]
        if (idleAction) {
          idleAction.play()
        }
        wasMoving.current = false
      }

      // Keyboard control
      const currentSpeed = keys.sprint ? SPRINT_SPEED : MOVE_SPEED
      const impulse = { x: 0, y: 0, z: 0 }

      if (keys.forward) impulse.z -= currentSpeed
      if (keys.backward) impulse.z += currentSpeed
      if (keys.left) impulse.x -= currentSpeed
      if (keys.right) impulse.x += currentSpeed

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
      <CapsuleCollider args={[0.75, 0.75]} />
      <group ref={groupRef} scale={1.2}>
        <primitive object={idleGltf.scene} />
      </group>
    </RigidBody>
  )
})

Player.displayName = 'Player'

// Preload models for better performance
useGLTF.preload('/CuniAnimacion.glb')
useGLTF.preload('/IdleCuni.glb')
