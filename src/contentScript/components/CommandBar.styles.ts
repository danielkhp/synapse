import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'

export const CommandBarContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: theme.spacing(1),
  border: '1px solid #ddd',
  width: '600px',
  maxWidth: '90vw',
  display: 'flex',
  flexDirection: 'column',
}))

export const CommandInputStyled = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    input: {
      fontSize: '16px',
      padding: '12px 14px',
    },
  },
})

export const ResultsListContainer = styled(List)({
  marginTop: '4px',
  maxHeight: '400px',
  overflowY: 'auto',
})

export const ResultItemStyled = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '4px',
  padding: '8px 12px',
  '&.Mui-selected': {
    backgroundColor: '#eee',
    '& .MuiListItemText-primary': {
      fontSize: '16px',
    },
  },
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}))
