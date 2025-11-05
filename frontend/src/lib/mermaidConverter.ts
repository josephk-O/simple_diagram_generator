/**
 * Utility to convert Mermaid diagram syntax to Excalidraw scene data
 */

import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';

export interface MermaidConversionResult {
	elements: any[];
	files: any[] | null;
}

/**
 * Convert Mermaid syntax string to Excalidraw scene data
 * @param mermaidSyntax - The Mermaid diagram syntax
 * @returns Excalidraw scene data with elements
 */
export async function convertMermaidToExcalidraw(
	mermaidSyntax: string
): Promise<MermaidConversionResult> {
	try {
		console.log('[MermaidConverter] Converting Mermaid to Excalidraw:', mermaidSyntax);

		// Use the Excalidraw library to parse Mermaid
        const { elements, files } = await parseMermaidToExcalidraw(mermaidSyntax, {
			fontSize: 20
		});

		console.log('[MermaidConverter] Conversion successful, elements:', elements.length);

		// Debug: Check text elements
		const textElements = elements.filter(el => el.type === 'text');
		console.log('[MermaidConverter] Text elements count:', textElements.length);
		if (textElements.length > 0) {
			console.log('[MermaidConverter] Sample text element:', textElements[0]);
		}

		// Debug: Check all element types
		const elementTypes = elements.reduce((acc, el) => {
			acc[el.type] = (acc[el.type] || 0) + 1;
			return acc;
		}, {});
		console.log('[MermaidConverter] Element types breakdown:', elementTypes);

		return {
			elements,
			files: files || null
		};
	} catch (error) {
		console.error('[MermaidConverter] Error converting Mermaid:', error);
		throw new Error(`Failed to convert Mermaid diagram: ${error}`);
	}
}

/**
 * Extract Mermaid syntax from various response formats
 * Handles cases where Mermaid might be wrapped in code blocks or other formatting
 */
export function extractMermaidSyntax(response: string): string {
	// Remove Markdown code block if present
	let cleaned = response.trim();

	// Remove ```mermaid and ``` wrapper
	cleaned = cleaned.replace(/^```mermaid\s*\n?/i, '').replace(/\n?```\s*$/, '');

	// Also try removing just ``` wrapper
	cleaned = cleaned.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');

	return cleaned.trim();
}

/**
 * Sanitize Mermaid syntax to handle special characters in labels
 * Wraps node labels containing special characters in quotes
 */
export function sanitizeMermaidSyntax(mermaidSyntax: string): string {
	// Split into lines
	const lines = mermaidSyntax.split('\n');

	const sanitizedLines = lines.map(line => {
		// Skip graph definition lines and empty lines
		if (line.trim().startsWith('graph') ||
			line.trim().startsWith('flowchart') ||
			line.trim() === '') {
			return line;
		}

		// Replace node labels that contain special characters with quoted versions
		let sanitized = line;

		sanitized = sanitized.replace(
			/(\w+)\[([^\]]*[()/\\:.,;!?@#$%^&*][^\]]*)\]/g,
			(match, nodeId, label) => {
				// If already quoted, leave it
				if (label.startsWith('"') && label.endsWith('"')) {
					return match;
				}
				// Escape quotes in the label
				const escapedLabel = label.replace(/"/g, '\\"');
				return `${nodeId}["${escapedLabel}"]`;
			}
		);

		// Handle database/cylinder nodes: NodeID[(Label)]
		sanitized = sanitized.replace(
			/(\w+)\[\(([^)]*[()/\\:.,;!?@#$%^&*][^)]*)\)\]/g,
			(match, nodeId, label) => {
				// If already quoted, leave it
				if (label.startsWith('"') && label.endsWith('"')) {
					return match;
				}
				// Escape quotes in the label
				const escapedLabel = label.replace(/"/g, '\\"');
				return `${nodeId}[("${escapedLabel}")]`;
			}
		);

		// Handle edge labels: -->|Label Text|
		sanitized = sanitized.replace(
			/-->\|([^|]*[()/\\:.,;!?@#$%^&*][^|]*)\|/g,
			(match, label) => {
				// If already quoted, leave it
				if (label.startsWith('"') && label.endsWith('"')) {
					return match;
				}
				// Escape quotes in the label
				const escapedLabel = label.replace(/"/g, '\\"');
				return `-->|"${escapedLabel}"|`;
			}
		);

		return sanitized;
	});

	return sanitizedLines.join('\n');
}