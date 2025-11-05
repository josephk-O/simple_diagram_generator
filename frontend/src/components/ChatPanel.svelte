<script lang="ts">
    import * as Sidebar from "$src/components/ui/sidebar/index.js";
    import {
        chatMessages,
        isLoading,
        diagramStore,
        updateCanvasFromAI,
        diagramMode,
        hasUserEdits,
        resetToSimpleMode,
        isChatCollapsed
    } from '$lib/stores';
    import {generateDiagram} from '$lib/api';
    import {convertMermaidToExcalidraw, extractMermaidSyntax, sanitizeMermaidSyntax} from '$lib/mermaidConverter';
    import {onMount} from 'svelte';
    import { ArrowUpRight } from '@lucide/svelte';

    let messageInput = '';
    let chatContainer: HTMLDivElement;

    /**
     * Send a message to the backend
     */
    async function sendMessage() {
        if (!messageInput.trim() || $isLoading) return;

        const userMessage = messageInput.trim();
        messageInput = '';

        chatMessages.update((messages) => [
            ...messages,
            {
                sender: 'user',
                content: userMessage,
                timestamp: new Date()
            }
        ]);

        setTimeout(scrollToBottom, 100);

        let currentScene = $diagramStore;

        const outputFormat = $diagramMode;

        if (outputFormat === 'mermaid' && !$hasUserEdits) {
            currentScene = {elements: [], appState: {}};
            console.log('[ChatPanel] Mermaid mode with no edits - sending empty scene');
        }

        console.log('[ChatPanel] Sending request with outputFormat:', outputFormat);
        console.log('[ChatPanel] hasUserEdits:', $hasUserEdits);

        isLoading.set(true);

        chatMessages.update((messages) => [
            ...messages,
            {
                sender: 'ai',
                content: 'Generating diagram...',
                timestamp: new Date()
            }
        ]);

        setTimeout(scrollToBottom, 100);

        try {
            const response = await generateDiagram({
                prompt: userMessage,
                currentScene: currentScene,
                outputFormat: outputFormat
            });
            console.log('[ChatPanel] Response:', response);
            console.log('[ChatPanel] response.update:', response.update);
            console.log('[ChatPanel] response.data:', response.data);

            if (response.update === 'scene' && response.data) {
                const updateFunc = $updateCanvasFromAI;

                if (!updateFunc) {
                    console.warn('[ChatPanel] Canvas update function not available');
                    throw new Error('Canvas not ready');
                }


                const responseFormat = response.format || outputFormat;

                if (responseFormat === 'mermaid') {
                    console.log('[ChatPanel] Converting Mermaid to Excalidraw');

                    // Extract Mermaid syntax (in case it's wrapped in code blocks)
                    let mermaidSyntax = extractMermaidSyntax(response.data);
                    console.log('[ChatPanel] Raw Mermaid syntax:', mermaidSyntax);

                    // Sanitize to handle special characters (parentheses, etc.)
                    mermaidSyntax = sanitizeMermaidSyntax(mermaidSyntax);
                    console.log('[ChatPanel] Sanitized Mermaid syntax:', mermaidSyntax);

                    const {elements, files} = await convertMermaidToExcalidraw(mermaidSyntax);
                    console.log('[ChatPanel] Converted elements count:', elements.length);
                    console.log('[ChatPanel] First 3 elements:', elements.slice(0, 3).map(el => ({
                        type: el.type,
                        text: el.text,
                        width: el.width,
                        height: el.height
                    })));

                    updateFunc({
                        elements,
                        appState: {},
                        files
                    });
                } else {
                    console.log('[ChatPanel] Using Excalidraw JSON directly');
                    updateFunc(response.data);
                }

                chatMessages.update((messages) => {
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage && lastMessage.sender === 'ai') {
                        lastMessage.content = 'Diagram updated successfully!';
                    }
                    return messages;
                });
            } else {
                console.log('[ChatPanel] Condition not met for scene update');
                chatMessages.update((messages) => {
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage && lastMessage.sender === 'ai') {
                        lastMessage.content = 'Request processed.';
                    }
                    return messages;
                });
            }

            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error sending message:', error);

            chatMessages.update((messages) => {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.sender === 'ai') {
                    lastMessage.content = `Sorry, there was an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
                return messages;
            });
        } finally {
            isLoading.set(false);
        }
    }

    /**
     * Reset to simple mode (Mermaid)
     */
    function handleResetMode() {
        resetToSimpleMode();
        console.log('[ChatPanel] Reset to Simple Mode');
    }

    /**
     * Handle Enter key press
     */
    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    /**
     * Scroll chat to bottom
     */
    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    /**
     * Format timestamp for display
     */
    function formatTime(date: Date): string {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    onMount(() => {
        scrollToBottom();
    });

    export let ref: HTMLElement | null = null;
    export let collapsible: "icon" | "full" = "icon";


</script>


    <Sidebar.Root {collapsible} side="left" variant="floating">
        <Sidebar.Header class="glass-header">
            <div class="mode-indicator-container flex items-center mb-2">
                <div class="flex flex-row justify-between items-center gap-3 flex-1">
                    <div
                            class="mode-badge backdrop-blur-md border rounded-lg px-3 py-1 text-xs font-medium transition-all {$diagramMode === 'mermaid'
					? 'bg-green-500/20 border-green-500/40 text-green-700'
					: 'bg-purple-500/20 border-purple-500/40 text-purple-700'}"
                    >
                        {#if $diagramMode === 'mermaid'}
                            ✨ Simple Mode
                        {:else}
                            🎨 Advanced Mode
                        {/if}
                    </div>

                    <span class="text-xs text-gray-600">
				{#if $diagramMode === 'mermaid'}
					AI generates Mermaid diagrams
				{:else}
					AI modifies your custom design
				{/if}
			</span>
                </div>

                {#if $hasUserEdits}
                    <button
                            on:click={handleResetMode}
                            class="reset-button backdrop-blur-md bg-gray-200 hover:bg-gray-300 border border-gray-300 hover:border-gray-400 rounded-lg px-3 py-1 text-xs text-gray-700 hover:text-gray-900 transition-all ml-2"
                    >
                        ↻ Reset to Simple Mode
                    </button>
                {/if}
            </div>
        </Sidebar.Header>
        <Sidebar.Content>
            <div class="chat-messages mb-2 space-y-4" bind:this={chatContainer}>
                {#each $chatMessages as message (message.timestamp)}
                    <div
                            class="message fade-in {message.sender === 'user' ? 'user-message' : 'ai-message'}"
                    >
                        <div class="message-header mb-1">
					<span class="text-xs text-gray-700 font-medium">
						{message.sender === 'user' ? 'You' : 'AI Assistant'}
					</span>
                            <span class="text-xs text-gray-500 ml-2">
						{formatTime(message.timestamp)}
					</span>
                        </div>
                        <div
                                class="message-content backdrop-blur-md {message.sender === 'user'
						? 'bg-[#00AEEF]/20 border-[#00AEEF]/40'
						: 'bg-gray-100/80 border-gray-300'} border rounded-xl px-4 py-3"
                        >
                            <p class="text-sm text-gray-900 leading-relaxed">{message.content}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </Sidebar.Content>
        <Sidebar.Footer>
                <div class="flex items-end gap-3 backdrop-blur-md bg-gray-100 border border-gray-300 rounded-xl p-3"
                >
			<textarea
                    bind:value={messageInput}
                    on:keypress={handleKeyPress}
                    placeholder="Visualize a machine learning workflow showing data collection, preprocessing, model training, evaluation, and deployment...."
                    class="flex-1 bg-transparent text-gray-900 placeholder-gray-500 resize-none focus:outline-none rounded-xl border-slate-300 text-xs"
                    disabled={$isLoading}

            ></textarea>
                    <button
                            on:click={sendMessage}
                            disabled={$isLoading || !messageInput.trim()}
                            aria-label="Send message"
                            class="send-button backdrop-blur-md bg-[#00AEEF]/30 hover:bg-[#00AEEF]/50 disabled:bg-gray-200 disabled:cursor-not-allowed border border-[#00AEEF]/40 disabled:border-gray-300 rounded-lg p-1/2 transition-all duration-200"
                    >
                        {#if $isLoading}
                            <svg
                                    class="h-5 w-5 text-white animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                            >
                                <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                ></circle>
                                <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        {:else}
                            <ArrowUpRight />
                        {/if}
                    </button>
                </div>
        </Sidebar.Footer>
</Sidebar.Root>


<style>
    /* Glass header styling */
    :global([data-sidebar="header"].glass-header) {
        backdrop-filter: blur(12px);
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Apply glass effect to sidebar inner container */
    :global([data-sidebar="sidebar"]) {
        backdrop-filter: blur(24px);
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1)) !important;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }

    /* Floating variant glass effect */
    :global([data-sidebar="sidebar"][data-variant="floating"]) {
        border-radius: 1rem;
    }

    /* Hide content when sidebar is collapsed in icon mode */
    :global(.group[data-state="collapsed"][data-collapsible="icon"]) :global([data-sidebar="header"]),
    :global(.group[data-state="collapsed"][data-collapsible="icon"]) :global([data-sidebar="content"]),
    :global(.group[data-state="collapsed"][data-collapsible="icon"]) :global([data-sidebar="footer"]) {
        opacity: 0;
        pointer-events: none;
        overflow: hidden;
    }

    /* Only show icon-sized content when collapsed */
    :global(.group[data-state="collapsed"][data-collapsible="icon"]) :global([data-sidebar="header"]) > *,
    :global(.group[data-state="collapsed"][data-collapsible="icon"]) :global([data-sidebar="content"]) > *,
    :global(.group[data-state="collapsed"][data-collapsible="icon"]) :global([data-sidebar="footer"]) > * {
        display: none;
    }

    .chat-panel.collapsed {
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toggle-button {
        padding: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toggle-button.expanded-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        z-index: 10;
    }

    .toggle-button.collapsed-button {
        /* Centered in collapsed state */
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: rgba(15, 30, 60, 0.3) transparent;
        padding: 0 0.5rem;
        max-height: 200px;
    }

    .chat-messages::-webkit-scrollbar {
        width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
        background: transparent;
    }

    .chat-messages::-webkit-scrollbar-thumb {
        background: rgba(15, 30, 60, 0.3);
        border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
        background: rgba(15, 30, 60, 0.5);
    }

    .bg-glass {
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.15));
    }

    .fade-in {
        animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .message {
        max-width: 100%;
    }

    .user-message {
        margin-left: auto;
    }

    .ai-message {
        margin-right: auto;
    }

    textarea {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }

    .send-button {
        flex-shrink: 0;
    }
</style>