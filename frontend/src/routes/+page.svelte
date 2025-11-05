<script lang="ts">
    import ExcalidrawCanvas from '$components/ExcalidrawCanvas.svelte';
    import ChatPanel from '$components/ChatPanel.svelte';
    import {isChatCollapsed} from '$lib/stores';
    import {Separator} from "$src/components/ui/separator/index.js";
    import * as Sidebar from "$src/components/ui/sidebar/index.js";
</script>

<svelte:head>
    <title>GCP Architecture Diagram Generator</title>
    <meta name="description" content="AI-powered GCP architecture diagram generator"/>
</svelte:head>

<Sidebar.Provider>
    <div class="app-container">
        <main class="main-content">
            <header class="header-section text-center mb-4">
                <h1 class="text-xl font-light text-white/90 mb-2">
                    Simple Diagram Generator
                </h1>
                <div class="inline-block backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                    <p class="text-xs text-white/70">
                        <span class="text-[#00AEEF]">✨ Tip:</span> Start drawing your architecture manually or ask
                        AI for help!
                    </p>
                </div>
            </header>

            <section class="canvas-section">
                <ExcalidrawCanvas/>
            </section>
        </main>

        <!-- Trigger button positioned halfway on the bottom sidebar -->
        <div class="sidebar-trigger-wrapper">
            <Sidebar.Trigger class="bottom-trigger" />
        </div>

        <!-- ChatPanel at the bottom -->
        <ChatPanel/>
    </div>
</Sidebar.Provider>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI',
        system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow: hidden; /* Prevent body scrolling */
    }

    .app-container {
        background: linear-gradient(
                135deg,
                rgba(0, 10, 30, 1) 0%,
                rgba(15, 30, 60, 1) 50%,
                rgba(25, 40, 70, 1) 100%
        );
        background-attachment: fixed;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    .main-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        padding-bottom: 0;
    }

    :global(*) {
        box-sizing: border-box;
    }

    header h1 {
        letter-spacing: -0.02em;
    }

    .header-section {
        flex-shrink: 0;
    }

    .canvas-section {
        flex: 1;
        overflow: hidden;
        animation: slideInUp 0.5s ease-out;
    }

    /* Position sidebar trigger halfway on the bottom sidebar */
    .sidebar-trigger-wrapper {
        position: fixed;
        bottom: 280px; /* Adjust based on sidebar height when expanded */
        right: 2rem;
        z-index: 100;
        transition: bottom 0.3s ease;
    }

    /* Adjust trigger position when sidebar is collapsed */
    :global(.group[data-state="collapsed"]) ~ .sidebar-trigger-wrapper {
        bottom: 40px; /* Adjust for collapsed height */
    }

    :global(.bottom-trigger) {
        backdrop-filter: blur(12px);
        background: linear-gradient(145deg, rgba(0, 174, 239, 0.3), rgba(0, 174, 239, 0.2)) !important;
        border: 1px solid rgba(0, 174, 239, 0.4) !important;
        box-shadow: 0 4px 16px rgba(0, 174, 239, 0.3);
        color: white !important;
        width: 48px !important;
        height: 48px !important;
        border-radius: 50% !important;
        transition: all 0.3s ease;
    }

    :global(.bottom-trigger:hover) {
        background: linear-gradient(145deg, rgba(0, 174, 239, 0.5), rgba(0, 174, 239, 0.3)) !important;
        box-shadow: 0 6px 20px rgba(0, 174, 239, 0.4);
        transform: translateY(-2px);
    }

    /* Override sidebar positioning to bottom */
    :global(.group.peer[data-side="left"]) {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        top: auto !important;
        width: 70% !important;
        height: auto !important;
        max-height: 60vh !important;
    }

    :global([data-slot="sidebar-container"]) {
        position: fixed !important;
        bottom: 0 !important;
        left: 15% !important;
        top: auto !important;
        width: 70% !important;
        height: auto !important;
        max-height: 60vh !important;
        border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-left: none !important;
        border-right: none !important;
        border-bottom: none !important;
        border-radius: 1.5rem 1.5rem 0 0 !important;
    }

    :global([data-slot="sidebar-gap"]) {
        display: none !important;
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
