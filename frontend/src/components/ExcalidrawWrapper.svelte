<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';

	// Import Excalidraw styles
	import '@excalidraw/excalidraw/index.css';

	// Props
	export let initialData: any = undefined;
	export let onChange: (elements: any[], appState: any) => void = () => {};
	export let onAPIReady: (api: ExcalidrawImperativeAPI) => void = () => {};

	let container: HTMLDivElement;
	let reactRoot: any = null;
	let excalidrawAPI: ExcalidrawImperativeAPI | null = null;

	onMount(async () => {
		if (typeof window === 'undefined') return;

		try {
			const React = await import('react');
			const { createRoot } = await import('react-dom/client');
			const { Excalidraw } = await import('@excalidraw/excalidraw');

			reactRoot = createRoot(container);

			// Create Excalidraw React element with excalidrawAPI callback
			const excalidrawElement = React.createElement(Excalidraw, {
				initialData: initialData || { elements: [], appState: {} },
				onChange: (elements: any[], appState: any) => {
					onChange(elements, appState);
				},
				excalidrawAPI: (api: ExcalidrawImperativeAPI) => {
					console.log('[ExcalidrawWrapper] excalidrawAPI callback called, api:', api);
					if (api) {
						console.log('[ExcalidrawWrapper] API received successfully');
						excalidrawAPI = api;
						onAPIReady(api);
					}
				}
			});

			// Render the React component
			reactRoot.render(excalidrawElement);
		} catch (error) {
			console.error('Failed to initialize Excalidraw:', error);
		}
	});

	onDestroy(() => {
		if (reactRoot) {
			reactRoot.unmount();
		}
	});

	// Expose API for external updates
	export function updateScene(sceneData: any) {
		if (excalidrawAPI) {
			excalidrawAPI.updateScene(sceneData);
		}
	}
</script>

<div bind:this={container} class="excalidraw-container"></div>

<style>
	.excalidraw-container {
		width: 100%;
		height: 100%;
		position: relative;
	}

	:global(.excalidraw) {
		height: 100% !important;
		width: 100% !important;
	}

	:global(.excalidraw .App-menu_top) {
		background: transparent !important;
	}
</style>
