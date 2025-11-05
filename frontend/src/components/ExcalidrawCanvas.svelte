<script lang="ts">
	import { diagramStore, updateCanvasFromAI, hasUserEdits, diagramMode, resetToSimpleMode } from '$lib/stores';
	import ExcalidrawWrapper from './ExcalidrawWrapper.svelte';
	import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
	import { onDestroy } from 'svelte';
	import { normalizeExcalidrawScene } from '$lib/excalidrawNormalizer';

	let excalidrawAPI: ExcalidrawImperativeAPI | null = null;
	let isUpdatingFromAI = false;
	let wrapperComponent: any;
	let previousElementsLength = 0;
	let previousElementsHash = '';

	/**
	 * Create a simple hash of elements to detect changes
	 */
	function hashElements(elements: any[]): string {
		if (!elements || elements.length === 0) return '';

		// Create a hash based on element count, types, positions, and text
		return elements
			.map(el => `${el.type}:${el.x}:${el.y}:${el.width}:${el.height}:${el.text || ''}`)
			.join('|');
	}

	/**
	 * Handle user edits to the diagram
	 * Updates the store so AI has the latest context
	 * Detects meaningful edits and switches to Excalidraw mode if needed
	 */
	function handleChange(elements: any[], appState: any) {
		// Don't update store if we're in the middle of applying an AI update
		if (isUpdatingFromAI) return;

		diagramStore.set({
			elements,
			appState
		});

		// Check if canvas is empty - if so, reset to simple mode (Option C)
		if (elements.length === 0) {
			console.log('[ExcalidrawCanvas] Canvas cleared, resetting to simple mode');
			resetToSimpleMode();
			previousElementsLength = 0;
			previousElementsHash = '';
			return;
		}

		// Detect user edits
		const currentHash = hashElements(elements);
		const lengthChanged = elements.length !== previousElementsLength;
		const contentChanged = currentHash !== previousElementsHash;

		if ((lengthChanged || contentChanged) && previousElementsHash !== '') {
			console.log('[ExcalidrawCanvas] User edit detected, switching to Excalidraw mode');
			hasUserEdits.set(true);
			diagramMode.set('excalidraw');
		}

		// Update tracking variables
		previousElementsLength = elements.length;
		previousElementsHash = currentHash;
	}

	/**
	 * Handle API initialization
	 */
	function handleAPIReady(api: ExcalidrawImperativeAPI) {
		excalidrawAPI = api;
		updateCanvasFromAI.set(updateFromAI);
	}

	/**
	 * Update scene from AI response
	 * Called explicitly when AI generates new diagram
	 */
	function updateFromAI(sceneData: any) {
		console.log('[ExcalidrawCanvas] updateFromAI called with:', sceneData);
		console.log('[ExcalidrawCanvas] API ready:', !!excalidrawAPI);
		console.log('[ExcalidrawCanvas] API object:', excalidrawAPI);
		console.log('[ExcalidrawCanvas] sceneData.elements length:', sceneData.elements?.length);

		if (!excalidrawAPI) {
			console.warn('[ExcalidrawCanvas] Excalidraw API not ready, retrying in 500ms...');
			// Retry after a delay if API isn't ready yet
			setTimeout(() => {
				if (excalidrawAPI) {
					updateFromAI(sceneData);
				} else {
					console.error('[ExcalidrawCanvas] Excalidraw API still not ready after retry');
				}
			}, 500);
			return;
		}

		isUpdatingFromAI = true;
		let normalizedScene: any = null;

		try {
			console.log('[ExcalidrawCanvas] Raw AI data:', sceneData);
			console.log('[ExcalidrawCanvas] Raw elements count:', sceneData.elements?.length);
			console.log('[ExcalidrawCanvas] First raw element:', sceneData.elements?.[0]);

			normalizedScene = normalizeExcalidrawScene(sceneData);

			console.log('[ExcalidrawCanvas] Normalized scene:', normalizedScene);
			console.log('[ExcalidrawCanvas] Normalized elements count:', normalizedScene.elements?.length);
			console.log('[ExcalidrawCanvas] Normalized first element:', JSON.stringify(normalizedScene.elements?.[0], null, 2));

			// Check for text elements specifically
			const textElements = normalizedScene.elements?.filter(el => el.type === 'text' || el.text);
			console.log('[ExcalidrawCanvas] Text elements found:', textElements?.length);
			if (textElements?.length > 0) {
				console.log('[ExcalidrawCanvas] First text element:', textElements[0]);
			}

			// Update the scene with normalized data
			excalidrawAPI.updateScene(normalizedScene);

			// Also update the store so manual edits have the latest AI data
			diagramStore.set(normalizedScene);

			console.log('[ExcalidrawCanvas] Scene updated successfully');

			// Try to scroll to content to make sure it's visible
			setTimeout(() => {
				try {
					if (excalidrawAPI && normalizedScene) {
						excalidrawAPI.scrollToContent(normalizedScene.elements, {
							fitToViewport: true
						});
						console.log('[ExcalidrawCanvas] Scrolled to content');
					}
				} catch (scrollError) {
					console.warn('[ExcalidrawCanvas] Could not scroll to content:', scrollError);
				}
			}, 100);
		} catch (error) {
			console.error('[ExcalidrawCanvas] Error updating scene from AI:', error);
		} finally {
			setTimeout(() => {
				isUpdatingFromAI = false;
				// Update tracking to prevent false edit detection after AI update
				if (normalizedScene) {
					previousElementsLength = normalizedScene.elements?.length || 0;
					previousElementsHash = hashElements(normalizedScene.elements || []);
				}
			}, 100);
		}
	}

	onDestroy(() => {
		updateCanvasFromAI.set(null);
	});
</script>

<div
	class="excalidraw-wrapper backdrop-blur-lg bg-white/5 border border-white/20 rounded-2xl shadow-lg shadow-white/10 overflow-hidden"
>
	<ExcalidrawWrapper
		bind:this={wrapperComponent}
		initialData={$diagramStore}
		onChange={handleChange}
		onAPIReady={handleAPIReady}
	/>
</div>

<style>
	.excalidraw-wrapper {
		height: 100%;
		width: 100%;
		position: relative;
	}
</style>