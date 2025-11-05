<script lang="ts">
	import { Button } from "$src/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import MessageSquare from "@lucide/svelte/icons/message-square";

	import type { ComponentProps } from "svelte";
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	}: ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const sidebar = useSidebar();
</script>

<Button
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	variant="ghost"
	size="icon"
	class={cn("size-7", className)}
	type="button"
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	{...restProps}
>
	<MessageSquare />
	<span class="sr-only">Toggle Chat</span>
</Button>
