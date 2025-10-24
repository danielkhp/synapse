import React, { useState, useEffect, useRef } from 'react';
import Input from './Input';
import ResultsList from './ResultsList';

interface CommandBarProps {
  isVisible: boolean;
}

const CommandBar = React.forwardRef<HTMLDivElement, CommandBarProps>(({ isVisible }, ref) => {
  const [command, setCommand] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when the component becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Reset state when the command bar is closed, after the fade-out animation
  useEffect(() => {
    if (!isVisible) {
      const rootStyle = getComputedStyle(document.documentElement);
      const durationString = rootStyle.getPropertyValue('--helm-transition-duration');
      const durationMs = parseFloat(durationString) * 1000;

      const timer = setTimeout(() => {
        setCommand('');
        setResults([]);
        setHighlightedIndex(0);
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value);
    // placeholder example results
    if (e.target.value.length > 0) {
      setResults(['Result 1', 'Result 2', 'Result 3']);
    }
    else {
      setResults([]);
    }
  };

  return (
    <div className={`helm-command-bar ${isVisible ? 'visible' : 'hidden'}`} ref={ref}>
      <Input ref={inputRef} value={command} onChange={handleCommandChange} />
      <ResultsList results={results} highlightedIndex={highlightedIndex} />
    </div>
  );
});

export default CommandBar;
