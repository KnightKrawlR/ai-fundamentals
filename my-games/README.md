# My Games - AI Learning Games

This component provides interactive learning games powered by AI to help users learn about various AI concepts and applications.

## AI Models

The application now supports two AI models:

1. **Grok AI (Default)** - Uses X.AI's Grok model for faster responses with the power of Elon Musk's AI system.
2. **Vertex AI** - Uses Google's Vertex AI through Firebase Functions for advanced responses.

## Using the AI Model Toggle

A toggle switch has been added next to the difficulty selector in the UI. By default, Grok AI is enabled. You can switch between models at any time:

- **Left Position (Default)**: Grok AI
- **Right Position**: Vertex AI

The model selection affects how responses are generated for both new game sessions and ongoing conversations. Each model has its own strengths and may provide different types of responses.

## Technical Implementation

The integration uses:

- Direct API calls to the X.AI API for Grok
- Firebase Functions for Vertex AI
- Credit system compatible with both models

## API Keys

The application includes the following API key for Grok:
- `xai-U4MUdbjklO1fx8fkxiXxHoVvwRbqwtNPpeMXy1WCFhqMtdMzKwfHDFuvuPF1Y5az9jR6QB23FZuHY3ik`

## Building the Component

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode with watch
npm run dev
```

## Deployment

The component is designed to be deployed as part of the AI Fundamentals application. The bundle file (`my-games-bundle.js`) should be referenced in your HTML file. 