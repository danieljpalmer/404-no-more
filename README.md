# 404 No More

Use LLMs to banish 404s from your application, always delivering relevant information to your users!

Disclosure: The LLM chain that powers this project is built with [Relevance AI](https://documentation.relevanceai.com), which I work on.

[See a demo video!](https://www.loom.com/share/c107fc1f719245e8a674504e2d456905)

## Prerequisite

For this chain to work, you will need a Relevance AI dataset where we have loaded in your website content. We're about to release clear steps for how to do this - but for now, shoot me a [DM on Twitter for help!](https://www.twitter.com/userlastname)

## How does this work?

You can find the chain in the `chains` folder. Files in this folder are automatically deployed by `relevance deploy`.

The chain works in a few core steps:

### Rephrasing the slug into a question

First, it takes the slug of the page that 404s and asks the LLM to rephrase it as a question.

### Vector search

It then uses the slug to search the Relevance AI dataset you have set up, to find the relevant pages from your website. We then do a local vector search to find the most relevant chunks from those pages.

Now we have a list of the most relevant sentences from your website, pertinent to the rephrased slug question!

### Feeding back into the LLM

Finally, we pass this list into an LLM prompt as context and ask it to answer the question!

### Customization

There is a lot of scope to customize the prompts in the chain to better suit your use case! In the `demo` folder you can see how I tweaked the chain to work with my scraped Nuxt.js docs dataset.

## Deploying the Relevance chain

Install and authenticate SDK

```
npm install @relevanceai/chain -g
relevance login
```

Add your Open AI key:

```
relevance keys
```

cd to root folder of 404 No More (or copy chain into `chains` folder in this demo). Then deploy the chain to your Relevance account.

```
cd ../
relevance deploy
```

## Using the chain in your app

```
npm install @relevanceai/chain
```

And then anywhere in your logic:

```ts
import { Client } from '@relevanceai/chain';

const client = new Client({
    region: 'Your Relevance region',
    project: 'Your Relevance project',
});

// note here that 404-no-more is the ID of your chain, as defined by the file name in the chains folder
const { answer } = await client.runChain('404-no-more', {
    slug: fullPath,
});
```
