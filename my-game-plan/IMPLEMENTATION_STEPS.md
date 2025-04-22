# My Game-Plan Portal Implementation Steps

This document provides step-by-step instructions for implementing the My Game-Plan portal in your AI Fundamentals project.

## Files Overview

1. **HTML Template**
   - `my-game-plan.html` - Main HTML page for the My Game-Plan feature (place at root level)

2. **React Components and JavaScript Files** (place in my-game-plan folder)
   - `my-game-plan/components/MyGamePlan.jsx` - Main React component for the Game Plan interface
   - `my-game-plan/components/grokAI.js` - Handles communication with Grok AI via Firebase Functions
   - `my-game-plan/my-game-plan-index.js` - Entry point for the React application
   - `my-game-plan/gameplan-function.js` - Backend function that calls the Grok API
   - `my-game-plan/webpack.config.js` - Dedicated webpack configuration for My Game-Plan

## Implementation Steps

### 1. Add the HTML File

Copy `my-game-plan.html` to your website's root directory.

### 2. Create the my-game-plan Folder Structure

Create a folder called `my-game-plan` in your project with a subfolder called `components`:
```
my-game-plan/
└── components/
```

### 3. Add the React Components and JavaScript Files

Copy the following files to your project:
- `my-game-plan/components/MyGamePlan.jsx`
- `my-game-plan/components/grokAI.js`
- `my-game-plan/my-game-plan-index.js`
- `my-game-plan/gameplan-function.js`
- `my-game-plan/webpack.config.js`

### 4. Update Your Firebase Functions

1. Open your existing `functions/index.js` file
2. Add the code from `my-game-plan/gameplan-function.js` to your file
3. Set the GROK_API_KEY environment variable in your Firebase Functions config:
   ```bash
   firebase functions:config:set grok.apikey="your-grok-api-key"
   ```
4. Make sure you have the axios package installed in your functions directory:
   ```bash
   cd functions
   npm install axios
   ```

### 5. Build the My Game-Plan Bundle

1. Navigate to the my-game-plan directory:
   ```bash
   cd my-game-plan
   ```

2. Run webpack to build the bundle:
   ```bash
   npx webpack --config webpack.config.js
   ```

### 6. Update Your Navigation Menu

Add a link to the new My Game-Plan page in your navigation menu or user dropdown:

```html
<a href="/my-game-plan.html">My Game Plan</a>
```

### 7. Deploy Your Changes

1. Deploy your Firebase Functions:
   ```bash
   firebase deploy --only functions
   ```

2. Deploy your website files:
   ```bash
   firebase deploy --only hosting
   ```

## Environment Variables

Make sure to set up the following environment variables in your Firebase Functions:

```bash
firebase functions:config:set grok.apikey="your-grok-api-key"
```

You'll need to get your Grok API key from your Vercel xAI integration.

## Dependencies

The My Game-Plan portal uses the following dependencies that should already be in your project:

- React
- Firebase (Auth, Firestore, Functions)
- Tailwind CSS (for styling)

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Check Firebase Functions logs for backend errors:
   ```bash
   firebase functions:log
   ```
3. Verify that the Grok API key is correctly set in your Firebase Functions config
4. Ensure your Firebase service account has the necessary permissions

## Additional Resources

- [Grok API Documentation](https://docs.xai.com/)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
