# Ask the Manual - AI-Powered Document Search

A React application demonstrating **Google Gemini's FileSearch API** - an integrated RAG (Retrieval-Augmented Generation) solution that allows users to upload documents and ask questions about their contents with AI-powered semantic search.

<img width="1159" height="972" alt="image" src="https://github.com/user-attachments/assets/9c15daf0-7d95-4339-afa9-c3cc29b6124a" />

## Features

- **Semantic Document Search**: Upload PDFs, text files, and other documents to create searchable knowledge bases
- **AI-Powered Q&A**: Ask questions in natural language and get accurate answers with source citations
- **Source Attribution**: Every answer includes references to the original document sections (grounding chunks)
- **Multi-Document Support**: Upload multiple documents to build comprehensive knowledge stores
- **Example Questions**: Automatically generates relevant sample questions for your documents
- **Modern UI**: Clean, responsive interface built with React 19 and TypeScript

## Technology Stack

- **Frontend**: React 19.2.0 with TypeScript
- **AI/Backend**: Google Gemini API (@google/genai v1.29.0)
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (implied from component structure)

## Project Structure

```
d:\download\ask-the-manual\
├── services/
│   └── geminiService.ts          # Core FileSearch API implementation
├── components/
│   ├── ChatInterface.tsx         # Displays AI responses with source citations
│   ├── WelcomeScreen.tsx         # File upload and API key selection
│   ├── QueryInterface.tsx        # Query input component
│   ├── DocumentList.tsx          # Lists uploaded documents
│   └── RagStoreList.tsx          # Manages RAG stores
├── App.tsx                       # Main application orchestration
├── types.ts                      # TypeScript type definitions
├── vite.config.ts                # Build configuration
└── .env.local                    # Environment variables (API keys)
```

## Run Locally

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **Google Gemini API Key** (get one from [Google AI Studio](https://ai.google.dev/))

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key:**

   **Option 1: Environment Variable (Recommended)**

   Open [.env.local](.env.local) and set your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

   Get your API key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

   **Option 2: Manual Input**

   If you don't set the environment variable, the app will prompt you to enter your API key when you click "Select Gemini API Key to Begin".

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**

   Navigate to `http://localhost:5173` (or the port shown in terminal)

## How It Works

### 1. FileSearch API Architecture

The app uses Google Gemini's FileSearch API, which implements a **RAG (Retrieval-Augmented Generation)** pattern:

```typescript
// Create a document store
const ragStoreName = await geminiService.createRagStore('My Documents');

// Upload documents
await geminiService.uploadToRagStore(ragStoreName, file);

// Search and get AI-generated answers
const result = await geminiService.fileSearch(ragStoreName, 'What is the main topic?');
```

### 2. Core Service Layer

The [services/geminiService.ts](services/geminiService.ts) file provides these key functions:

- **`createRagStore(displayName)`** - Creates a new document store
- **`uploadToRagStore(ragStoreName, file)`** - Uploads documents with async processing
- **`fileSearch(ragStoreName, query)`** - Performs semantic search and generates answers
- **`generateExampleQuestions(ragStoreName)`** - Creates sample questions for documents
- **`deleteRagStore(ragStoreName)`** - Cleans up document stores

### 3. FileSearch as a Tool

FileSearch is implemented as a "tool" passed to the LLM:

```typescript
const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
        tools: [{
            fileSearch: {
                fileSearchStoreNames: [ragStoreName]
            }
        }]
    }
});
```

The model intelligently decides when to use the FileSearch tool and returns:
- **Generated answer text** - Natural language response
- **Grounding chunks** - Source citations from the original documents

### 4. User Workflow

```
1. User uploads document(s)
   ↓
2. App creates RAG store and processes files
   ↓
3. App generates example questions (optional)
   ↓
4. User asks questions
   ↓
5. FileSearch retrieves relevant passages
   ↓
6. AI generates answer with source citations
   ↓
7. UI displays response with clickable source references
```

## Data Types

Key TypeScript interfaces defined in [types.ts](types.ts):

```typescript
interface QueryResult {
    text: string;                          // AI-generated response
    groundingChunks: GroundingChunk[];     // Source citations
}

interface GroundingChunk {
    retrievedContext?: {
        text?: string;                     // Actual text from document
    };
}

interface RagStore {
    name: string;                          // Internal identifier
    displayName: string;                   // User-facing name
}

interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    groundingChunks?: GroundingChunk[];
}
```

## Build for Production

```bash
npm run build
```

The optimized production files will be in the `dist/` directory.

## Key Features Explained

### Source Attribution (Grounding Chunks)

Every AI response includes references to the original document sections:

```typescript
// In ChatInterface.tsx
{message.groundingChunks?.map((chunk, index) => (
    <button onClick={() => showSource(chunk.retrievedContext.text)}>
        Source {index + 1}
    </button>
))}
```

Users can click "Source" buttons to view the exact passages the AI used to generate its answer.

### Async Document Processing

Document uploads are processed asynchronously with polling:

```typescript
let op = await ai.fileSearchStores.uploadToFileSearchStore({...});
while (!op.done) {
    await delay(3000);
    op = await ai.operations.get({ operation: op });
}
```

### Multi-Store Support

The app supports creating and querying multiple independent RAG stores, allowing users to organize documents by topic or project.

## Environment Configuration

The [vite.config.ts](vite.config.ts) file injects environment variables at build time:

```typescript
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        }
    };
});
```

## Troubleshooting

### API Key Issues
- Ensure your `GEMINI_API_KEY` in `.env.local` is valid
- Check that the API key has FileSearch API access enabled

### Upload Failures
- Verify file format is supported (PDF, TXT, DOCX, etc.)
- Check file size limits (varies by API tier)
- Ensure stable internet connection for async processing

### Build Errors
- Clear `node_modules/` and run `npm install` again
- Verify Node.js version is compatible (v18+)

## License

This project is provided as a demonstration of Google Gemini's FileSearch API capabilities.

## Learn More

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [FileSearch API Guide](https://ai.google.dev/docs/file_search)
- [RAG (Retrieval-Augmented Generation) Overview](https://ai.google.dev/docs/rag)

---

Built with Google Gemini FileSearch API
