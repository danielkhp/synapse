import GlobalStyles from '@mui/material/GlobalStyles';

const globalStyles = {
  ':host': {
    all: 'initial',
    display: 'block',
    height: '100%',
    boxSizing: 'border-box',
  },
  '*, *::before, *::after': {
    boxSizing: 'inherit',
  },
  'div[class*="MuiScopedCssBaseline-root"]': {
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  '#helm-portal-container': {
    height: '100%',
  },
  '.helm-overlay': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
    paddingTop: '10vh',
  },
};

export const helmGlobalStyles = () => <GlobalStyles styles={globalStyles} />