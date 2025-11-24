export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // this will include index.css only if imported in JS
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        chicle: ["Chicle", "serif"],
      },
    },
  },
  plugins: [],
};
