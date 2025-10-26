import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import CommandBar from './CommandBar'

interface CommandBarPortalProps {
  onClose: () => void
  portalTarget: HTMLElement
}

const CommandBarPortal = ({ onClose, portalTarget }: CommandBarPortalProps) => {
  const commandBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      // Check if a click was outside of the command bar area
      const path = e.composedPath()
      if (commandBarRef.current && !path.includes(commandBarRef.current)) {
        onClose()
      }
    }

    // Add event listeners when the portal mounts
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    // Remove listeners when the portal unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Use a react portal to render the command bar into a div that lives in the Shadow DOM
  return ReactDOM.createPortal(
    <div className="helm-overlay">
      <CommandBar ref={commandBarRef} />
    </div>,
    portalTarget,
  )
}

export default CommandBarPortal
