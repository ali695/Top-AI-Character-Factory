import { GeneratedItem } from '../types';

declare const JSZip: any;

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const downloadImage = (base64Image: string, filename: string, mimeType?: string) => {
  const link = document.createElement('a');
  link.href = `data:${mimeType || 'image/png'};base64,${base64Image}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadVideoFromUrl = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Failed to download video:', error);
    alert('Failed to download video. Please try again.');
  }
};


export const downloadAllAsZip = async (items: GeneratedItem[]) => {
  if (typeof JSZip === 'undefined') {
    alert('Could not download zip. JSZip library not found.');
    return;
  }

  const zip = new JSZip();
  
  for (const [index, item] of items.entries()) {
    const safePrompt = item.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    if (item.type === 'image') {
      const extension = item.mimeType === 'image/jpeg' ? 'jpg' : 'png';
      const filename = `character_${index + 1}_${safePrompt}.${extension}`;
      zip.file(filename, item.data, { base64: true });
    } else if (item.type === 'video') {
       try {
        const filename = `character_${index + 1}_${safePrompt}.mp4`;
        const response = await fetch(item.data);
        if (!response.ok) continue; // Skip failed fetches
        const blob = await response.blob();
        zip.file(filename, blob);
       } catch (e) {
        console.error("Failed to fetch video for zipping:", item.data, e);
       }
    }
  }


  zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'ai-character-factory.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });
};