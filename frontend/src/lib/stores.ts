import { writable } from 'svelte/store';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';

// Store for Excalidraw scene data
// Initialize with empty scene to allow immediate manual editing
export const diagramStore = writable<any>({
	elements: [],
	appState: {}
});

// Store for Excalidraw API reference
export const excalidrawAPI = writable<ExcalidrawImperativeAPI | null>(null);

// Store for the updateFromAI function reference
// This allows ChatPanel to trigger updates without causing drawing conflicts
export const updateCanvasFromAI = writable<((sceneData: any) => void) | null>(null);

// Store for chat messages
export interface ChatMessage {
	sender: 'user' | 'ai';
	content: string;
	timestamp: Date;
}

export const chatMessages = writable<ChatMessage[]>([]);

// Store for loading state
export const isLoading = writable(false);

// Store for tracking user edits
export const hasUserEdits = writable(false);

// Store for diagram mode: 'mermaid' (simple, AI-friendly) or 'excalidraw' (complex, manual edits)
export type DiagramMode = 'mermaid' | 'excalidraw';
export const diagramMode = writable<DiagramMode>('mermaid');

// Function to reset to simple mode (Mermaid)
export function resetToSimpleMode() {
	hasUserEdits.set(false);
	diagramMode.set('mermaid');
}

// Store for chat panel collapsed state
export const isChatCollapsed = writable(false);
