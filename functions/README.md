# Firebase Cloud Functions for VertexAI Integration

This directory contains Firebase Cloud Functions that integrate with Google's VertexAI service to provide AI capabilities for your application.

## Features

- Text generation with Gemini Pro
- Chat conversations with history
- Image analysis with Gemini Pro Vision
- Audio transcription with Google Speech-to-Text
- Interactive AI game sessions
- Text embeddings generation
- Credit management system

## Prerequisites

1. Firebase project with Blaze (pay-as-you-go) plan
2. Google Cloud project with VertexAI API enabled
3. Service account with appropriate permissions
4. Node.js and npm installed

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure VertexAI Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project
3. Go to "IAM & Admin" > "Service Accounts"
4. Create a new service account or use an existing one with VertexAI access
5. Generate a new JSON key for the service account
6. Save the key file as `serviceAccountKey.json` in the `functions` directory

### 3. Set Environment Variables

Create a `.env` file in the `functions` directory with the following variables:

```
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1
MODEL_NAME=gemini-pro
VISION_MODEL_NAME=gemini-pro-vision
EMBEDDING_MODEL_NAME=textembedding-gecko
```

### 4. Deploy Functions

```bash
firebase deploy --only functions
```

## Usage

After deployment, you can use these functions from your web or mobile application. All functions require Firebase Authentication. Make sure to include the Firebase Auth token in the request header:

```javascript
// Example client-side JavaScript
const response = await fetch('https://your-region-your-project.cloudfunctions.net/generateAiResponse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${await firebase.auth().currentUser.getIdToken()}`
  },
  body: JSON.stringify({
    prompt: 'Tell me about Firebase and VertexAI integration',
    systemInstructions: 'You are a helpful assistant.'
  })
});

const result = await response.json();
console.log(result.response);
```

## Available Functions

| Function Name | Description |
|---------------|-------------|
| `generateAiResponse` | Generate text response from a prompt |
| `processChatConversation` | Handle multi-turn conversations |
| `initializeGameSession` | Start a new AI game session |
| `sendGameMessage` | Send a message in an existing game session |
| `processImageForVertexAI` | Analyze images with text prompts |
| `processAudioForVertexAI` | Transcribe audio and optionally respond |
| `generateEmbeddings` | Create vector embeddings for text |

## Credit System

The system includes a credit management system to control usage:

- Each text generation costs 1 credit
- Each image processing costs 3 credits
- Each audio processing costs 2 credits
- Each game session message costs 1 credit

Users start with a default number of credits which can be managed in the Firestore database.

## Troubleshooting

### Common Issues

1. **"Error: Could not load the default credentials"** - Make sure your service account key is properly set up.
2. **"Error: 7 PERMISSION_DENIED"** - Check that your service account has the necessary permissions.
3. **"Error: 16 UNAUTHENTICATED"** - Verify you're passing the Firebase Auth token correctly.

If you encounter any issues, check the Firebase Function logs in the Firebase Console for more detailed error messages. 