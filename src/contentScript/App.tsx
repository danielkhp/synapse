import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [command, setCommand] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when the component becomes visible and reset state when it's hidden
  useEffect(() => {
    const rootElement = document.getElementById('helm-root');
    if (rootElement) {
      const observer = new MutationObserver(() => {
        if (rootElement.style.display === 'block' && inputRef.current) {
          inputRef.current.focus();
        } else if (rootElement.style.display === 'none') {
          setCommand('');
          setResults([]);
        }
      });
      observer.observe(rootElement, { attributes: true, attributeFilter: ['style'] });
      return () => observer.disconnect();
    }
  }, []);

  // Handle Escape key and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const rootElement = document.getElementById('helm-root');
        if (rootElement) {
          rootElement.style.display = 'none';
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const rootElement = document.getElementById('helm-root');
        if (rootElement) {
          rootElement.style.display = 'none';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value);
    // placeholder example results
    if (e.target.value.length > 0) {
      setResults(['Result 1', 'Result 2', 'Result 3']);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="helm-app-container" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Type a command..."
        value={command}
        onChange={handleCommandChange}
        className="helm-command-input"
      />
      <ul className="helm-results-list">
        {results.map((result, index) => (
          <li key={index} className="helm-result-item">
            {result}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
