import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // The include option can often be removed if using standard file extensions like .jsx, .tsx
      // include: "**/*.{jsx,js,tsx,ts}", 
    }),
  ],
  // Removing the explicit esbuild section
  // esbuild: {
  //   loader: "jsx",
  //   include: /src\/.*\.jsx?$/,
  //   exclude: [],
  // },
  // Removing the explicit optimizeDeps.esbuildOptions section
  // optimizeDeps: {
  //   esbuildOptions: {
  //     loader: {
  //       '.js': 'jsx',
  //     },
  //   },
  // },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

