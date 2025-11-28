interface PopupProps {
  title: string
  message: string
  onClose?: () => void
  showCloseButton?: boolean
}

export function Popup({
  title,
  message,
  onClose,
  showCloseButton = true,
}: PopupProps) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{title}</h2>
        <p>{message}</p>
        {showCloseButton && onClose && (
          <button onClick={onClose} className="popup-close">
            Cerrar
          </button>
        )}
      </div>
    </div>
  )
}
