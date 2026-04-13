import { alpha, ThemeOptions, Theme } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: "#86bfe5",
      light: "#b0d9f2",
      dark: "#5a9dc4",
    },
    secondary: {
      main: "#1e3a8a", // Blue instead of green
      dark: "#172554",
      contrastText: "#FEFEFE",
    },
    ...(mode === "light"
      ? {
          background: {
            default: "#FEFEFE",
            paper: "#FEFEFE",
          },
          text: {
            primary: "#2d3436",
            secondary: "#636e72",
          },
        }
      : {
          background: {
            default: "#0f172a", // Darker blue-black
            paper: "#1e293b",
          },
          text: {
            primary: "#FEFEFE",
            secondary: alpha("#FEFEFE", 0.7),
          },
        }),
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 4, // 90° not too rounded
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Consistent border radius
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export const getGlassStyles = (theme: Theme) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(4px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.05)",
});

export default getDesignTokens;
