import { defineChain } from "@relevanceai/chain";

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
      
Re-word this slug into a question that you might ask to get the information contained at this website slug. You will be asking this question to a chunked version of the website, using vector similarity search.`,
      system_prompt: `You are a user looking for information about a website.`,
    });

    // vector search titles in the dataset, get pages with chunks
    const { results: datasetSearchResults } = step('search', {

      // REPLACE THIS WITH YOUR OWN DATASET ID
      dataset_id: 'nuxt-docs',
      'model': 'text-embedding-ada-002',
      'query': slugQuestion,
      'vector_field': 'page_title_openai_vector_',
    });


    const { transformed: chunks } = code({ datasetSearchResults }, ({ datasetSearchResults }) => {
      return datasetSearchResults.flatMap((result: any) => {
        const url = result.url;
        // map chunk text, as well as URL from page and filter out short text
        return result.content_chunk_.filter((chunk: { text: string }) => chunk['text'].length > 20).map((chunk: {
          text: string;
        }) => {
          return {
            text: chunk['text'],
            url,
          }
        });
      });
    });


    // local vector search chunks, get most relevant chunks
    const { results: chunkSearch } = step('search_array', {
      array: chunks,
      query: slugQuestion,
      page_size: 5,
      field: 'text'
    });

    // pass into LLM to answer question
    const { answer } = step('prompt_completion', {
      prompt: `CONTEXT: ${chunkSearch}
      
QUESTION: ${slugQuestion}`,
      
      // Lots of scope to tailor this to your specific domain
      system_prompt: "You are a world class Nuxt 3 consultant. You answer questions about how to use Nuxt 3. Do not guess, only answer based on the context. Do not share links. Return in this format: { answer: string; references: string[]; }. References should be a list of the URLs that were relevant from context. You should use markdown in your responses.",

      // This is a JSON schema that will be used to validate the response
      validators: [
        {
          type: 'jsonschema',
          value: {
            type: 'object',
            properties: {
              answer: {
                type: 'string'
              }, 
              references: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        }
      ]
    });

    return {
      answer
    }
  }
})