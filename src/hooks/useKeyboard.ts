import { useEffect, useState } from 'react'

export interface KeyboardControls {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
}

export function useKeyboard(): KeyboardControls {
  const [keys, setKeys] = useState<KeyboardControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setKeys((prev) => ({ ...prev, forward: true }))
          break
        case 'ArrowDown':
        case 'KeyS':
          setKeys((prev) => ({ ...prev, backward: true }))
          break
        case 'ArrowLeft':
        case 'KeyA':
          setKeys((prev) => ({ ...prev, left: true }))
          break
        case 'ArrowRight':
        case 'KeyD':
          setKeys((prev) => ({ ...prev, right: true }))
          break
        case 'Space':
          setKeys((prev) => ({ ...prev, jump: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setKeys((prev) => ({ ...prev, forward: false }))
          break
        case 'ArrowDown':
        case 'KeyS':
          setKeys((prev) => ({ ...prev, backward: false }))
          break
        case 'ArrowLeft':
        case 'KeyA':
          setKeys((prev) => ({ ...prev, left: false }))
          break
        case 'ArrowRight':
        case 'KeyD':
          setKeys((prev) => ({ ...prev, right: false }))
          break
        case 'Space':
          setKeys((prev) => ({ ...prev, jump: false }))
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keys
}
