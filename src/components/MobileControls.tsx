import { useEffect, useRef, useState } from 'react'

interface MobileControlsProps {
  onMove: (direction: { forward: boolean; backward: boolean; left: boolean; right: boolean; sprint: boolean }) => void
  onInteract: () => void
  visible: boolean
  isLandscape?: boolean
}

export function MobileControls({ onMove, onInteract, visible, isLandscape = false }: MobileControlsProps) {
  const [activeButtons, setActiveButtons] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Enviar estado de movimiento continuamente
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      onMove(activeButtons)
    }, 16) // ~60fps

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeButtons, onMove])

  const handleButtonDown = (button: keyof typeof activeButtons) => {
    setActiveButtons(prev => ({ ...prev, [button]: true }))
  }

  const handleButtonUp = (button: keyof typeof activeButtons) => {
    setActiveButtons(prev => ({ ...prev, [button]: false }))
  }

  if (!visible) return null

  // Tamaños adaptativos para landscape
  const btnSize = isLandscape ? 45 : 60
  const actionBtnSize = isLandscape ? 50 : 70
  const fontSize = isLandscape ? 18 : 24
  const actionFontSize = isLandscape ? 11 : 14

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    width: `${btnSize}px`,
    height: `${btnSize}px`,
    borderRadius: '50%',
    border: isLandscape ? '2px solid rgba(255, 255, 255, 0.5)' : '3px solid rgba(255, 255, 255, 0.5)',
    background: isActive
      ? 'linear-gradient(135deg, #F68629 0%, #FF8200 100%)'
      : 'rgba(0, 48, 135, 0.7)',
    color: 'white',
    fontSize: `${fontSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    boxShadow: isActive
      ? '0 0 20px rgba(246, 134, 41, 0.6)'
      : '0 4px 15px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.1s, box-shadow 0.1s',
    transform: isActive ? 'scale(0.95)' : 'scale(1)',
  })

  const actionButtonStyle = (isActive: boolean, color: string): React.CSSProperties => ({
    width: `${actionBtnSize}px`,
    height: `${actionBtnSize}px`,
    borderRadius: '50%',
    border: isLandscape ? '2px solid rgba(255, 255, 255, 0.5)' : '3px solid rgba(255, 255, 255, 0.5)',
    background: isActive
      ? 'linear-gradient(135deg, #F68629 0%, #FF8200 100%)'
      : color,
    color: 'white',
    fontSize: `${actionFontSize}px`,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    boxShadow: isActive
      ? '0 0 20px rgba(246, 134, 41, 0.6)'
      : '0 4px 15px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.1s',
    transform: isActive ? 'scale(0.95)' : 'scale(1)',
  })

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: isLandscape ? '10px' : '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      pointerEvents: 'none',
      zIndex: 2000,
    }}>
      {/* D-Pad izquierdo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${btnSize}px)`,
        gridTemplateRows: `repeat(3, ${btnSize}px)`,
        gap: isLandscape ? '3px' : '5px',
        pointerEvents: 'auto',
      }}>
        {/* Fila superior */}
        <div></div>
        <button
          style={buttonStyle(activeButtons.forward)}
          onTouchStart={(e) => { e.preventDefault(); handleButtonDown('forward') }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('forward') }}
          onMouseDown={() => handleButtonDown('forward')}
          onMouseUp={() => handleButtonUp('forward')}
          onMouseLeave={() => handleButtonUp('forward')}
        >
          ▲
        </button>
        <div></div>

        {/* Fila media */}
        <button
          style={buttonStyle(activeButtons.left)}
          onTouchStart={(e) => { e.preventDefault(); handleButtonDown('left') }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('left') }}
          onMouseDown={() => handleButtonDown('left')}
          onMouseUp={() => handleButtonUp('left')}
          onMouseLeave={() => handleButtonUp('left')}
        >
          ◀
        </button>
        <div></div>
        <button
          style={buttonStyle(activeButtons.right)}
          onTouchStart={(e) => { e.preventDefault(); handleButtonDown('right') }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('right') }}
          onMouseDown={() => handleButtonDown('right')}
          onMouseUp={() => handleButtonUp('right')}
          onMouseLeave={() => handleButtonUp('right')}
        >
          ▶
        </button>

        {/* Fila inferior */}
        <div></div>
        <button
          style={buttonStyle(activeButtons.backward)}
          onTouchStart={(e) => { e.preventDefault(); handleButtonDown('backward') }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('backward') }}
          onMouseDown={() => handleButtonDown('backward')}
          onMouseUp={() => handleButtonUp('backward')}
          onMouseLeave={() => handleButtonUp('backward')}
        >
          ▼
        </button>
        <div></div>
      </div>

      {/* Botones de acción (derecha) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isLandscape ? '8px' : '15px',
        pointerEvents: 'auto',
      }}>
        <button
          style={actionButtonStyle(false, 'rgba(0, 170, 0, 0.7)')}
          onTouchStart={(e) => { e.preventDefault(); onInteract() }}
          onClick={onInteract}
        >
          E
        </button>
        <button
          style={actionButtonStyle(activeButtons.sprint, 'rgba(200, 0, 0, 0.7)')}
          onTouchStart={(e) => { e.preventDefault(); handleButtonDown('sprint') }}
          onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('sprint') }}
          onMouseDown={() => handleButtonDown('sprint')}
          onMouseUp={() => handleButtonUp('sprint')}
          onMouseLeave={() => handleButtonUp('sprint')}
        >
          RUN
        </button>
      </div>
    </div>
  )
}
