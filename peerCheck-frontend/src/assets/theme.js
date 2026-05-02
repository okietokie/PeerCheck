// //peerCheck-frontend/src/assets/theme.js
import { createTheme, darken, lighten, alpha } from "@mui/material/styles";

import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/adlam-display/400.css';
import '@fontsource/alkatra/400.css';
import '@fontsource/alkatra/500.css';
import '@fontsource/alkatra/600.css';
import '@fontsource/alkatra/700.css';

// Typography
const typographyConfig = {
  fontFamily: '"Inter", "Adlam Display", "Alkatra", cursive, sans-serif',
  h1: { fontFamily: '"Adlam Display", serif', fontWeight: 400 },
  h2: { fontFamily: '"Adlam Display", serif', fontWeight: 400 },
  h3: { fontFamily: '"Bree Serif", serif', fontWeight: 400, fontSize: '2.5rem' },
  h4: { fontFamily: '"Adlam Display", serif', fontWeight: 400 },
  h5: { fontFamily: '"Alkatra", cursive', fontWeight: 400, fontSize: '2.5rem' },
  h6: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
  body1: { fontFamily: '"Inter", sans-serif', fontWeight: 400 },
  body2: { fontFamily: '"Inter", sans-serif', fontWeight: 300 },
  button: { fontFamily: '"Adlam Display", serif', fontWeight: 400, textTransform: 'none' },
};

const getScrollbarStyles = (theme, isDark) => {
  const track = isDark
    ? lighten(theme.palette.background.default, 0.08)
    : darken(theme.palette.background.default, 0.03);
  const thumb = isDark
    ? alpha(theme.palette.primary.light, 0.42)
    : alpha(theme.palette.primary.main, 0.32);
  const thumbHover = isDark
    ? alpha(theme.palette.secondary.light, 0.52)
    : alpha(theme.palette.secondary.main, 0.4);

  return {
    scrollbarWidth: 'thin',
    scrollbarColor: `${thumb} ${track}`,
    '&::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '&::-webkit-scrollbar-track': {
      background: `linear-gradient(180deg, ${alpha(track, 0.92)}, ${alpha(track, 0.72)})`,
      borderRadius: '999px',
      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    },
    '&::-webkit-scrollbar-thumb': {
      background: `linear-gradient(180deg, ${thumb}, ${alpha(theme.palette.primary.main, isDark ? 0.32 : 0.24)})`,
      borderRadius: '999px',
      border: `2px solid ${alpha(track, 0.88)}`,
      minHeight: '36px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: `linear-gradient(180deg, ${thumbHover}, ${alpha(theme.palette.primary.main, isDark ? 0.42 : 0.34)})`,
    },
    '&::-webkit-scrollbar-corner': {
      background: 'transparent',
    },
  };
};

function makeTheme(mode, primaryColor, secondaryColor, backgroundColor) {
  const isDark = mode === 'dark';
  const baseTheme = createTheme({
    typography: typographyConfig,
    palette: {
          mode,
          primary: {
            main: primaryColor,

            light: isDark ? lighten(primaryColor, 0.2) : lighten(primaryColor, 0.4),

            dark: darken(primaryColor, 0.2),
            contrastText: isDark ? '#fff' : '#000',
          },
          secondary: {
            main: secondaryColor,
            light: lighten(secondaryColor, 0.3),
            dark: darken(secondaryColor, 0.3),
          },
          background: {
            default: backgroundColor,

            paper: isDark ? lighten(backgroundColor, 0.05) : darken(backgroundColor, 0.02),
          },
        },

    components:{
      MuiCssBaseline: {
        styleOverrides: (themeParam) => ({
          html: {
            ...getScrollbarStyles(themeParam, isDark),
          },
          body: {
            ...getScrollbarStyles(themeParam, isDark),
          },
          '*': {
            scrollbarWidth: 'thin',
          },
          '*::-webkit-scrollbar': {
            width: '10px',
            height: '10px',
          },
          '*::-webkit-scrollbar-track': {
            background: `linear-gradient(180deg, ${alpha(
              isDark ? lighten(themeParam.palette.background.default, 0.08) : darken(themeParam.palette.background.default, 0.03),
              0.92
            )}, ${alpha(
              isDark ? lighten(themeParam.palette.background.default, 0.08) : darken(themeParam.palette.background.default, 0.03),
              0.72
            )})`,
            borderRadius: '999px',
          },
          '*::-webkit-scrollbar-thumb': {
            background: `linear-gradient(180deg, ${isDark
              ? alpha(themeParam.palette.primary.light, 0.42)
              : alpha(themeParam.palette.primary.main, 0.32)}, ${alpha(themeParam.palette.primary.main, isDark ? 0.32 : 0.24)})`,
            borderRadius: '999px',
            border: `2px solid ${alpha(
              isDark ? lighten(themeParam.palette.background.default, 0.08) : darken(themeParam.palette.background.default, 0.03),
              0.88
            )}`,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: `linear-gradient(180deg, ${isDark
              ? alpha(themeParam.palette.secondary.light, 0.52)
              : alpha(themeParam.palette.secondary.main, 0.4)}, ${alpha(themeParam.palette.primary.main, isDark ? 0.42 : 0.34)})`,
          },
          '.app-horizontal-scroll': {
            ...getScrollbarStyles(themeParam, isDark),
            paddingBottom: '8px',
          },
        }),
      },
      MuiTooltip:{
        defaultProps:{
          arrow: true,
          enterDelay: 300,
        },
        styleOverrides:{
          tooltip:{
            backgroundColor: isDark
              ? lighten(backgroundColor, 0.15)
              : darken(backgroundColor, 0.05),
            color: isDark ? "#fff" : "#000",
            fontSize: '0.85rem',
            fontFamily:'"Inter",  sans-serif',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.3)',
            padding: '8px 12px',
            borderRadius: '8px',
          },
          arrow: {
            color: isDark
              ? lighten(backgroundColor, 0.15)
              : darken(backgroundColor, 0.05),
          },
        }
      }
    }
  });

  return baseTheme;
}

