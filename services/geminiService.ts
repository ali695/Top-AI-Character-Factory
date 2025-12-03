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
  
  let errorMessage = 'An unexpected error occurred.';

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    // Attempt to extract message from API error objects
    const errAny = error as any;
    if (errAny.message) {
        errorMessage = errAny.message;
    } else if (errAny.error?.message) {
        errorMessage = errAny.error.message;
    } else {
        try {
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = String(error);
        }
    }
  } else {
    errorMessage = String(error);
  }

  if (
    errorMessage.includes('RESOURCE_EXHAUSTED') || 
    errorMessage.includes('429') || 
    errorMessage.includes('out of capacity')
  ) {
    return new Error("Service is temporarily busy or quota exceeded (429). Please try again in a moment.");
  }
  
  if (errorMessage.includes('SAFETY') || errorMessage.includes('block')) {
      return new Error("Generation blocked by safety settings. Please adjust your prompt.");
  }

  return new Error(errorMessage);
};


const generateImageFromImages = async (prompt: string, base64ImageDataUris: string[], aspectRatio: string = "1:1"): Promise<{ base64: string; mimeType: string }> => {
  const parts: ({ inlineData: { mimeType: string; data: string; }; } | { text: string; })[] = [];
  
  for (const uri of base64ImageDataUris) {
    const mimeType = uri.match(/data:(.*);base64,/)?.[1] || 'image/png';
    const base64Data = uri.split(',')[1];
    if (!base64Data) throw new Error('Invalid Base64 image data in one of the images.');
    parts.push({ inlineData: { mimeType, data: base64Data } });
  }

  // Enhanced prompt for 4K/HD quality in Image-to-Image
  const qualityPrompt = `${prompt}, 4k, 8k, ultra-detailed, high resolution, sharp focus, masterpiece`;
  parts.push({ text: qualityPrompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { 
        responseModalities: [Modality.IMAGE],
        // Apply aspect ratio configuration for reference image generation
        imageConfig: {
            aspectRatio: aspectRatio,
        }
    },
  });

  if (response.promptFeedback?.blockReason) {
    throw new Error(`Image generation blocked: ${response.promptFeedback.blockReason}. ${response.promptFeedback.blockReasonMessage || ''}`);
  }

  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && ['SAFETY', 'NO_IMAGE', 'RECITATION', 'IMAGE_OTHER'].includes(candidate.finishReason)) {
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


export const generateCreativePrompts = async (basePrompt: string, count: number, hasReferenceImage: boolean): Promise<string[]> => {
  try {
    // IMPROVED SYSTEM INSTRUCTION FOR ORIGINALITY AND ADHERENCE
    let systemInstruction = `You are a world-class visual director and prompt engineer.
    Your task is to generate ${count} highly original, vividly detailed, and prompt-adherent image descriptions based on the user's input.
    
    CORE OBJECTIVES:
    1. ORIGINALITY: Avoid generic descriptions. Use evocative language, unique lighting, and dynamic angles.
    2. ADHERENCE: Strictly follow the user's core intent (subject, action, location). Do not deviate from the specified subject.
    3. QUALITY: Ensure the prompt implies a high-quality, 4K/8K resolution image.
    `;
    
    let userPrompt = '';

    if (hasReferenceImage) {
        systemInstruction += `
        CONTEXT: The user has provided a REFERENCE IMAGE that defines the character's visual identity.
        TASK: Generate prompts that describe the SCENE, ACTION, LIGHTING, and CAMERA ANGLE around this character.
        CONSTRAINT: DO NOT describe the character's physical features (e.g. "blue eyes", "blonde hair", "suit") in the output prompt. The AI generator will take those details directly from the reference image. Describing them in text might cause conflicts.
        Focuse purely on what the character is DOING and where they ARE.
        `;
        userPrompt = `Base Idea: "${basePrompt}". 
        Create ${count} distinct prompts describing this scene/action with different lighting or angles. Keep the character description implicit (refer to them as "the character" or "the person").`;
    } else {
        systemInstruction += `
        CONTEXT: The user is defining a character from scratch.
        TASK: Generate prompts that keep the CORE CHARACTER VISUALS (defined in the input) EXACTLY THE SAME across all variations, but change the pose, background, or framing.
        CONSTRAINT: If the user specifies "red hair" or "cyberpunk armor", EVERY SINGLE output prompt must include those exact details to ensure consistency.
        `;
        userPrompt = `Character Concept: "${basePrompt}". 
        Create ${count} distinct full prompts. 
        1. Extract the physical traits from the concept and repeat them in every prompt.
        2. Vary the pose, setting, and action.
        3. Add keywords for realism and quality if the style permits (e.g. "photorealistic", "4k").`;
    }
    
    systemInstruction += `\nOutput strictly a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING, description: 'A detailed image prompt.' },
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
    const hasReferenceImages = referenceImages && referenceImages.length > 0;
    
    let promptsToUse: string[];
    let startProgress = 0;

    if (count > 1) {
      onProgress(5);
      // Pass hasReferenceImages flag to ensure prompts don't hallucinate conflicting physical traits
      promptsToUse = await generateCreativePrompts(prompt, count, hasReferenceImages);
      onProgress(15);
      startProgress = 15;
    } else {
      promptsToUse = [prompt];
      onProgress(25);
      startProgress = 25;
    }
    
    const progressPerStep = (100 - startProgress) / promptsToUse.length;
    
    // Global Quality Boosters for 4K/HD Results
    const qualityBoosters = "4k, 8k, ultra-detailed, high resolution, sharp focus, masterpiece, photorealistic, professional photography, HDR";

    for (let i = 0; i < promptsToUse.length; i++) {
      const currentPrompt = promptsToUse[i];
      let base64Result: string;
      let fullPrompt: string;
      let resultMimeType: string;
      
      if (hasReferenceImages) {
        // ENHANCED PROMPT FOR REFERENCE IMAGE CONSISTENCY
        // We separate the instructions into clear blocks for the model.
        let referencePrompt = `instruction: Use the provided image as the primary source for the character's face, hair, and body structure. Maintain strict identity consistency.\n`;
        
        if (traitsToMaintain) {
            referencePrompt += `instruction: Ensure these specific traits are visible: ${traitsToMaintain}.\n`;
        }

        referencePrompt += `prompt: ${currentPrompt}.\n`;
        referencePrompt += `style: ${styleSuffix}, ${qualityBoosters}`;

        fullPrompt = referencePrompt;
        
        // Pass aspectRatio here to ensure the output dimensions are correct
        const result = await generateImageFromImages(fullPrompt, referenceImages, aspectRatio);
        base64Result = result.base64;
        resultMimeType = result.mimeType;
        if (i < promptsToUse.length - 1) await delay(40000);
      } else {
        // TEXT-TO-IMAGE
        // Construct a robust prompt: Subject + Action/Context + Art Style + Technical Specs
        fullPrompt = `${currentPrompt}, ${styleSuffix}, ${qualityBoosters}`.replace(/, ,/g, ',').replace(/,\s*$/, '').trim();
        
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

      allImages.push({ base64: base64Result, prompt: currentPrompt, mimeType: resultMimeType });
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
    // Enhanced Upscale Prompt for 4K
    const textPart = { text: 'Upscale this image to 4K resolution. Significantly improve detail, texture, and sharpness while maintaining the original composition and identity. Eliminate artifacts and blur. Make it look like a high-end professional photograph.' };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: { responseModalities: [Modality.IMAGE] },
    });

    if (response.promptFeedback?.blockReason) {
       throw new Error(`Image upscale blocked: ${response.promptFeedback.blockReason}. ${response.promptFeedback.blockReasonMessage || ''}`);
    }

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && ['SAFETY', 'NO_IMAGE', 'RECITATION', 'IMAGE_OTHER'].includes(candidate.finishReason)) {
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

export const generateSpeech = async (text: string, options?: any): Promise<string | undefined> => {
  try {
    console.log("Generating speech with options:", options);
    
    // Supported Gemini Voices
    const SUPPORTED_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    
    // Map the detailed UI voice name (e.g., "Mishary Alafasy") to one of the 5 supported API voices.
    // This ensures that even though the API only has 5 voices, the UI selection consistently maps to the same "Actor".
    let voiceName = 'Kore';
    if (options?.voice) {
      const hash = options.voice.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      voiceName = SUPPORTED_VOICES[hash % SUPPORTED_VOICES.length];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        role: 'user',
        parts: [{ text }]
      },
      config: {
        // Use string literal "AUDIO" to ensure correct serialization in browser environments
        // @ts-ignore
        responseModalities: ["AUDIO"],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { 
              voiceName 
            } 
          } 
        },
      },
    });
    
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part?.inlineData?.data) {
      return part.inlineData.data;
    }
    
    if (response.promptFeedback?.blockReason) {
       console.error("Speech generation blocked:", response.promptFeedback);
    }
    
    return undefined;
  } catch (error) {
    throw handleApiError(error, "speech generation");
  }
};

const allPresets = PRESET_CATEGORIES.flatMap(cat => cat.presets);

export const analyzePromptForSuggestions = (prompt: string, selectedPreset: Preset | null): { recommendedPresets: string[], smartTags: string[] } => {
  const lowerCasePrompt = prompt.toLowerCase();
  const foundTags = new Set<string>();
  
  if (selectedPreset) {
    selectedPreset.tags.forEach(tag => foundTags.add(tag));
  }

  allPresets.forEach(preset => {
    preset.tags.forEach(tag => {
      if (!foundTags.has(tag) && lowerCasePrompt.includes(tag.toLowerCase())) {
        foundTags.add(tag);
      }
    });
  });

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

export const analyzePromptForPhysicalTraits = (prompt: string): string[] => {
  const physicalKeywords = [
    'hair', 'eyes', 'skin', 'face', 'nose', 'lips', 'body', 'tall', 'short', 'fat', 'thin', 'muscular', 
    'wearing', 'clothes', 'dress', 'shirt', 'suit', 'armor', 'glasses', 'beard', 'blonde', 'brunette', 'redhead'
  ];
  const lowerPrompt = prompt.toLowerCase();
  return physicalKeywords.filter(keyword => lowerPrompt.includes(keyword));
};
