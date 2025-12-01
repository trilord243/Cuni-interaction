import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraControllerProps {
  target: React.RefObject<any>
}

// Vista más cenital/isométrica (más altura, menos distancia)
const CAMERA_OFFSET = new THREE.Vector3(10, 18, 30)
const CAMERA_LOOK_OFFSET = new THREE.Vector3(0, 0, 0)
const LERP_FACTOR = 0.1

export function CameraController({ target }: CameraControllerProps) {
  const { camera } = useThree()
  const currentPosition = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!target.current) return

    const targetPosition = target.current.translation()
    if (!targetPosition) return

    // Calculate desired camera position
    const desiredPosition = new THREE.Vector3(
      targetPosition.x + CAMERA_OFFSET.x,
      targetPosition.y + CAMERA_OFFSET.y,
      targetPosition.z + CAMERA_OFFSET.z
    )

    // Smooth camera movement (lerp)
    currentPosition.current.lerp(desiredPosition, LERP_FACTOR)
    camera.position.copy(currentPosition.current)

    // Calculate look at point
    const lookAtPoint = new THREE.Vector3(
      targetPosition.x + CAMERA_LOOK_OFFSET.x,
      targetPosition.y + CAMERA_LOOK_OFFSET.y,
      targetPosition.z + CAMERA_LOOK_OFFSET.z
    )

    // Smooth look at (lerp)
    currentLookAt.current.lerp(lookAtPoint, LERP_FACTOR)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
