
export const getThemeNames = (themes) => Object.keys(themes);

// Function to format theme names prettily
export const formatThemeName = (name) => {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Hc/g, "High Contrast")
    .replace(/Mc/g, "Medium Contrast");
};