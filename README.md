# Sample Diagram Generator

Real-time diagram generation through llm assistance on n8n workflow.

Built with: 
- **SvelteKit** for frontend framework.
- **Excalidraw** for interactive diagram editing.
- **TailwindCSS** for styling 
- **n8n** for backend workflow automation.
- **Axios** for HTTP requests.
- **React/ReactDOM** for Excalidraw component integration.
- **OpenAI GPT-4**, **Gemini API** or similar LLM for diagram generation logic.

## Key Capabilities

- **Interactive Excalidraw Canvas** - Full-featured diagram editor 
- **Chat Interface** - Describe your architecture in natural language
- **n8n Integration** - Backend workflow powered by n8n for LLM diagram generation


## Prerequisites

- Node.js 18+ or pnpm
- n8n instance running locally or remotely, source code located at `../backend`

## Getting started 

1. Clone the repository:
   ```bash
   cd gcp-draw-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Backend Setup

### n8n Workflow Configuration

You need to configure one endpoint in your n8n workflow:

**POST endpoint** - `http://localhost:5678/webhook/generate-diagram`
   - Receives: `{ prompt: string, currentScene: object, outputFormat: string  }`
   - Processes the user's prompt and current diagram state
   - Returns the updated diagram synchronously

Note: needs openAI or Gemini API credentials set in n8n for LLM access.

### Expected Response Format

We have two supported output formats: `excalidraw` and `mermaid`. This example uses `excalidraw`.

The webhook should respond with this format:

```json
{
  "update": "scene",
  "data": {
    "elements": [
      {
        "type": "rectangle",
        "text": "Frontend",
        "x": 50,
        "y": 100,
        "width": 120,
        "height": 60
      },
      {
        "type": "rectangle",
        "text": "API",
        "x": 250,
        "y": 100,
        "width": 120,
        "height": 60
      },
      {
        "type": "rectangle",
        "text": "DB",
        "x": 450,
        "y": 100,
        "width": 120,
        "height": 60
      }
    ],
    "appState": {}
  }
}
```

Output format logic set by the frontend in the request body and handled in the n8n workflow.

### How It Works

```markdown
  Initial State: Mermaid Mode
      ↓
  User sends prompt → Backend receives: { prompt: "Design......", outputFormat: "mermaid", currentScene: {empty_object} }
      ↓
  LLM returns Mermaid syntax → Frontend converts to Excalidraw
      ↓
  User manually edits canvas → Auto-switch to Advanced Mode
      ↓
  User sends prompt → Backend receives: { prompt: "Design......", outputFormat: "excalidraw", currentScene: {{ "update": "scene", "data": {..........}}}}
      ↓
  LLM returns Excalidraw JSON → Direct update

```


## Project Structure

```
src/
 ├── routes/
 │   └── +page.svelte          # Main application page
 ├── components/
 │   ├── ExcalidrawCanvas.svelte  # Excalidraw editor wrapper
 │   └── ChatPanel.svelte         # Chat interface for prompts
 ├── lib/
 │   ├── api.ts                # API utilities for HTTP requests
 │   └── stores.ts             # Svelte stores for state management
 └── app.css                   # Global styles 
```


### Example Prompts

- "Create a microservices architecture with API gateway"
- "Draw a three-tier web application with database"
- "Show a serverless architecture on GCP"
- "Add a load balancer to the current diagram"

## Acknowledgments

- [Excalidraw](https://excalidraw.com/) - Amazing diagram tool
- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [n8n](https://n8n.io/) - Backend Workflow

TODO:
- [ ] Would love to experiment SSE streaming updates from n8n to frontend