const themes = {
  
    "midnight-ocean": makeTheme("dark", "#4ABAF2", "#0277BD", "#001829"),

  "dark-high-contrast": makeTheme("dark", "#8AB4F8", "#FF8FA3", "#0D0D0D"),
  "dark-medium-contrast": makeTheme("dark", "#64A2F3", "#E26A6A", "#171717"),
  "light-high-contrast": makeTheme("light", "#1565C0", "#C62828", "#FFFFFF"),
  "light-medium-contrast": makeTheme("light", "#1E88E5", "#EF535  0", "#F5F6FA"),

  "pastel-lavender": makeTheme("light", "#AFA3E8", "#D4A5E6", "#F7F2FF"),
  "pastel-mint": makeTheme("light", "#7ACFC0", "#48B8A5", "#E6FAF6"),
  "pastel-mauve-rose": makeTheme("light", "#F29CB8", "#E16491", "#FBE8F2"),
  "pastel-peach": makeTheme("light", "#FF9F7E", "#FF7755", "#FFF4EA"),
  "pastel-vintage": makeTheme("light", "#CCBBAF", "#927B6A", "#F6EFEA"),
  "pastel-blush": makeTheme("light", "#F6B7C9", "#F28AAE", "#FFF5F9"),

  "goth-violet": makeTheme("dark", "#A98BFF", "#6F3BFF", "#0A0014"),
  "goth-bloodmoon": makeTheme("dark", "#E84C47", "#8A1111", "#0E0000"),
  "goth-storm": makeTheme("dark", "#8FA0AC", "#596E79", "#060A10"),

  "cyber-grid": makeTheme("dark", "#00D2F2", "#009BE6", "#001B26"),
  "cyber-neon": makeTheme("dark", "#F200C9", "#00F28C", "#050007"),

  "sunset-glow": makeTheme("light", "#FF7B57", "#FFAE70", "#FFF4E9"),
  "forest-haze": makeTheme("light", "#78CC8C", "#43A047", "#E9F6EC"),
  "royal-purple": makeTheme("dark", "#C88CE0", "#973DB4", "#15001C"),
  "deep-space": makeTheme("dark", "#8FBDFB", "#495CFF", "#01000D"),
  "rose-blush": makeTheme("light", "#F5A3BC", "#D85086", "#FFF2F7"),
  "teal-dream": makeTheme("light", "#47B6AC", "#00796B", "#E3F4F3"),
  "warm-sands": makeTheme("light", "#FFC273", "#FFA74A", "#FFF8EF"),
  "cool-mint": makeTheme("light", "#77DCEC", "#20BFD0", "#E4FAFD"),
  "solar-eclipse": makeTheme("dark", "#FFBD27", "#FF9500", "#090600"),
  "candy-pastel": makeTheme("light", "#FF98C4", "#FF71A4", "#FFF3FB"),
};

export default themes;
