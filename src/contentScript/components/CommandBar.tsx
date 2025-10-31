import React, { useState, useEffect, useRef } from 'react'
import { CommandResult, Message } from '../../types'
import AiThinkingIndicator from './AiThinkingIndicator'

import {
  CommandBarContainer,
  CommandInputStyled,
  ResultsListContainer,
} from './CommandBar.styles'
import ResultItem from './ResultItem'

type AiStatus = 'idle' | 'processing'

const CommandBar = React.forwardRef<HTMLDivElement>((props, ref) => {
  const [command, setCommand] = useState('')
  const [results, setResults] = useState<CommandResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when the component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Send the command to the background script whenever it changes
  useEffect(() => {
    if (command.trim() !== '') {
      chrome.runtime.sendMessage({
        type: 'COMMAND_CHANGED',
        payload: command,
      })
    } else {
      setResults([]) // Clear results when query is empty
      setAiStatus('idle') // Reset AI status if the query is empty
    }
  }, [command])

  // Listen for messages from the background script
  useEffect(() => {
    const messageListener = (message: Message) => {
      console.log('Helm Content Script: Received message from background script:', message)
      if (message.type === 'RESULTS_UPDATED') {
        setResults(message.payload)
        setAiStatus('idle')
      } else if (message.type === 'AI_PROCESSING_STARTED') {
        setAiStatus('processing')
      }
    }
    chrome.runtime.onMessage.addListener(messageListener)

    return () => chrome.runtime.onMessage.removeListener(messageListener)
  }, [])

  // Reset highlighted index when the results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value)
  }

  // Handle selecting an item from the results list
  const handleSelect = (result: CommandResult) => {
    chrome.runtime.sendMessage({
      type: 'EXECUTE_ACTION',
      payload: result,
    })
  }

  // Handle keyboard navigation of the results list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      console.log('Helm Content Script: ArrowDown pressed')
      e.preventDefault()
      // Modulo to loop back around
      setSelectedIndex((prevIndex) => (prevIndex + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      console.log('Helm Content Script: ArrowUp pressed')
      e.preventDefault()
      setSelectedIndex((prevIndex) => (prevIndex - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      console.log('Helm Content Script: Enter pressed')
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }
  }

  return (
    <CommandBarContainer ref={ref}>
      <CommandInputStyled
        ref={inputRef}
        value={command}
        onChange={handleCommandChange}
        onKeyDown={handleKeyDown}
        placeholder="Find, group, or manage tabs..."
        fullWidth
        autoFocus
      />
      <ResultsListContainer disablePadding>
        {aiStatus === 'processing' && <AiThinkingIndicator />}
        {results.map((result, index) => (
          <ResultItem
            key={result.id}
            result={result}
            isSelected={index === selectedIndex}
            onSelect={handleSelect}
          />
        ))}
      </ResultsListContainer>
    </CommandBarContainer>
  )
})

export default CommandBar
