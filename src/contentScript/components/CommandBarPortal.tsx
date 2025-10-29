import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import CommandBar from './CommandBar'
import { helmGlobalStyles } from './GlobalStyles'
import { ScopedCssBaseline } from '@mui/material'

// MUI recommends hoisting global styles to a static constant to optimize performance
const globalStyles = helmGlobalStyles()

interface CommandBarPortalProps {
  onClose: () => void
  portalTarget: HTMLElement
}

const CommandBarPortal = ({ onClose, portalTarget }: CommandBarPortalProps) => {
  const commandBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('Helm Content Script: CommandBarPortal mounted.')
    // Handle escape key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('Helm Content Script: Closing portal on Escape key.')
        onClose()
      }
    }

    // Handle click outside of the command bar area
    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath()
      if (commandBarRef.current && !path.includes(commandBarRef.current)) {
        console.log('Helm Content Script: Closing portal on click outside.')
        onClose()
      }
    }

    // Add event listeners when the portal mounts
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    // Remove listeners when the portal unmounts
    return () => {
      console.log('Helm Content Script: CommandBarPortal unmounted.')
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Use a react portal to render the command bar into a div that lives in the Shadow DOM
  return ReactDOM.createPortal(
    <>
      {/* CSS reset */}
      <ScopedCssBaseline>
        {/* Our custom global styles run after the reset */}
        {globalStyles}
        <div className="helm-overlay">
          <CommandBar ref={commandBarRef} />
        </div>
      </ScopedCssBaseline>
    </>,
    portalTarget,
  )
}

export default CommandBarPortal
