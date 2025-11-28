/**
 * EJEMPLO DE CÓMO CARGAR MODELOS GLTF/GLB
 *
 * Cuando tengas los modelos 3D de los edificios del campus:
 *
 * 1. Coloca los archivos .gltf o .glb en la carpeta /public/models/
 * 2. Crea un componente como este para cada edificio
 * 3. Importa el componente en Scene.tsx
 * 4. Agrega colisiones con RigidBody si quieres que el personaje colisione con el edificio
 */

import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

interface BuildingProps {
  position?: [number, number, number]
  scale?: number
}

export function BuildingExample({ position = [0, 0, 0], scale = 1 }: BuildingProps) {
  // Carga el modelo GLTF
  // Cambia '/models/building.glb' por la ruta real de tu modelo
  const { scene } = useGLTF('/models/building.glb')

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive
        object={scene}
        position={position}
        scale={scale}
        castShadow
        receiveShadow
      />
    </RigidBody>
  )
}

// Pre-carga el modelo para mejor performance
// useGLTF.preload('/models/building.glb')

/**
 * EJEMPLO DE USO EN Scene.tsx:
 *
 * import { BuildingExample } from './Building.example'
 *
 * // Dentro del componente Physics:
 * <BuildingExample position={[10, 0, -10]} scale={1.5} />
 * <BuildingExample position={[-15, 0, 5]} scale={1} />
 */
