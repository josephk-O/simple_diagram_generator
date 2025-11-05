/**
 * Normalize AI-generated Excalidraw elements to include all required properties
 */

export function normalizeExcalidrawElements(elements: any[]): any[] {
	return elements.map((element) => {
		const timestamp = Date.now();

		// Base properties required for all elements
		const normalized: any = {
			id: element.id || generateId(),
			type: element.type || 'rectangle',
			x: element.x ?? 0,
			y: element.y ?? 0,
			width: element.width ?? 100,
			height: element.height ?? 100,
			angle: element.angle ?? 0,
			strokeColor: element.strokeColor || '#1e1e1e',
			backgroundColor: element.backgroundColor || 'transparent',
			fillStyle: element.fillStyle || 'solid',
			strokeWidth: element.strokeWidth ?? 2,
			strokeStyle: element.strokeStyle || 'solid',
			roughness: element.roughness ?? 1,
			opacity: element.opacity ?? 100,
			groupIds: element.groupIds || [],
			frameId: element.frameId || null,
			roundness: element.roundness || (element.type === 'rectangle' ? { type: 3 } : null),
			seed: element.seed ?? Math.floor(Math.random() * 2147483647),
			version: element.version ?? 1,
			versionNonce: element.versionNonce ?? Math.floor(Math.random() * 2147483647),
			isDeleted: element.isDeleted ?? false,
			boundElements: element.boundElements || null,
			updated: element.updated ?? timestamp,
			link: element.link || null,
			locked: element.locked ?? false
		};

		// Type-specific properties
		if (element.type === 'text' || element.text) {
			normalized.type = 'text';
			normalized.text = element.text || '';
			normalized.fontSize = element.fontSize ?? 20;
			normalized.fontFamily = element.fontFamily ?? 1;
			normalized.textAlign = element.textAlign || 'center';
			normalized.verticalAlign = element.verticalAlign || 'middle';
			normalized.baseline = element.baseline ?? normalized.fontSize;
			normalized.containerId = element.containerId || null;
			normalized.originalText = element.originalText || element.text || '';
			normalized.lineHeight = element.lineHeight ?? 1.25;

			// Debug log for text elements
			if (normalized.text) {
				console.log('[Normalizer] Text element:', {
					id: normalized.id,
					text: normalized.text,
					fontSize: normalized.fontSize,
					x: normalized.x,
					y: normalized.y,
					width: normalized.width,
					height: normalized.height,
					opacity: normalized.opacity
				});
			}
		}

		if (element.type === 'arrow' || element.type === 'line') {
			normalized.points = element.points || [[0, 0], [normalized.width, normalized.height]];
			normalized.lastCommittedPoint = element.lastCommittedPoint || null;
			normalized.startBinding = element.startBinding || null;
			normalized.endBinding = element.endBinding || null;
			normalized.startArrowhead = element.startArrowhead || null;
			normalized.endArrowhead = element.endArrowhead || (element.type === 'arrow' ? 'arrow' : null);
		}

		if (element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond') {
			// These are already covered by base properties
		}

		return normalized;
	});
}

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function normalizeExcalidrawScene(scene: any): any {
	if (!scene) {
		return {
			elements: [],
			appState: {}
		};
	}

	return {
		elements: normalizeExcalidrawElements(scene.elements || []),
		appState: scene.appState || {
			viewBackgroundColor: '#ffffff',
			currentItemStrokeColor: '#1e1e1e',
			currentItemBackgroundColor: 'transparent',
			currentItemFillStyle: 'solid',
			currentItemStrokeWidth: 2,
			currentItemStrokeStyle: 'solid',
			currentItemRoughness: 1,
			currentItemOpacity: 100,
			currentItemFontFamily: 1,
			currentItemFontSize: 20,
			currentItemTextAlign: 'left',
			currentItemStartArrowhead: null,
			currentItemEndArrowhead: 'arrow'
		}
	};
}