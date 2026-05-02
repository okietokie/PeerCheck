// utils/themeUtils.js
export const getThemeNames = (themes) => {
  return Object.keys(themes);
};

export const categorizeThemes = (themeNames) => {
  const categories = {
    dark: themeNames.filter(name => name.toLowerCase().includes('dark')),
    light: themeNames.filter(name => name.toLowerCase().includes('light')),
    colorful: themeNames.filter(name => 
      name.toLowerCase().includes('colorful') || 
      name.toLowerCase().includes('vibrant') ||
      name.toLowerCase().includes('rainbow')
    ),
    pastel: themeNames.filter(name => name.toLowerCase().includes('pastel')),
    other: themeNames.filter(name => 
      !name.toLowerCase().includes('dark') &&
      !name.toLowerCase().includes('light') &&
      !name.toLowerCase().includes('colorful') &&
      !name.toLowerCase().includes('vibrant') &&
      !name.toLowerCase().includes('rainbow') &&
      !name.toLowerCase().includes('pastel')
    )
  };
  
  return categories;
};