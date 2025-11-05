import axios from 'axios';

const BACKEND_URL = 'http://localhost:5678';

export interface DiagramRequest {
	prompt: string;
	currentScene: any;
	outputFormat: 'mermaid' | 'excalidraw';
}

export interface DiagramResponse {
    format: "mermaid" | "excalidraw";
    update: any
	data: any;
}

/**
 * Send a diagram generation request to the backend and return the response
 * @param request - The diagram generation request containing prompt and current scene
 * @returns The diagram response with updated scene data
 */
export async function generateDiagram(request: DiagramRequest): Promise<DiagramResponse> {
	try {
		const res = await axios.post<DiagramResponse[]>(
			`${BACKEND_URL}/webhook/generate-diagram`,
			request,
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
        return Array.isArray(res.data) ? res.data[0] : res.data;
	} catch (error) {
		console.error('Error sending diagram request:', error);
		throw error;
	}
}