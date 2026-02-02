import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Matches your GitHub repository name exactly
  base: '/maxdiff_calculator_V2/', 
});