<script setup lang="ts">
import { Client } from '@relevanceai/chain';
import { REGION, PROJECT } from '~/relevance-config';

const client = new Client({
    region: REGION as string,
    project: PROJECT as string,
});

// read the path from the route
const route = useRoute();

const { fullPath } = route;

const chainAnswer = ref<string>('');
const chainLoading = ref<boolean>(false);

const generateAnswer = async () => {
    try {
        chainLoading.value = true;

        const { answer } = await client.runChain('404-no-more-nuxt-docs', {
            slug: fullPath,
        });

        chainAnswer.value = answer;
    } catch (error) {
        console.error(error);
    } finally {
        chainLoading.value = false;
    }
};

generateAnswer();
</script>

<template>
    <main
        class="w-full min-h-screen flex flex-col items-center justify-center text-center p-10"
    >
        <h2 class="text-8xl font-bold">404</h2>

        <p class="text-2xl font-medium text-gray-500 mt-3">
            <span class="text-gray-400">"{{ fullPath }}"</span> doesn't exist,
            but let me see if I can help...
        </p>

        <div
            v-if="chainLoading"
            class="px-4 py-2 rounded-lg bg-blue-50 text-blue-900 font-medium mt-10"
        >
            Loading...
        </div>

        <div
            class="bg-gray-50 p-6 font-medium mt-10 max-w-prose rounded-lg text-left"
            v-else-if="chainAnswer.length"
        >
            <Markdown :value="chainAnswer" />
        </div>
    </main>
</template>
