import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

// CAU Brand Colors
const CAUColors = {
  primary: {
    main: '#0066CC',
    light: '#4D94D9',
    dark: '#004A99',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF6B35',
    light: '#FF9D7A',
    dark: '#CC5528',
    contrastText: '#FFFFFF',
  },
  tertiary: {
    main: '#2E8B57',
    light: '#5FAD7F',
    dark: '#1F5F3F',
    contrastText: '#FFFFFF',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  success: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#ED6C02',
    light: '#FF9800',
    dark: '#E65100',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#0288D1',
    light: '#03A9F4',
    dark: '#01579B',
    contrastText: '#FFFFFF',
  },
};

const typography = {
  fontFamily: [
    '"Inter"',
    '"Roboto"',
    '"Helvetica"',
    '"Arial"',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 500,
  },
};

const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: CAUColors.primary,
    secondary: CAUColors.secondary,
    error: CAUColors.error,
    warning: CAUColors.warning,
    info: CAUColors.info,
    success: CAUColors.success,
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: CAUColors.neutral[900],
      secondary: CAUColors.neutral[600],
    },
    divider: CAUColors.neutral[200],
  },
  typography,
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
        },
        containedPrimary: {
          backgroundColor: CAUColors.primary.main,
          '&:hover': {
            backgroundColor: CAUColors.primary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: CAUColors.primary.main,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${CAUColors.neutral[200]}`,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${CAUColors.neutral[200]}`,
          borderRadius: 8,
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${CAUColors.neutral[100]}`,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: CAUColors.neutral[50],
            borderBottom: `1px solid ${CAUColors.neutral[200]}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
};

const darkTheme: ThemeOptions = {
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: CAUColors.primary,
    secondary: CAUColors.secondary,
    error: CAUColors.error,
    warning: CAUColors.warning,
    info: CAUColors.info,
    success: CAUColors.success,
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
};

export const createCAUTheme = (mode: 'light' | 'dark' = 'light') => {
  const themeOptions = mode === 'light' ? lightTheme : darkTheme;
  return createTheme(themeOptions, ptBR);
};

export { CAUColors };
export default createCAUTheme;