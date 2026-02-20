import { alpha, ThemeOptions, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
    palette: {
        mode,
        primary: {
            main: '#1a5f7a',
            light: '#518cb9',
            dark: '#00354e',
        },
        secondary: {
            main: '#ff6b35',
        },
        ...(mode === 'light'
            ? {
                background: {
                    default: '#f8f9fa',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#2d3436',
                    secondary: '#636e72',
                },
            }
            : {
                background: {
                    default: '#121212',
                    paper: '#1e1e1e',
                },
                text: {
                    primary: '#ffffff',
                    secondary: alpha('#ffffff', 0.7),
                },
            }),
    },
    typography: {
        fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

export const getGlassStyles = (theme: Theme) => ({
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
});

export default getDesignTokens;
