import { GoogleGenAI, Chat, Modality, Type, Content } from '@google/genai';
import { ChatMessage, Preset } from '../types';
import { PRESET_CATEGORIES } from '../presets';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleApiError = (error: unknown, context: string): Error => {
  console.error(`Error in ${context}:`, error);
  if (error instanceof Error) {
    if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
      return new Error("You've exceeded your API quota. Please check your plan and billing details or try again later.");
    }
    return error;
  }
  return new Error(`An unknown error occurred during ${context}.`);
};


const generateImageFromImages = async (prompt: string, base64ImageDataUris: string[]): Promise<{ base64: string; mimeType: string }> => {
  const parts: ({ inlineData: { mimeType: string; data: string; }; } | { text: string; })[] = [];
  
  for (const uri of base64ImageDataUris) {
    const mimeType = uri.match(/data:(.*);base64,/)?.[1] || 'image/png';
    const base64Data = uri.split(',')[1];
    if (!base64Data) throw new Error('Invalid Base64 image data in one of the images.');
    parts.push({ inlineData: { mimeType, data: base64Data } });
  }

  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { responseModalities: [Modality.IMAGE] },
  });

  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && ['SAFETY', 'NO_IMAGE', 'RECITATION'].includes(candidate.finishReason)) {
     throw new Error(`Image generation failed: ${candidate.finishReason}. This may be due to safety policies. Please adjust your prompt or image.`);
  }
  if (!candidate?.content?.parts) {
    console.error("Invalid or blocked response from Gemini API:", JSON.stringify(response, null, 2));
    throw new Error('Failed to generate image. The response may have been blocked due to safety settings.');
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData) return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType };
  }
  throw new Error('No image found in response for image-to-image generation.');
};


export const generateCreativePrompts = async (basePrompt: string, count: number): Promise<string[]> => {
  try {
    const systemInstruction = `You are a creative assistant for an AI image generator. Your task is to generate a JSON array of ${count} unique, vivid, and detailed scene descriptions based on a user's base prompt. Each description should be a string and should explore different environments, camera angles, actions, and moods to create variety. Do not number the prompts. Just return a clean JSON array of strings.`;
    const userPrompt = `Generate ${count} creative scene prompts based on this idea: "${basePrompt}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING, description: 'A creative and detailed scene prompt.' },
        },
      },
    });
    const prompts = JSON.parse(response.text.trim());
    if (!Array.isArray(prompts) || prompts.length === 0) throw new Error("Failed to parse prompts.");
    while (prompts.length < count) prompts.push(basePrompt); // Fallback
    return prompts.slice(0, count);
  } catch (error) {
     console.error("Error generating creative prompts, using fallback:", error);
     return Array(count).fill(basePrompt);
  }
};


export const generateImageVariations = async (
  prompt: string,
  count: number,
  referenceImages: string[] | null,
  onProgress: (progress: number) => void,
  styleSuffix: string,
  aspectRatio: string,
  outputMimeType: 'image/png' | 'image/jpeg',
  traitsToMaintain: string
): Promise<{ base64: string; prompt: string; mimeType: string }[]> => {
  try {
    const allImages: { base64: string; prompt: string; mimeType: string }[] = [];
    
    let promptsToUse: string[];
    let startProgress = 0;

    if (count > 1) {
      onProgress(5);
      promptsToUse = await generateCreativePrompts(prompt, count);
      onProgress(15);
      startProgress = 15;
    } else {
      promptsToUse = [prompt];
      onProgress(25);
      startProgress = 25;
    }
    
    const progressPerStep = (100 - startProgress) / promptsToUse.length;
    
    for (let i = 0; i < promptsToUse.length; i++) {
      const currentPrompt = promptsToUse[i];
      let base64Result: string;
      let fullPrompt: string;
      let resultMimeType: string;
      
      const hasReferenceImages = referenceImages && referenceImages.length > 0;

      if (hasReferenceImages) {
        let referencePrompt: string;
        if (referenceImages.length > 1) {
            referencePrompt = `Analyze all ${referenceImages.length} reference images provided. Synthesize the character's core identity, face, and key features from these multiple views to create a consistent representation. This is the same character seen from different angles or in different outfits; your primary goal is consistency.`;
        } else {
            referencePrompt = `Use the provided image as a direct and primary reference for the character's identity.`;
        }
        
        referencePrompt += ` Strictly maintain the character's appearance.`;

        if (traitsToMaintain) {
            referencePrompt += ` Pay special attention to these specific, non-negotiable traits: ${traitsToMaintain}. These must be present and accurate.`;
        }

        fullPrompt = `${referencePrompt} Now, place this character in the following scene: ${currentPrompt}. Apply this artistic style: ${styleSuffix}`;
        
        const result = await generateImageFromImages(fullPrompt.replace(/, ,/g, ',').replace(/,\s*$/, '').trim(), referenceImages);
        base64Result = result.base64;
        resultMimeType = result.mimeType;
        if (i < promptsToUse.length - 1) await delay(40000);
      } else {
        fullPrompt = `${currentPrompt}, ${styleSuffix}`.replace(/, ,/g, ',').replace(/,\s*$/, '').trim();
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: fullPrompt,
          config: { 
            numberOfImages: 1, 
            outputMimeType, 
            aspectRatio 
          },
        });
        base64Result = response.generatedImages[0].image.imageBytes;
        resultMimeType = outputMimeType;
        if (i < promptsToUse.length - 1) await delay(40000);
      }

      allImages.push({ base64: base64Result, prompt: fullPrompt, mimeType: resultMimeType });
      onProgress(startProgress + Math.round((i + 1) * progressPerStep));
    }

    return allImages;
  } catch (error) {
    throw handleApiError(error, "image variation generation");
  }
};


