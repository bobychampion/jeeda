import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import { defaultPromptConfig } from '../config/promptConfig.js';

dotenv.config();

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '');

// In-memory storage for prompt config (in a real app, this might be in DB)
// We'll allow updating this via API
export let currentPromptConfig = { ...defaultPromptConfig };

export const updatePromptConfig = (newConfig) => {
    currentPromptConfig = { ...currentPromptConfig, ...newConfig };
    return currentPromptConfig;
};

export const getPromptConfig = () => currentPromptConfig;

// Image generation functions removed - focusing on chat recommendations only


/**
 * Generate chat response using Hugging Face LLM
 * @param {string} prompt - The system + user prompt
 * @returns {Promise<string>} - The generated text response
 */
export async function generateChatResponse(prompt) {
    try {
        // Check if API key is set
        if (!process.env.HUGGINGFACE_API_KEY) {
            throw new Error('HUGGINGFACE_API_KEY is not set in the backend .env file');
        }

        // Try multiple free models that work well for chat
        // Using Inference API models that are publicly available
        const models = [
            'Qwen/Qwen2.5-72B-Instruct',           // Very powerful, often free
            'meta-llama/Llama-3.2-3B-Instruct',    // Fast, reliable
            'mistralai/Mistral-7B-Instruct-v0.3',  // Newer Mistral
            'HuggingFaceH4/zephyr-7b-beta',        // Original choice
        ];

        let lastError;
        for (const model of models) {
            try {
                console.log(`Trying Hugging Face model: ${model}`);

                // 1. Try Chat Completion (Best for instruction following)
                try {
                    const response = await hf.chatCompletion({
                        model: model,
                        messages: [
                            { role: 'user', content: prompt }
                        ],
                        max_tokens: 500,
                        temperature: 0.7,
                    });

                    if (response.choices && response.choices[0]?.message?.content) {
                        console.log(`✓ Successfully used model: ${model} (chat completion)`);
                        return response.choices[0].message.content;
                    }
                } catch (chatError) {
                    console.log(`Chat completion failed for ${model}: ${chatError.message}`);
                }

                // 2. Try Conversational Task (Standard for chat models like Zephyr/DialoGPT)
                try {
                    const response = await hf.conversational({
                        model: model,
                        inputs: { text: prompt }
                    });

                    if (response && response.generated_text) {
                        console.log(`✓ Successfully used model: ${model} (conversational)`);
                        return response.generated_text;
                    }
                } catch (convError) {
                    console.log(`Conversational task failed for ${model}: ${convError.message}`);
                }

                // 3. Fallback to Text Generation (Raw completion)
                try {
                    const response = await hf.textGeneration({
                        model: model,
                        inputs: prompt,
                        parameters: {
                            max_new_tokens: 500,
                            temperature: 0.7,
                            top_p: 0.95,
                            return_full_text: false,
                        },
                    });

                    const generatedText = response.generated_text || response;
                    console.log(`✓ Successfully used model: ${model} (text generation)`);
                    return generatedText;
                } catch (textError) {
                    console.log(`Text generation failed for ${model}: ${textError.message}`);
                    throw textError; // Throw to trigger the main catch block and try next model
                }

            } catch (error) {
                lastError = error;
                const errorMsg = error.message || error.toString();
                console.warn(`Model ${model} failed:`, errorMsg);

                // If it's an auth error, don't try other models
                if (errorMsg.includes('Authorization') || errorMsg.includes('401') || errorMsg.includes('403')) {
                    throw new Error(`Authentication failed with Hugging Face. Please check your API key. Error: ${errorMsg}`);
                }

                // If it's a rate limit, wait a bit
                if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
                    console.log('Rate limit hit, will try next model...');
                    continue;
                }

                // Continue to next model
                continue;
            }
        }

        // If all models failed, throw the last error with details
        const errorDetails = lastError?.message || lastError?.toString() || 'Unknown error';
        throw new Error(`All Hugging Face models failed. Last error: ${errorDetails}`);
    } catch (error) {
        console.error('Hugging Face Chat API error:', error);

        // Provide more helpful error messages
        const errorMsg = error.message || error.toString();

        if (errorMsg.includes('API key') || errorMsg.includes('HUGGINGFACE_API_KEY')) {
            throw new Error('Hugging Face API key is missing or invalid. Please add HUGGINGFACE_API_KEY to your backend .env file. Get a free key at https://huggingface.co/settings/tokens');
        } else if (errorMsg.includes('Authorization') || errorMsg.includes('401') || errorMsg.includes('403')) {
            throw new Error('Invalid Hugging Face API key. Please check your HUGGINGFACE_API_KEY in the backend .env file.');
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
            throw new Error('Hugging Face API rate limit reached. Please try again later.');
        } else if (errorMsg.includes('loading') || errorMsg.includes('503') || errorMsg.includes('Model is currently loading')) {
            throw new Error('The AI model is currently loading. Please try again in a few moments.');
        }

        throw new Error(`Failed to generate chat response: ${errorMsg}`);
    }
}
