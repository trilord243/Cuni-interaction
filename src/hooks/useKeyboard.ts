import { useEffect, useState } from 'react'

export interface KeyboardControls {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  sprint: boolean
}

// Store global para controles móviles
let mobileControls: KeyboardControls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
}

// Función para actualizar controles móviles desde fuera
export function setMobileControls(controls: Partial<KeyboardControls>) {
  mobileControls = { ...mobileControls, ...controls }
}

export function useKeyboard(): KeyboardControls {
  const [keys, setKeys] = useState<KeyboardControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  })

  // Combinar teclado y móvil
  const [combined, setCombined] = useState<KeyboardControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
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
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys((prev) => ({ ...prev, sprint: true }))
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
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys((prev) => ({ ...prev, sprint: false }))
          break
      }
    }

    // Reset todas las teclas cuando la ventana pierde el foco
    const handleBlur = () => {
      setKeys({
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        sprint: false,
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Actualizar controles combinados periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCombined({
        forward: keys.forward || mobileControls.forward,
        backward: keys.backward || mobileControls.backward,
        left: keys.left || mobileControls.left,
        right: keys.right || mobileControls.right,
        jump: keys.jump || mobileControls.jump,
        sprint: keys.sprint || mobileControls.sprint,
      })
    }, 16)

    return () => clearInterval(interval)
  }, [keys])

  return combined
}
