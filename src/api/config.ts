export const isLocal = true; // Toggle this boolean to switch between local and online API

export const API_URL = isLocal 
  ? import.meta.env.VITE_API_LOCAL 
  : import.meta.env.VITE_API_URL;
