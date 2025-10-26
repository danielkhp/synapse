import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { Message } from '../types'
import CommandBarPortal from './components/CommandBarPortal'

interface AppProps {
  portalTarget: HTMLElement
}

const App = ({ portalTarget }: AppProps) => {
  const [isVisible, setIsVisible] = useState(false)

  // Listen for message from background script that toggles the command bar
  useEffect(() => {
    const messageListener = (message: Message) => {
      if (message.type === 'TOGGLE_UI') {
        setIsVisible((prev) => !prev)
      }
    }
    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  return (
    <>
      {isVisible && (
        <CommandBarPortal onClose={() => setIsVisible(false)} portalTarget={portalTarget} />
      )}
    </>
  )
}

export default App
