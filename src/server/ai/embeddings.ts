import OpenAI from "openai";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const createEmbedding = async (input: string) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input,
    });

    return response.data[0].embedding;
};

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

        const batchEmbeddings = response.data
            .slice()
            .sort((left, right) => left.index - right.index)
            .map((item) => item.embedding);

        embeddings.push(...batchEmbeddings);
    }

    return embeddings;
};