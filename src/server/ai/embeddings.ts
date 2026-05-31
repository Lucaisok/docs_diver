import OpenAI from "openai";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Converts an array of text strings into embedding vectors using OpenAI's
// text-embedding-3-small model (1536 dimensions). 
// Used for user questions
export const createEmbedding = async (input: string) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input,
    });

    return response.data[0].embedding;
};

// Here Inputs are processed in
// batches of 64 to stay within API limits. The response items are sorted by
// their original index before being collected, because the API does not
// guarantee order when batching.
// Used for documents embeddings
export const createEmbeddings = async (inputs: string[]) => {
    if (inputs.length === 0) {
        return [];
    }

    const maxBatchSize = 64;
    const embeddings: number[][] = [];

    for (let start = 0; start < inputs.length; start += maxBatchSize) {
        const batch = inputs.slice(start, start + maxBatchSize);

        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: batch,
        });

        // Sort by index to restore original order — the API may return items out of order
        const batchEmbeddings = response.data
            .slice()
            .sort((left, right) => left.index - right.index)
            .map((item) => item.embedding);

        embeddings.push(...batchEmbeddings);
    }

    return embeddings;
};