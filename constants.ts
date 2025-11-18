import { ArtStyle } from './types';
import { Camera, Film, Tv2, ZoomIn, Brush, User, Swords, Rocket, FlaskConical } from 'lucide-react';

export const ART_STYLES: ArtStyle[] = [
  {
    id: 'realistic',
    name: 'Realistic',
    prompt_suffix: 'hyperrealistic photo, studio portrait, soft lighting, 8k, sharp focus',
    icon: Camera
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    prompt_suffix: 'cinematic film still, dramatic lighting, high detail, film grain, anamorphic lens',
    icon: Film
  },
  {
    id: 'anime',
    name: 'Anime',
    prompt_suffix: 'modern anime style, detailed eyes and hair, vibrant, trending on pixiv',
    icon: Tv2
  },
  {
    id: 'hyper-detail',
    name: 'Hyper-Detail',
    prompt_suffix: 'ultra high detail, hyperdetailed, intricate, professional digital painting, 8k resolution',
    icon: ZoomIn
  },
  {
    id: 'stylized',
    name: 'Stylized',
    prompt_suffix: 'stylized concept art, painterly, visible brush strokes, unique art style',
    icon: Brush
  },
  {
    id: 'portrait',
    name: 'Portrait',
    prompt_suffix: 'character portrait, head and shoulders, detailed face, flattering lighting',
    icon: User
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    prompt_suffix: 'epic fantasy art, magical, detailed armor, style of D&D character art',
    icon: Swords
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    prompt_suffix: 'sci-fi concept art, futuristic, high-tech, cyberpunk aesthetic, neon lighting',
    icon: Rocket
  },
  {
    id: 'experimental',
    name: 'Experimental',
    prompt_suffix: 'abstract, experimental art style, unconventional, surreal, avant-garde',
    icon: FlaskConical
  },
];

export const BATCH_SIZES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

export const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1 (Square)' },
  { id: '4:3', name: '4:3 (Landscape)' },
  { id: '3:4', name: '3:4 (Portrait)' },
  { id: '16:9', name: '16:9 (Widescreen)' },
  { id: '9:16', name: '9:16 (Tall)' },
];

export const DETAIL_LEVELS = [
  { id: 'low', name: 'Low', prompt_suffix: 'low detail, simple, minimalist' },
  { id: 'medium', name: 'Medium', prompt_suffix: 'balanced' },
  { id: 'high', name: 'High', prompt_suffix: 'high detail, detailed, complex' },
  { id: 'ultra', name: 'Ultra', prompt_suffix: 'ultra high detail, hyperdetailed, intricate, professional' },
];

export const ENHANCED_QUALITY_PROMPT = 'masterpiece, best quality, ultra-detailed, 3d render, Pixar animation style, Disney style, polished, smooth shading, soft lighting, vibrant colors, physically-based rendering, subsurface scattering, cinematic character portrait, flawless';