export interface GenerateImageOptions {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  style?: string;
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
  url?: string;
  prompt: string;
}

export async function generateImage(options: GenerateImageOptions): Promise<GeneratedImage> {
  const { prompt, width = 1024, height = 1024, seed } = options;

  // Using Pollinations.ai - Free AI image generation API
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed || Math.floor(Math.random() * 10000)}&nologo=true`;

  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return {
      base64,
      mimeType: contentType,
      url: imageUrl,
      prompt
    };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export async function generateMultipleImages(
  prompt: string, 
  count: number, 
  options: Omit<GenerateImageOptions, 'prompt' | 'seed'> = {}
): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const image = await generateImage({
        ...options,
        prompt,
        seed: Math.floor(Math.random() * 10000)
      });
      images.push(image);
    } catch (error) {
      console.error(`Failed to generate image ${i + 1}:`, error);
    }
  }
  
  return images;
}
