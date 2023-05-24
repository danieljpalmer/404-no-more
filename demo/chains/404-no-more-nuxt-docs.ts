import { defineChain } from "@relevanceai/chain";

const DATASET_ID = 'nuxt-docs';
const SCRAPED_DATASET_VECTOR_FIELD = 'page_title_openai_vector_';

export default defineChain({
  title: '404 No More',
  publiclyTriggerable: true,
  params: {
    slug: {
      type: 'string',
    }
  },
  setup({ params, step, code }) {
    const { slug } = params;

    // ask LLM to turn slug into a search query
    const { answer: slugQuestion } = step('prompt_completion', {
      prompt: `Here is the website slug you are looking for: ${slug}.
      
Re-word this slug into a question that you might ask to find this page. You will be asking this question to a chunked version of the website, using vector similarity search.`,
      system_prompt: `You are a user looking for a page on the Nuxt 3 docs website.`,
    });

    // vector search titles in the dataset, get pages with chunks
    const { results: datasetSearchResults } = step('search', {

      // REPLACE THIS WITH YOUR OWN DATASET ID
      dataset_id: DATASET_ID,
      'model': 'text-embedding-ada-002',
      'query': slugQuestion,
      'vector_field': SCRAPED_DATASET_VECTOR_FIELD,
    });


    const { transformed: chunks } = code({ datasetSearchResults }, ({ datasetSearchResults }) => {
      return datasetSearchResults.flatMap((result: any) => {
        // map chunk text and filter out short text
        return result.content_chunk_.map((chunk: any) => chunk.text).filter((text: string) => text.length > 20);
      });
    });


    // local vector search chunks, get most relevant chunks
    const { results: chunkSearch } = step('search_array', {
      array: chunks,
      query: slugQuestion,
      page_size: 5
    });

    const { transformed: mappedChunks } = code({ chunkSearch }, ({ chunkSearch }) => {
      return chunkSearch.map((result: any) => result).join('\n\n');
    });

    // pass into LLM to answer question
    const { answer } = step('prompt_completion', {
      prompt: `CONTEXT: ${mappedChunks}
      
QUESTION: ${slugQuestion}`,
      
      // Lots of scope to tailor this to your specific domain
      system_prompt: "You are a world class Nuxt 3 consultant. You answer questions about how to use Nuxt 3. Do not guess, only answer based on the context. Do not share links. You should use markdown in your responses."
    });

    return {
      answer
    }
  }
})