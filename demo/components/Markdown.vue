<script setup lang="ts">
const props = defineProps({
    value: {
        type: String,
        required: true,
    },
    condensed: Boolean,
});

import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

const html = computed(() =>
    micromark(`${props.value}`, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()],
    })
);
</script>

<template>
    <div
        class="markdown prose prose-sm prose-indigo prose-li:marker:text-current"
        :class="{ condensed }"
        v-html="html"
    ></div>
</template>

<style lang="scss" scoped>
.markdown {
    @apply max-w-none overflow-hidden font-medium text-gray-700;

    code[class*='language'] .token {
        background: none !important;
    }
    :not(&.condensed) {
        @apply space-y-4;
    }
    &.condensed {
        @apply space-y-2 text-xs prose-h1:text-2xl prose-h1:mb-0;
    }
}
</style>
