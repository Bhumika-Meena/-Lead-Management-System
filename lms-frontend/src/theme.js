import { createTheme } from '@mui/material/styles';
import { green, orange, grey } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green
      light: green[100],
      dark: green[800],
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff9800', // Orange
      light: orange[100],
      dark: orange[800],
      contrastText: '#fff',
    },
    background: {
      default: '#f5f6fa', // Soft gray
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: grey[700],
    },
    divider: grey[200],
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(46,125,50,0.04)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 16px rgba(46,125,50,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#f8fafc',
          borderRight: '1px solid #e0e0e0',
        },
      },
    },
  },
});

export default theme; 