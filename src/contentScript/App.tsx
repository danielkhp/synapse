import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CommandBar from './components/CommandBar';

const App = () => {
  const [isVisible, setIsVisible] = useState(false);
  const commandBarRef = useRef<HTMLDivElement>(null); // Ref for the CommandBar itself

  // Effect to toggle pointer-events on the root container
  useEffect(() => {
    const rootElement = document.getElementById('helm-app-container');
    if (rootElement) {
      rootElement.style.pointerEvents = isVisible ? 'auto' : 'none';
    }
  }, [isVisible]);

  // Listen for message from background script that opens the command bar
  useEffect(() => {
    const messageListener = (request, sender, sendResponse) => {
      if (request.type === 'TOGGLE_UI') {
        setIsVisible(prev => !prev);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Handle Escape key and click outside
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Check if the click target is outside the CommandBar itself
      if (commandBarRef.current && !commandBarRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    // Add event listeners when the bar appears
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    // Remove listeners when the bar is closed
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className="helm-app-container">
      <CommandBar ref={commandBarRef} isVisible={isVisible} />
    </div>
  );
};

export default App;
