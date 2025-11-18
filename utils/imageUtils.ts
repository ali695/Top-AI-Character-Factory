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
      
      const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        pixelCrop.width,
        pixelCrop.height,
        rotation
      );

      canvas.width = bBoxWidth;
      canvas.height = bBoxHeight;

      ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
      ctx.rotate(rotRad);
      ctx.translate(-pixelCrop.width / 2, -pixelCrop.height / 2);

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      
      resolve(canvas.toDataURL('image/png'));
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
