export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: 
    {
      fontFamily:{
        jakarta: ["Plus Jakarta Sans", "sans-serif"]
      }
    } 
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"]
  }
}