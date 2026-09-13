<template>
	<RouterLink
		v-if="typeof to === 'string' && !disabled"
		:to="to"
		v-bind="$attrs"
		:active-class="isSubpage ? '' : undefined"
		:class="{
			'router-link-active': isPrimary && isPrimary(route),
			'subpage-active': isSubpage && isSubpage(route),
		}"
		class="w-12 h-12 text-primary rounded-full flex items-center justify-center text-2xl transition-all bg-transparent hover:bg-button-bg hover:text-contrast"
	>
		<slot />
	</RouterLink>
	<button
		v-else-if="typeof to === 'string'"
		v-bind="$attrs"
		type="button"
		aria-disabled="true"
		tabindex="-1"
		:class="{
			'router-link-active': isPrimary && isPrimary(route),
			'subpage-active': isSubpage && isSubpage(route),
		}"
		class="w-12 h-12 text-primary rounded-full flex items-center justify-center text-2xl transition-all bg-transparent hover:bg-button-bg hover:text-contrast"
		@click.prevent
		@keydown.enter.prevent
		@keyup.enter.prevent
		@keydown.space.prevent
		@keyup.space.prevent
	>
		<slot />
	</button>
	<button
		v-else
		v-bind="$attrs"
		class="button-animation border-none text-primary cursor-pointer w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all bg-transparent hover:bg-button-bg hover:text-contrast"
		:disabled="disabled"
		@click="to"
	>
		<slot />
	</button>
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

type RouteFunction = (route: RouteLocationNormalizedLoaded) => boolean

withDefaults(
	defineProps<{
		to: (() => void) | string
		isPrimary?: RouteFunction
		isSubpage?: RouteFunction
		highlightOverride?: boolean
		disabled?: boolean
	}>(),
	{
		disabled: false,
		isPrimary: undefined,
		isSubpage: undefined,
	},
)

defineOptions({
	inheritAttrs: false,
})
</script>

<style lang="scss" scoped>
/* box-shadow (not filter: drop-shadow) so active state does not force a
   costly compositing layer / re-raster on every left-nav switch. */
.router-link-active,
.subpage-active {
	box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.55);
}

.router-link-active {
	@apply text-[--color-button-text-selected] bg-[--color-button-bg-selected];
}

.subpage-active {
	@apply text-contrast bg-button-bg;
}
</style>
