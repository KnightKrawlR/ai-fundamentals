# Implementation Steps for My Game-Plan Portal

This document provides step-by-step instructions for implementing the My Game-Plan portal with the enhanced three-dropdown structure.

## Files Overview

1. **my-game-plan.html** - Main HTML page (place at root level of your website)
2. **my-game-plan/components/MyGamePlan.jsx** - Main React component with three-dropdown structure
3. **my-game-plan/components/grokAI.js** - Grok AI integration
4. **my-game-plan/gameplan-function.js** - Firebase Function for Grok API
5. **my-game-plan/my-game-plan-index.js** - Entry point for React application
6. **my-game-plan/webpack.config.js** - Webpack configuration

## Implementation Steps

### 1. Add HTML File

Place the `my-game-plan.html` file at the root level of your website, alongside your existing `my-learning.html` and `my-games.html` files.

### 2. Create React Components

1. Create a `my-game-plan` directory in your project
2. Create a `components` subdirectory inside `my-game-plan`
3. Add the following files:
   - `my-game-plan/components/MyGamePlan.jsx`
   - `my-game-plan/components/grokAI.js`
   - `my-game-plan/my-game-plan-index.js`

### 3. Add Firebase Function

Add the code from `gameplan-function.js` to your existing Firebase Functions. You can either:

1. Copy the entire function into your existing `functions/index.js` file, or
2. Create a new file in your functions directory and import it in your main index.js

### 4. Set Up Environment Variables

Make sure to set up the Grok API key in your Firebase Functions:

```bash
firebase functions:config:set grok.apikey="YOUR_GROK_API_KEY"
```

### 5. Update Webpack Configuration

Create a webpack configuration file in your `my-game-plan` directory:

```javascript
// my-game-plan/webpack.config.js
const path = require('path');

module.exports = {
  entry: {
    'my-game-plan-bundle': './my-game-plan-index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
```

### 6. Add Required Dependencies

Make sure you have the following dependencies in your project:

```bash
npm install @google-cloud/vertexai axios react react-dom
```

### 7. Update Navigation Menu

Ensure your navigation menu includes a link to the My Game-Plan page:

```html
<a href="/my-game-plan.html">My Game Plan</a>
```

### 8. Build and Deploy

1. Build your React application:
   ```bash
   cd my-game-plan
   npx webpack --mode production
   ```

2. Deploy your Firebase Functions:
   ```bash
   firebase deploy --only functions
   ```

3. Deploy your website files:
   ```bash
   firebase deploy --only hosting
   ```

## Troubleshooting

If you encounter any issues:

1. **Firebase Initialization**: Make sure Firebase is properly initialized in your HTML file
2. **Missing Components**: Check for any missing components like ErrorBoundary or CreditPurchaseModal
3. **API Key**: Verify your Grok API key is correctly set in Firebase Functions config
4. **Bundle Path**: Ensure the path to your bundle in the HTML file matches your actual file structure

## Structure of the Three Dropdowns

The My Game-Plan portal now features three interconnected dropdowns:

1. **Topic Dropdown**: Contains main topics from your learning paths (Introduction to AI, Office Productivity, etc.)
2. **Challenge Dropdown**: Dynamically updates based on the selected topic to show relevant challenges
3. **Project Type Dropdown**: Further refines the selection based on both topic and challenge

This structure provides a guided experience for users while still allowing for customization through the additional project description field.
