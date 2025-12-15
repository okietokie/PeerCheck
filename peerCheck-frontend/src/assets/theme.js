// //peerCheck-frontend/src/assets/theme.js
import { createTheme } from "@mui/material/styles";
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/adlam-display/400.css';
import '@fontsource/alkatra/400.css';
import '@fontsource/alkatra/500.css';
import '@fontsource/alkatra/600.css';
import '@fontsource/alkatra/700.css';

// Shared Typography
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

function makeTheme(mode, primaryColor, secondaryColor, backgroundColor) {
  return createTheme({
    typography: typographyConfig,
    palette: {
      mode: mode,
      primary: { main: primaryColor, contrastText: mode === 'dark' ? '#fff' : '#000' },
      secondary: { main: secondaryColor, contrastText: mode === 'dark' ? '#fff' : '#000' },
      background: { default: backgroundColor, paper: backgroundColor },
    },
  });
}
const themes = {

  "dark-high-contrast": makeTheme("dark", "#90caf9", "#f48fb1", "#000000"),
  "dark-medium-contrast": makeTheme("dark", "#6ab0f3", "#e57373", "#121212"),
  "light-high-contrast": makeTheme("light", "#1976d2", "#d32f2f", "#ffffff"),
  "light-medium-contrast": makeTheme("light", "#2196f3", "#e57373", "#f4f4f4"),


  "pastel-lavender": makeTheme("light", "#b39ddb", "#ce93d8", "#f3e8ff"),
  "pastel-mint": makeTheme("light", "#80cbc4", "#4db6ac", "#e0f7f5"),
  "pastel-mauve-rose": makeTheme("light", "#f48fb1", "#ec407a", "#fde4ec"),
  "pastel-peach": makeTheme("light", "#ffab91", "#ff8a65", "#fff1e8"),
  "pastel-vintage": makeTheme("light", "#d7ccc8", "#a1887f", "#f7f0ee"),
  "pastel-blush": makeTheme("light", "#f8bbd0", "#f48fb1", "#fff0f6"),


  "goth-violet": makeTheme("dark", "#b388ff", "#7c4dff", "#0b0018"),
  "goth-bloodmoon": makeTheme("dark", "#ef5350", "#b71c1c", "#140000"),
  "goth-storm": makeTheme("dark", "#90a4ae", "#607d8b", "#0a0f14"),

  "cyber-grid": makeTheme("dark", "#00e5ff", "#00b0ff", "#001219"),
  "cyber-neon": makeTheme("dark", "#ff00e6", "#00ff95", "#010005"),


  "sunset-glow": makeTheme(
    "light",
    "#ff7e5f",
    "#feb47b",
    "#fff3e8"
  ),

  "midnight-ocean": makeTheme(
    "dark",
    "#4fc3f7",
    "#0288d1",
    "#001f33"
  ),

  "forest-haze": makeTheme(
    "light",
    "#81c784",
    "#4caf50",
    "#e8f5e9"
  ),

  "royal-purple": makeTheme(
    "dark",
    "#ce93d8",
    "#ab47bc",
    "#1a001f"
  ),

  "deep-space": makeTheme(
    "dark",
    "#90caf9",
    "#536dfe",
    "#020012"
  ),

  "rose-blush": makeTheme(
    "light",
    "#f48fb1",
    "#ec407a",
    "#fff0f5"
  ),

  "teal-dream": makeTheme(
    "light",
    "#4db6ac",
    "#00897b",
    "#e0f2f1"
  ),

  "warm-sands": makeTheme(
    "light",
    "#ffcc80",
    "#ffb74d",
    "#fff7ec"
  ),

  "cool-mint": makeTheme(
    "light",
    "#80deea",
    "#26c6da",
    "#e0f7fa"
  ),

  "solar-eclipse": makeTheme(
    "dark",
    "#ffca28",
    "#ffa000",
    "#0a0700"
  ),

  "candy-pastel": makeTheme(
    "light",
    "#ff9ecb",
    "#ff77a9",
    "#fff2fa"
  ),
};

export default themes;