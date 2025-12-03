import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraControllerProps {
  target: React.RefObject<any>
  cinematicMode?: boolean
  onCinematicEnd?: () => void
}

// Vista más cenital/isométrica (más altura, menos distancia)
const CAMERA_OFFSET = new THREE.Vector3(10, 18, 30)
const CAMERA_LOOK_OFFSET = new THREE.Vector3(0, 0, 0)
const LERP_FACTOR = 0.1

// Punto de interés para la cinemática orbital - solo el Samán
// center: punto central alrededor del cual orbitar
// radius: distancia de la cámara al centro
// height: altura de la cámara
// duration: duración de la órbita completa (más lento)
const CINEMATIC_ORBITS = [
  { name: "Samán", center: new THREE.Vector3(-25, 8, -5), radius: 25, height: 15, duration: 10 },
]

export function CameraController({ target, cinematicMode = false, onCinematicEnd }: CameraControllerProps) {
  const { camera } = useThree()
  const currentPosition = useRef(new THREE.Vector3(60, 40, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 5, 0))

  // Estado de la cinemática
  const [isCinematic, setIsCinematic] = useState(cinematicMode)
  const cinematicTime = useRef(0)
  const currentOrbit = useRef(0)
  const orbitAngle = useRef(0)

  // Inicializar cámara en posición cinemática
  useEffect(() => {
    if (cinematicMode) {
      const firstOrbit = CINEMATIC_ORBITS[0]
      const initialPos = new THREE.Vector3(
        firstOrbit.center.x + firstOrbit.radius,
        firstOrbit.height,
        firstOrbit.center.z
      )
      camera.position.copy(initialPos)
      currentPosition.current.copy(initialPos)
      currentLookAt.current.copy(firstOrbit.center)
      orbitAngle.current = 0
      setIsCinematic(true)
    }
  }, [cinematicMode, camera])

  // Permitir saltar cinemática con Space o Enter
  useEffect(() => {
    const handleSkip = (e: KeyboardEvent) => {
      if (isCinematic && (e.code === 'Space' || e.code === 'Enter')) {
        setIsCinematic(false)
        onCinematicEnd?.()
      }
    }
    window.addEventListener('keydown', handleSkip)
    return () => window.removeEventListener('keydown', handleSkip)
  }, [isCinematic, onCinematicEnd])

  useFrame((_, delta) => {
    if (isCinematic) {
      // Modo cinemática orbital
      cinematicTime.current += delta

      const orbit = CINEMATIC_ORBITS[currentOrbit.current]
      const totalDuration = orbit.duration

      // Calcular ángulo de órbita (una vuelta completa = 2π radianes)
      // Velocidad: cuánto del círculo recorrer por segundo
      const orbitSpeed = (Math.PI * 2) / totalDuration
      orbitAngle.current += delta * orbitSpeed

      // Calcular posición orbital
      const targetX = orbit.center.x + Math.cos(orbitAngle.current) * orbit.radius
      const targetZ = orbit.center.z + Math.sin(orbitAngle.current) * orbit.radius
      const targetY = orbit.height

      const targetPosition = new THREE.Vector3(targetX, targetY, targetZ)

      // Interpolar suavemente hacia la posición orbital
      currentPosition.current.lerp(targetPosition, 0.08)
      currentLookAt.current.lerp(orbit.center, 0.08)

      camera.position.copy(currentPosition.current)
      camera.lookAt(currentLookAt.current)

      // Pasar al siguiente punto de órbita después de completar una vuelta
      if (cinematicTime.current >= totalDuration) {
        cinematicTime.current = 0
        orbitAngle.current = 0
        currentOrbit.current++

        if (currentOrbit.current >= CINEMATIC_ORBITS.length) {
          // Terminar cinemática
          setIsCinematic(false)
          onCinematicEnd?.()
        }
      }
    } else {
      // Modo normal - seguir al jugador
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
    }
  })

  // Mostrar indicador de saltar cinemática
  if (isCinematic) {
    return null
  }

  return null
}
