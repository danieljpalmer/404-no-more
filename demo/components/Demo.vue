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

const chainAnswer = ref<{
    answer: string;
    references: string[];
}>();

const chainLoading = ref<boolean>(false);

const generateAnswer = async () => {
    try {
        chainLoading.value = true;

        const { answer } = await client.runChain('404-no-more-nuxt-docs', {
            slug: fullPath,
        });

        chainAnswer.value = JSON.parse(answer);
    } catch (error) {
        console.error(error);
    } finally {
        chainLoading.value = false;
    }
};

if (fullPath.length > 2) {
    generateAnswer();
}
</script>

<template>
    <main
        class="w-full min-h-screen flex flex-col items-center justify-center text-center p-10"
    >
        <div v-if="fullPath.length <= 2" class="flex flex-col w-full">
            <h2 class="text-5xl font-bold">404, no more!</h2>
        </div>

        <div v-else class="flex flex-col w-full items-center justify-center">
            <h2 class="text-8xl font-bold font-mono">404</h2>

            <p class="text-2xl font-medium text-gray-500 mt-3">
                <span class="text-gray-400">"{{ fullPath }}"</span> doesn't
                exist, but let me see if I can help...
            </p>

            <div
                v-if="chainLoading"
                class="px-4 py-2 rounded-lg bg-blue-50 text-blue-900 font-medium mt-10"
            >
                Loading...
            </div>

            <div
                class="bg-gray-50 p-5 font-medium mt-10 max-w-prose rounded-lg text-left flex flex-col"
                v-else-if="chainAnswer"
            >
                <Markdown :value="chainAnswer.answer" />

                <h5 class="text-sm text-gray-400 mt-4 mb-2">References:</h5>

                <div class="flex flex-col space-y-3">
                    <a
                        class="text-sm text-blue-600 underline"
                        target="_blank"
                        v-for="reference in chainAnswer.references"
                        :href="reference"
                        >{{ reference }}</a
                    >
                </div>
            </div>
        </div>
    </main>
</template>
