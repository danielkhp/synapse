import React, { useState, useEffect, useRef } from 'react'
import { CommandResult, Message } from '../../types'
import AiThinkingIndicator from './AiThinkingIndicator'

import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import {
  CommandBarContainer,
  CommandInputStyled,
  ResultItemStyled,
  ResultsListContainer,
} from './CommandBar.styles'

type AiStatus = 'idle' | 'processing'

const CommandBar = React.forwardRef<HTMLDivElement>((props, ref) => {
  const [command, setCommand] = useState('')
  const [results, setResults] = useState<CommandResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when the component mounts
  useEffect(() => {
    console.log('Helm Content Script: CommandBar mounted.')
    inputRef.current?.focus()
  }, [])

  // Send the command to the background script whenever it changes
  useEffect(() => {
    if (command.trim() !== '') {
      console.log(`Helm Content Script: Command changed to "${command}"`)
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
      } else if (message.type === 'AI_PROCESSING_FINISHED') {
        setAiStatus('idle')
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
    console.log('Helm Content Script: Executing action for result', result)
    chrome.runtime.sendMessage({
      type: 'EXECUTE_ACTION',
      payload: { id: result.id },
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
          <ListItem key={result.id} disablePadding>
            <ResultItemStyled
              selected={index === selectedIndex}
              onClick={() => handleSelect(result)}
            >
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <img
                  src={result.faviconUrl || 'icons/default_icon.png'}
                  style={{ width: 16, height: 16 }}
                />
              </ListItemIcon>
              <ListItemText primary={result.title} secondary={result.subtitle} />
            </ResultItemStyled>
          </ListItem>
        ))}
      </ResultsListContainer>
    </CommandBarContainer>
  )
})

export default CommandBar
