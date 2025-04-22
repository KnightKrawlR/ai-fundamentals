# My Game Plan

This component creates personalized AI project implementation plans with a three-dropdown structure using Grok AI.

## Setting Up

### 1. Set Up Grok API Key

You need to set up your Grok API key as a Firebase function configuration variable. Run this command:

```bash
firebase functions:config:set grok.apikey="YOUR_GROK_API_KEY"
```

Replace `YOUR_GROK_API_KEY` with your actual Grok API key from xAI/Grok.

### 2. Deploy Firebase Functions

Deploy the updated Firebase functions:

```bash
firebase deploy --only functions
```

## Component Structure

- `MyGamePlan.jsx` - Main React component with three-dropdown structure
- `grokAI.js` - Integration with Grok AI via Firebase Functions
- `ErrorBoundary.jsx` - Error handling component for React app

## Features

- Three-dropdown structure:
  1. Topic selection
  2. Challenge selection (based on selected topic)
  3. Project type selection (based on topic and challenge)
- Detailed project implementation plans
- Technology recommendations
- Learning resources
- Credit-based usage system

## Integration

The component integrates with Firebase for:
- Authentication
- Firestore (storing/retrieving game plans)
- Firebase Functions (Grok AI integration) 