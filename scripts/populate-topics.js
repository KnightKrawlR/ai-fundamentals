const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const topics = [
  {
    "id": "introduction-to-ai",
    "name": "Introduction to AI",
    "description": "Learn the fundamentals of artificial intelligence and how it's changing our world.",
    "icon": "brain",
    "difficulty": 1,
    "terms": [
      {
        "term": "ChatGPT",
        "definition": "An AI language model developed by OpenAI that can generate human-like text based on prompts.",
        "examples": ["Writing emails", "Answering questions", "Creating content"]
      },
      {
        "term": "Machine Learning",
        "definition": "A subset of AI that enables systems to learn and improve from experience without being explicitly programmed.",
        "examples": ["Image recognition", "Recommendation systems", "Fraud detection"]
      },
      {
        "term": "Neural Network",
        "definition": "A computing system inspired by the human brain that can learn to perform tasks by analyzing training examples.",
        "examples": ["Deep learning", "Pattern recognition", "Natural language processing"]
      },
      // ... more terms for introduction-to-ai
    ]
  },
  {
    "id": "office-productivity",
    "name": "Office Productivity",
    "description": "Enhance your workplace efficiency with AI-powered tools and techniques.",
    "icon": "briefcase",
    "difficulty": 2,
    "terms": [
      {
        "term": "Microsoft Copilot",
        "definition": "An AI assistant integrated into Microsoft Office applications to help with content creation and editing.",
        "examples": ["Document drafting", "Email composition", "Presentation creation"]
      },
      {
        "term": "AI-Enhanced Spreadsheets",
        "definition": "Spreadsheet applications that use AI to automate data analysis and visualization.",
        "examples": ["Excel with Copilot", "Google Sheets Smart Fill", "Automated forecasting"]
      },
      // ... more terms for office-productivity
    ]
  },
  {
    "id": "personal-finance",
    "name": "Personal Finance",
    "description": "Learn how AI can help you manage your finances, investments, and financial planning.",
    "icon": "money-bill-wave",
    "difficulty": 2,
    "terms": [
      {
        "term": "AI Financial Advisors",
        "definition": "AI-powered platforms that provide personalized financial advice and investment recommendations.",
        "examples": ["Robo-advisors", "Financial planning apps", "Investment recommendation engines"]
      },
      // ... more terms for personal-finance
    ]
  },
  {
    "id": "social-media-marketing",
    "name": "Social Media Marketing",
    "description": "Leverage AI to enhance your social media presence and marketing strategies.",
    "icon": "hashtag",
    "difficulty": 2,
    "terms": [
      {
        "term": "Content Generation",
        "definition": "AI tools that create or assist in creating social media content.",
        "examples": ["Caption generators", "Post ideas", "Visual content creation"]
      },
      // ... more terms for social-media-marketing
    ]
  },
  {
    "id": "videography",
    "name": "Videography",
    "description": "Discover how AI is transforming video creation, editing, and production.",
    "icon": "video",
    "difficulty": 3,
    "terms": [
      {
        "term": "AI Video Editing",
        "definition": "Software that uses AI to automate and enhance video editing processes.",
        "examples": ["Auto-cutting", "Scene detection", "Content-aware editing"]
      },
      // ... more terms for videography
    ]
  },
  {
    "id": "ecommerce",
    "name": "eCommerce",
    "description": "Learn how AI is revolutionizing online retail and eCommerce businesses.",
    "icon": "shopping-cart",
    "difficulty": 2,
    "terms": [
      {
        "term": "Product Recommendations",
        "definition": "AI systems that suggest relevant products to customers based on their behavior and preferences.",
        "examples": ["Personalized suggestions", "Cross-selling", "Upselling"]
      },
      // ... more terms for ecommerce
    ]
  }
];

async function populateTopics() {
  try {
    for (const topic of topics) {
      const { id, ...topicData } = topic;
      await db.collection('topics').doc(id).set(topicData);
      console.log(`Successfully added topic: ${topic.name}`);
    }
    console.log('All topics have been added to Firestore');
    process.exit(0);
  } catch (error) {
    console.error('Error adding topics:', error);
    process.exit(1);
  }
}

populateTopics(); 