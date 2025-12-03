
import type { Area } from 'react-easy-crop';

export const applyImageEdits = (
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  brightness: number,
  contrast: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Failed to get canvas context'));
      }

      const rotRad = (rotation * Math.PI) / 180;
      
      // Calculate bounding box of the rotated image
      const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
      );

      // Set canvas size to match the bounding box
      canvas.width = bBoxWidth;
      canvas.height = bBoxHeight;

      // Translate to center to rotate around the center
      ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
      ctx.rotate(rotRad);
      ctx.translate(-image.width / 2, -image.height / 2);

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // Draw the original image
      ctx.drawImage(image, 0, 0);

      // Get the data from the cropped area
      // Note: pixelCrop is relative to the *displayed* image in the cropper, 
      // but we need to map that to the rotated canvas coordinates.
      // However, react-easy-crop returns coordinates relative to the rotated image content
      // if we use the standard approach. 
      
      // Actually, a cleaner way for combined rotate+crop+filter is:
      // 1. Draw rotated/filtered full image to a temporary canvas
      // 2. Draw the crop area from temp canvas to final canvas
      
      const data = ctx.getImageData(0, 0, bBoxWidth, bBoxHeight);
      
      // Create a second canvas for the final cropped output
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = pixelCrop.width;
      outputCanvas.height = pixelCrop.height;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) return reject(new Error('Failed to get output context'));

      // Draw the specific cropped region from the first canvas to the second
      // We need to account for the offset caused by rotation resizing
      // In react-easy-crop, pixelCrop x/y are relative to the rotated image bounding box.
      
      outputCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      resolve(outputCanvas.toDataURL('image/png'));
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
};

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = Math.abs((rotation * Math.PI) / 180);
  return {
    width: Math.abs(width * Math.cos(rotRad)) + Math.abs(height * Math.sin(rotRad)),
    height: Math.abs(width * Math.sin(rotRad)) + Math.abs(height * Math.cos(rotRad)),
  };
};
