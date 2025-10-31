import React from 'react'
import { CommandResult } from '../../types'
import { ResultItemStyled } from './CommandBar.styles'

// Import MUI components for the content
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

// Import MUI Icons for actions
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed'
import CloseIcon from '@mui/icons-material/Close'

// This helper function generates presentation data from the results received from the background
function generateDisplayInfoFromPlan(plan: any[]): { title: string; icon: React.ReactNode } {
  if (!plan || plan.length === 0) return { title: 'Invalid Action', icon: <></> }

  const finalAction = plan[plan.length - 1]
  switch (finalAction.action) {
    case 'GROUP_TABS':
      return {
        title: `Group tabs about '${finalAction.params.groupName}'`,
        icon: <DynamicFeedIcon sx={{ fontSize: '18px' }} />,
      }
    case 'CLOSE_TABS':
      const findStep = plan.find((step) => step.action === 'FIND_TABS')
      const query = findStep?.params.query || 'matching tabs'
      return {
        title: `Close tabs matching '${query}'`,
        icon: <CloseIcon sx={{ fontSize: '18px' }} />,
      }
    default:
      return { title: 'Execute a complex plan', icon: <span>▶️</span> }
  }
}

interface ResultItemProps {
  result: CommandResult
  isSelected: boolean
  onSelect: (result: CommandResult) => void
}

const ResultItem = ({ result, isSelected, onSelect }: ResultItemProps) => {
  let displayTitle: string
  let displaySubtitle: string | undefined
  let displayIcon: React.ReactNode

  if (result.type === 'action') {
    const { title, icon } = generateDisplayInfoFromPlan(result.payload.plan)
    displayTitle = title
    displaySubtitle = 'Press Enter to execute this plan'
    displayIcon = icon
  } else {
    // type is 'tab'
    displayTitle = result.title
    displaySubtitle = result.subtitle
    displayIcon = (
      <img src={result.faviconUrl || 'icons/default_icon.png'} style={{ width: 16, height: 16 }} />
    )
  }

  return (
    <ListItem key={result.id} disablePadding>
      {/* Use the "dumb" styled component for the root element */}
      <ResultItemStyled selected={isSelected} onClick={() => onSelect(result)}>
        <ListItemIcon sx={{ minWidth: '36px', display: 'flex', justifyContent: 'center' }}>
          {displayIcon}
        </ListItemIcon>
        <ListItemText
          primary={displayTitle}
          secondary={displaySubtitle}
        />
      </ResultItemStyled>
    </ListItem>
  )
}

export default ResultItem