export const upscaleImage = async (base64Image: string, mimeType?: string): Promise<{ base64: string; mimeType: string }> => {
  try {
    const imagePart = { inlineData: { mimeType: mimeType || 'image/png', data: base64Image } };
    const textPart = { text: 'Re-render this image with significantly higher detail, clarity, and sharpness. The content, style, and composition should remain identical to the original.' };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: { responseModalities: [Modality.IMAGE] },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && ['SAFETY', 'NO_IMAGE', 'RECITATION'].includes(candidate.finishReason)) {
       throw new Error(`Image upscale failed: ${candidate.finishReason}. This may be due to safety policies. Please try a different image.`);
    }
    if (!candidate?.content?.parts) {
      console.error("Invalid or blocked response from Gemini API during upscale:", JSON.stringify(response, null, 2));
      throw new Error('Failed to upscale image. The response may have been blocked due to safety settings.');
    }
    for (const part of candidate.content.parts) {
      if (part.inlineData) return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType };
    }
    throw new Error('No upscaled image found in response.');
  } catch (error) {
    throw handleApiError(error, "image upscaling");
  }
};

export const generateVideo = async (prompt: string, referenceImage: string, onProgress: (progress: number) => void): Promise<string> => {
  try {
    // Create a new client instance for each call to ensure the latest API key from the selection dialog is used.
    const videoAi = new GoogleGenAI({ apiKey: API_KEY! });
    
    const mimeType = referenceImage.match(/data:(.*);base64,/)?.[1] || 'image/png';
    const base64Data = referenceImage.split(',')[1];
    if (!base64Data) throw new Error('Invalid Base64 image data.');

    onProgress(10);
    let operation = await videoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Animate the character from the provided image. The animation should be 8 seconds long. The scene is: ${prompt}`,
        image: { imageBytes: base64Data, mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '1:1' }
    });
    
    onProgress(30);
    let progress = 30;

    while (!operation.done) {
        await delay(10000);
        operation = await videoAi.operations.getVideosOperation({ operation: operation });
        progress = Math.min(progress + 10, 90);
        onProgress(progress);
    }
    onProgress(95);

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation completed, but no download link was found.");
    
    // The API key must be appended to the download URL for auth
    return `${downloadLink}&key=${API_KEY}`;
  } catch(error) {
    throw handleApiError(error, 'video generation');
  }
};

export const initializeChat = (history: ChatMessage[]): Chat => {
  const formattedHistory: Content[] = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction: 'You are a friendly and helpful AI assistant.' },
    history: formattedHistory,
  });
  return chat;
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    throw handleApiError(error, "speech generation");
  }
};

const allPresets = PRESET_CATEGORIES.flatMap(cat => cat.presets);

export const analyzePromptForSuggestions = (prompt: string, selectedPreset: Preset | null): { recommendedPresets: string[], smartTags: string[] } => {
  const lowerCasePrompt = prompt.toLowerCase();
  const foundTags = new Set<string>();
  
  // Start with tags from the selected preset for relevance
  if (selectedPreset) {
    selectedPreset.tags.forEach(tag => foundTags.add(tag));
  }

  // Find additional tags from the prompt text by checking against all preset tags
  allPresets.forEach(preset => {
    preset.tags.forEach(tag => {
      // Avoid adding redundant tags
      if (!foundTags.has(tag) && lowerCasePrompt.includes(tag.toLowerCase())) {
        foundTags.add(tag);
      }
    });
  });

  // Also recommend presets if their name or tags are in the prompt
  const recommendedPresets = new Set<string>();
  allPresets.forEach(preset => {
    if (lowerCasePrompt.includes(preset.name.toLowerCase())) {
        recommendedPresets.add(preset.id);
    }
    preset.tags.forEach(tag => {
      if (lowerCasePrompt.includes(tag.toLowerCase())) {
        recommendedPresets.add(preset.id);
      }
    });
  });

  return {
    recommendedPresets: Array.from(recommendedPresets),
    smartTags: Array.from(foundTags),
  };
};
