import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useEffect } from 'react'

interface BuildingProps {
  modelPath: string
  position?: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
  colliderSize?: [number, number, number]
}

export function Building({
  modelPath,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  colliderSize = [5, 5, 5]
}: BuildingProps) {
  const gltf = useGLTF(modelPath)

  // Enable shadows on all meshes
  useEffect(() => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [gltf.scene])

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={colliderSize} position={[0, colliderSize[1] / 2 + 0.5, 0]} />
      <primitive
        object={gltf.scene}
        scale={scale}
        rotation={rotation}
        position={[0, 0.5, 0]}
      />
    </RigidBody>
  )
}

// Preload the model
useGLTF.preload('/EMG.glb')
