import React, { useState, useEffect, useRef } from 'react'
import Input from './Input'
import ResultsList from './ResultsList'
import { CommandResult, Message } from '../../types'

const CommandBar = React.forwardRef<HTMLDivElement>((props, ref) => {
  const [command, setCommand] = useState('')
  const [results, setResults] = useState<CommandResult[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when the component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Send the command to the background script whenever it changes
  useEffect(() => {
    if (command.trim() !== '') {
      chrome.runtime.sendMessage({ type: 'COMMAND_CHANGED', payload: command })
    } else {
      setResults([]) // Clear results when query is empty
    }
  }, [command])

  // Listen for results from the background script
  useEffect(() => {
    const messageListener = (message: Message) => {
      if (message.type === 'RESULTS_UPDATED') {
        setResults(message.payload)
      }
    }
    chrome.runtime.onMessage.addListener(messageListener)

    return () => chrome.runtime.onMessage.removeListener(messageListener)
  }, [])

  // Reset highlighted index when the results change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [results])

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value)
  }

  return (
    <div className="helm-command-bar" ref={ref}>
      <Input ref={inputRef} value={command} onChange={handleCommandChange} />
      <ResultsList results={results} highlightedIndex={highlightedIndex} />
    </div>
  )
})

export default CommandBar
