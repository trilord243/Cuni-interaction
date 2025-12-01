import { useState } from 'react'
import * as THREE from 'three'

export interface Waypoint {
  position: [number, number, number]
  name: string
  description?: string
  cameraOffset?: [number, number, number]
}

interface GuidedTourProps {
  waypoints: Waypoint[]
  onWaypointChange?: (index: number, waypoint: Waypoint) => void
}

export function useGuidedTour({ waypoints, onWaypointChange }: GuidedTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMoving, setIsMoving] = useState(false)

  const currentWaypoint = waypoints[currentIndex]

  const goToNext = () => {
    if (currentIndex < waypoints.length - 1 && !isMoving) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setIsMoving(true)
      onWaypointChange?.(nextIndex, waypoints[nextIndex])
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0 && !isMoving) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setIsMoving(true)
      onWaypointChange?.(prevIndex, waypoints[prevIndex])
    }
  }

  const goToWaypoint = (index: number) => {
    if (index >= 0 && index < waypoints.length && index !== currentIndex && !isMoving) {
      setCurrentIndex(index)
      setIsMoving(true)
      onWaypointChange?.(index, waypoints[index])
    }
  }

  const stopMoving = () => {
    setIsMoving(false)
  }

  return {
    currentIndex,
    currentWaypoint,
    isMoving,
    canGoNext: currentIndex < waypoints.length - 1,
    canGoPrevious: currentIndex > 0,
    goToNext,
    goToPrevious,
    goToWaypoint,
    stopMoving,
    totalWaypoints: waypoints.length,
  }
}

// Helper function to calculate smooth movement
export function smoothMoveTowards(
  current: THREE.Vector3,
  target: THREE.Vector3,
  maxSpeed: number,
  deltaTime: number
): { position: THREE.Vector3; arrived: boolean } {
  const direction = new THREE.Vector3().subVectors(target, current)
  const distance = direction.length()

  if (distance < 0.1) {
    return { position: target.clone(), arrived: true }
  }

  const moveDistance = Math.min(maxSpeed * deltaTime, distance)
  direction.normalize()
  const newPosition = current.clone().add(direction.multiplyScalar(moveDistance))

  return { position: newPosition, arrived: false }
}
