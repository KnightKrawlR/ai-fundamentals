# AI Fundamentals - New Homepage Implementation Guide for Cursor.ai

This document provides all necessary instructions for integrating the new React-based homepage into the existing AI Fundamentals project. The definitive design reference is the live demo: [https://hrlldehf.manus.space](https://hrlldehf.manus.space)

## 1. Overview

The goal was to create a visually stunning, modern, and mobile-friendly homepage using React, inspired by jeton.com, while retaining the AI Fundamentals purple color scheme. The new design emphasizes the "AI Game Plan" feature and incorporates a dynamic wave theme.

**Key Features:**
- Wave-themed design with dramatic background animations.
- Minimalist and concise text content.
- White navigation bar with improved mobile layout (hamburger menu hides auth buttons).
- Custom animated wave logo.
- Hero section focusing on the "AI Game Plan" call-to-action.
- Section explaining the "AI Wave" transforming industries.
- Embedded Game Plan creator form.
- "Track Your Progress" section showcasing business-focused AI topics (as seen in the live demo).
- Fully responsive design tested across devices.

## 2. Package Contents

This package contains:
- `src/`: Directory with all React component source code (JSX), hooks, pages, styles (CSS/Tailwind), and assets.
- `package.json`: Lists all required dependencies.
- Configuration Files: `tailwind.config.js`, `postcss.config.js`, `vite.config.js`, `tsconfig.json`, `tsconfig.node.json`.
- `README.md`: This instruction file.

## 3. Dependencies

Ensure the following dependencies (listed in `package.json`) are installed in your project:
- `react`
- `react-dom`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `framer-motion`
- `react-icons`
- `vite-plugin-jsx` (if using Vite)

Run `npm install` or `yarn install` within the project directory after adding these dependencies to your existing `package.json` or merging them.

## 4. Integration Steps

1.  **Copy Components:** Copy the entire `src` directory from this package into your existing AI Fundamentals React project, replacing or merging with your current `src` directory as appropriate. Pay attention to potential conflicts with existing file names.
2.  **Update Main App File:** Modify your main application file (e.g., `App.js`, `App.tsx`, or your main router file) to render the new `Home` page component (`src/pages/Home.jsx`) for your root route (`/`). Remove the rendering of your old homepage component.
    *Example (Conceptual - adapt to your specific routing setup):*
    ```jsx
    import React from 'react';
    import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
    import Home from './pages/Home'; // Import the new Home component
    // ... other imports

    function App() {
      return (
        <Router>
          <Switch>
            <Route exact path="/" component={Home} /> {/* Use the new Home component */}
            {/* ... other routes for Learning, AI Tools, Premium, My Game Plan, etc. */}
          </Switch>
        </Router>
      );
    }

    export default App;
    ```
3.  **Configure Tailwind CSS:** Ensure Tailwind CSS is correctly configured in your project. Copy the `tailwind.config.js` and `postcss.config.js` files from this package. Make sure your main CSS file (e.g., `index.css`) includes the Tailwind directives:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
4.  **Verify Build Setup:** If using Vite, ensure `vite.config.js` includes necessary plugins like `vite-plugin-jsx`. Adapt configuration files (`tsconfig.json`, etc.) as needed for your project's build process.
5.  **Navigation Links:** Update the links within the `Navbar` component (`src/components/navigation/Navbar.jsx`) and `Footer` component (`src/components/layout/Footer.jsx`) to point to the correct routes within your existing application (e.g., `/learning`, `/ai-tools`, `/premium`, `/my-game-plan`).
6.  **Game Plan Integration:** The "Create Your Game Plan" buttons and the embedded form should ideally link to or trigger the functionality of your existing `/my-game-plan` page/feature.
7.  **Progress Tracking Data:** 
    **[CRITICAL NOTE]** The "Track Your Progress" section, visible in the live demo ([https://hrlldehf.manus.space](https://hrlldehf.manus.space)), requires a component named `ProgressDashboard.jsx` (expected at `src/components/progress/ProgressDashboard.jsx`). **This component is currently MISSING from the provided `src` directory.** The `Home.jsx` component also does not include it. Therefore, you cannot implement the "Track Your Progress" section using only the files in this package. You will need to either:
    a) Re-create this component based on the visual appearance in the live demo.
    b) Request the missing component file.
    Once the component exists, you will need to connect it to your actual user progress data source, replacing the placeholder data.

## 5. Testing

- After integration, thoroughly test the homepage across different browsers (Chrome, Firefox, Safari, Edge) and devices (desktop, tablet, mobile).
- Verify all links, animations, and responsive layouts function as expected, matching the live demo: [https://hrlldehf.manus.space](https://hrlldehf.manus.space)
- Pay special attention to the mobile navigation and the layout of the "Track Your Progress" section (once implemented).

## 6. Notes

- The provided code uses functional components and React Hooks.
- Styling is primarily done using Tailwind CSS.
- Animations are implemented using Framer Motion and custom CSS.
- The HTML demos previously provided were for visual reference only and may not perfectly match the final React implementation due to differences in how animations and styles are handled.

Please refer to the live demo as the single source of truth for the design and functionality (except for the missing Track Progress component).

