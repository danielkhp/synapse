import React from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { ResultItemStyled } from './CommandBar.styles'

const AiThinkingIndicator = () => {
  console.log('AiThinkingIndicator mounted')
  return (
    <ListItem disablePadding>
      <ResultItemStyled disabled>
        <ListItemIcon sx={{ minWidth: '32px' }}>
          <span>✨</span>
        </ListItemIcon>
        <ListItemText primary="Thinking..." />
      </ResultItemStyled>
    </ListItem>
  )
}

export default AiThinkingIndicator
