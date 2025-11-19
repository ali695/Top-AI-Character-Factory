
import { PresetCategory, Preset } from './types';
import { Film, User, Heart, Palette, Globe, Camera, Paintbrush, TrendingUp, Sparkles, Ghost, Bot, Moon, Image, BookOpen, Gamepad2, Smile } from 'lucide-react';

const p_url = (seed: string, size = 200) => `https://picsum.photos/seed/${seed}/${size}`;

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: Film,
    presets: [
      {
        id: 'moody-cinematic', name: 'Moody Film',
        prompt: 'moody cinematic film still, anamorphic lens flare, dramatic shadows, muted color palette, film grain',
        thumbnail: p_url('moody-thumb'), tagline: 'Evocative, film-like dramatic scenes.', tags: ['cinematic', 'moody', 'film', 'dramatic'],
        previewImages: [p_url('moody-1', 400), p_url('moody-2', 400), p_url('moody-3', 400)],
      },
      {
        id: 'epic-landscape', name: 'Epic Landscape',
        prompt: 'breathtaking cinematic landscape, wide-angle shot, epic scale, dramatic lighting, matte painting',
        thumbnail: p_url('landscape-thumb'), tagline: 'Vast, movie-like natural vistas.', tags: ['landscape', 'cinematic', 'epic', 'nature'],
        previewImages: [p_url('landscape-1', 400), p_url('landscape-2', 400), p_url('landscape-3', 400)],
      },
       {
        id: 'action-shot', name: 'Action Shot',
        prompt: 'dynamic action shot, motion blur, intense, high-energy, cinematic fight scene',
        thumbnail: p_url('action-thumb'), tagline: 'High-energy, dynamic action.', tags: ['action', 'cinematic', 'motion'],
        previewImages: [p_url('action-1', 400), p_url('action-2', 400), p_url('action-3', 400)],
      },
    ]
  },
  {
    id: 'storybook-fantasy',
    name: 'Storybook & Folklore',
    icon: BookOpen,
    presets: [
      {
        id: 'vintage-storybook', name: 'Vintage Book',
        prompt: 'classic vintage storybook illustration, Arthur Rackham style, ink and watercolor, intricate details, muted tones, textured paper background',
        thumbnail: p_url('vintage-book-thumb'), tagline: 'Classic, intricate fairy tale art.', tags: ['storybook', 'vintage', 'fairy tale', 'illustration'],
        previewImages: [p_url('book-1', 400), p_url('book-2', 400), p_url('book-3', 400)],
      },
      {
        id: 'magical-fairytale', name: 'Magical Fairy Tale',
        prompt: 'whimsical fairy tale illustration, vibrant pastel colors, sparkling magic, soft lighting, dreamy atmosphere, detailed forest background',
        thumbnail: p_url('fairy-thumb'), tagline: 'Dreamy, colorful magic.', tags: ['fairy tale', 'magic', 'fantasy', 'cute'],
        previewImages: [p_url('fairy-1', 400), p_url('fairy-2', 400), p_url('fairy-3', 400)],
      },
      {
        id: 'popup-book', name: 'Pop-Up Book',
        prompt: 'layered paper pop-up book style, depth of field, paper texture, cut-out look, vibrant colors, diorama effect',
        thumbnail: p_url('popup-thumb'), tagline: '3D paper cutout world.', tags: ['paper', 'craft', 'pop-up', 'cute'],
        previewImages: [p_url('popup-1', 400), p_url('popup-2', 400), p_url('popup-3', 400)],
      },
    ]
  },
  {
    id: 'portraits',
    name: 'Hyperreal Portraits',
    icon: User,
    presets: [
      {
        id: 'hyper-realistic', name: 'Hyper-Realistic',
        prompt: 'hyper-realistic human portrait, detailed skin texture, catchlight in eyes, professional photography, 8k',
        thumbnail: p_url('hyperreal-thumb'), tagline: 'Lifelike portraits with stunning detail.', tags: ['realistic', 'human', 'portrait', 'cinematic'],
        previewImages: [p_url('hyperreal-1', 400), p_url('hyperreal-2', 400), p_url('hyperreal-3', 400)],
      },
      {
        id: 'vogue-editorial', name: 'Vogue Editorial',
        prompt: 'Vogue editorial fashion shoot, dramatic pose, high-fashion styling, professional studio lighting',
        thumbnail: p_url('vogue-thumb'), tagline: 'High-fashion, magazine-quality shots.', tags: ['fashion', 'vogue', 'portrait', 'studio'],
        previewImages: [p_url('vogue-1', 400), p_url('vogue-2', 400), p_url('vogue-3', 400)],
      },
      {
        id: 'golden-hour', name: 'Golden Hour',
        prompt: 'golden hour portrait, warm soft lighting, lens flare, magical and dreamy atmosphere',
        thumbnail: p_url('golden-thumb'), tagline: 'Warm, magical, sun-kissed photos.', tags: ['portrait', 'golden hour', 'dreamy', 'light'],
        previewImages: [p_url('golden-1', 400), p_url('golden-2', 400), p_url('golden-3', 400)],
      },
       {
        id: 'black-white-film', name: 'Black & White',
        prompt: 'black and white film photography, high contrast, grainy texture, dramatic shadows, timeless feel',
        thumbnail: p_url('bw-thumb'), tagline: 'Timeless, high-contrast monochrome.', tags: ['b&w', 'film', 'portrait', 'dramatic'],
        previewImages: [p_url('bw-1', 400), p_url('bw-2', 400), p_url('bw-3', 400)],
      },
    ]
  },
  {
    id: 'cartoon-games',
    name: 'Cartoons & Games',
    icon: Gamepad2,
    presets: [
      {
        id: 'retro-cartoon', name: '1930s Cartoon',
        prompt: '1930s rubber hose animation style, black and white, film grain, vintage cartoon, pie eyes, energetic poses',
        thumbnail: p_url('retro-toon-thumb'), tagline: 'Vintage rubber-hose animation.', tags: ['cartoon', 'retro', 'vintage', 'bw'],
        previewImages: [p_url('toon-1', 400), p_url('toon-2', 400), p_url('toon-3', 400)],
      },
      {
        id: 'pixel-art', name: '16-Bit Pixel Art',
        prompt: '16-bit pixel art, retro video game sprite, dithering, limited color palette, clean lines, detailed',
        thumbnail: p_url('pixel-thumb'), tagline: 'Retro gaming nostalgia.', tags: ['pixel', 'game', 'retro', '8bit'],
        previewImages: [p_url('pixel-1', 400), p_url('pixel-2', 400), p_url('pixel-3', 400)],
      },
      {
        id: 'claymation', name: 'Claymation',
        prompt: 'claymation style, stop-motion look, plasticine texture, visible fingerprints, soft lighting, Aardman style',
        thumbnail: p_url('clay-thumb'), tagline: 'Hand-crafted clay stop-motion.', tags: ['clay', 'stop-motion', 'cartoon', 'cute'],
        previewImages: [p_url('clay-1', 400), p_url('clay-2', 400), p_url('clay-3', 400)],
      },
    ]
  },
  {
    id: 'dark-horror',
    name: 'Horror & Dark Fantasy',
    icon: Ghost,
    presets: [
       {
        id: 'dark-fantasy-art', name: 'Dark Fantasy',
        prompt: 'dark fantasy character art, gothic, moody lighting, intricate details, style of Dark Souls, epic',
        thumbnail: p_url('darkfantasy-thumb'), tagline: 'Gothic, epic, and moody.', tags: ['fantasy', 'dark', 'gothic', 'epic'],
        previewImages: [p_url('darkfantasy-1', 400), p_url('darkfantasy-2', 400), p_url('darkfantasy-3', 400)],
      },
      {
        id: 'cinematic-horror', name: 'Cinematic Horror',
        prompt: 'cinematic horror movie scene, high contrast, deep shadows, teal and orange color grading, suspenseful atmosphere',
        thumbnail: p_url('horror-thumb'), tagline: 'Suspenseful movie quality.', tags: ['horror', 'dark', 'movie', 'scary'],
        previewImages: [p_url('horror-1', 400), p_url('horror-2', 400), p_url('horror-3', 400)],
      },
      {
        id: 'ghost-photo', name: 'Ghost Photography',
        prompt: 'grainy paranormal investigation photo, motion blur, low light, night vision green tint, unsettling figure in background',
        thumbnail: p_url('ghost-thumb'), tagline: 'Found footage and paranormal.', tags: ['ghost', 'scary', 'creepy', 'photo'],
        previewImages: [p_url('ghost-1', 400), p_url('ghost-2', 400), p_url('ghost-3', 400)],
      },
       {
        id: 'eldritch-horror', name: 'Eldritch Horror',
        prompt: 'Lovecraftian cosmic horror, incomprehensible geometry, tentacles, madness, oil painting style, dark and grimy',
        thumbnail: p_url('eldritch-thumb'), tagline: 'Cosmic madness and monsters.', tags: ['lovecraft', 'monster', 'horror', 'art'],
        previewImages: [p_url('eldritch-1', 400), p_url('eldritch-2', 400), p_url('eldritch-3', 400)],
      },
    ]
  },
   {
    id: 'kdrama',
    name: 'K-Drama Aesthetics',
    icon: Heart,
    presets: [
       {
        id: 'kdrama-romance', name: 'Romance Scene',
        prompt: 'K-drama romance scene, soft lighting, emotional, close-up shot, bokeh background, Seoul city view',
        thumbnail: p_url('kdrama-romance'), tagline: 'Heartfelt, emotional moments.', tags: ['k-drama', 'romance', 'soft'],
        previewImages: [p_url('kdrama-rom-1', 400), p_url('kdrama-rom-2', 400), p_url('kdrama-rom-3', 400)],
      },
      {
        id: 'kdrama-idol', name: 'K-Pop Idol',
        prompt: 'K-pop idol portrait, flawless skin, stylish outfit, charismatic expression, stage lighting',
        thumbnail: p_url('kdrama-idol'), tagline: 'Charismatic idol visuals.', tags: ['k-drama', 'k-pop', 'idol', 'portrait'],
        previewImages: [p_url('kdrama-idol-1', 400), p_url('kdrama-idol-2', 400), p_url('kdrama-idol-3', 400)],
      },
    ]
  },
  {
    id: 'anime-stylized',
    name: 'Anime & Stylized',
    icon: Palette,
    presets: [
      {
        id: 'pixar-3d', name: 'Pixar-Style 3D',
        prompt: '3D animated character, Pixar style, soft lighting, detailed textures, vibrant colors, charming expression',
        thumbnail: p_url('pixar-thumb'), tagline: 'Charming, family-friendly 3D characters.', tags: ['3d', 'pixar', 'cartoon', 'cute'],
        previewImages: [p_url('pixar-1', 400), p_url('pixar-2', 400), p_url('pixar-3', 400)],
      },
      {
        id: 'anime-manga', name: 'Modern Anime',
        prompt: 'modern anime manga style, detailed eyes, dynamic hair, sharp lines, vibrant colors, trending on pixiv',
        thumbnail: p_url('anime-thumb'), tagline: 'Vibrant and dynamic Japanese animation.', tags: ['anime', 'manga', 'cartoon', 'japanese'],
        previewImages: [p_url('anime-1', 400), p_url('anime-2', 400), p_url('anime-3', 400)],
      },
      {
        id: 'ghibli-style', name: 'Ghibli Style',
        prompt: 'Studio Ghibli inspired art, painterly background, whimsical character, nostalgic and heartwarming',
        thumbnail: p_url('ghibli-thumb'), tagline: 'Nostalgic, heartwarming animation.', tags: ['anime', 'ghibli', 'painterly'],
        previewImages: [p_url('ghibli-1', 400), p_url('ghibli-2', 400), p_url('ghibli-3', 400)],
      },
      {
        id: 'character-sheet', name: 'Character Sheet',
        prompt: 'game character design sheet, multiple views, turnaround, detailed concept art, clean background',
        thumbnail: p_url('charsheet-thumb'), tagline: 'For game and animation concepts.', tags: ['character design', 'concept art', 'game'],
        previewImages: [p_url('charsheet-1', 400), p_url('charsheet-2', 400), p_url('charsheet-3', 400)],
      },
    ]
  },
  {
    id: 'sci-fi',
    name: 'Cyberpunk Neon',
    icon: Bot,
    presets: [
       {
        id: 'cyberpunk-char', name: 'Cyberpunk',
        prompt: 'cyberpunk character, neon-lit, futuristic clothing, cybernetic enhancements, dystopian city background',
        thumbnail: p_url('cyberpunk-char-thumb'), tagline: 'High-tech rebels in a neon future.', tags: ['cyberpunk', 'sci-fi', 'futuristic', 'neon'],
        previewImages: [p_url('cyberpunk-1', 400), p_url('cyberpunk-2', 400), p_url('cyberpunk-3', 400)],
      },
      {
        id: 'game-ready', name: 'Game-Ready Model',
        prompt: 'game-ready 3d model render, realistic PBR textures, neutral pose, Unreal Engine 5, high quality',
        thumbnail: p_url('gameready-thumb'), tagline: 'AAA-quality 3D model renders.', tags: ['3d', 'game', 'realistic', 'pbr'],
        previewImages: [p_url('gameready-1', 400), p_url('gameready-2', 400), p_url('gameready-3', 400)],
      },
    ]
  },
  {
    id: 'digital-painting',
    name: 'Digital Painting',
    icon: Paintbrush,
    presets: [
      {
        id: 'oil-painting', name: 'Oil Painting',
        prompt: 'classic oil painting, visible brush strokes, rich colors, detailed and textured, style of old masters',
        thumbnail: p_url('oil-thumb'), tagline: 'Rich, textured, classical paintings.', tags: ['art', 'painting', 'classic', 'oil'],
        previewImages: [p_url('oil-1', 400), p_url('oil-2', 400), p_url('oil-3', 400)],
      },
      {
        id: 'watercolor', name: 'Watercolor',
        prompt: 'watercolor painting, soft and translucent colors, wet-on-wet technique, delicate and expressive',
        thumbnail: p_url('water-thumb'), tagline: 'Light, airy, and expressive artwork.', tags: ['art', 'painting', 'watercolor', 'soft'],
        previewImages: [p_url('watercolor-1', 400), p_url('watercolor-2', 400), p_url('watercolor-3', 400)],
      },
    ]
  },
  {
    id: 'vintage',
    name: 'Vintage Film',
    icon: Camera,
    presets: [
       {
        id: 'vintage-photo', name: 'Vintage Photo',
        prompt: 'vintage photograph, sepia tones, old-fashioned, grainy, 1920s style',
        thumbnail: p_url('vintage-photo-thumb'), tagline: 'Nostalgic, grainy film look.', tags: ['vintage', 'retro', 'film', 'sepia'],
        previewImages: [p_url('vintage-1', 400), p_url('vintage-2', 400), p_url('vintage-3', 400)],
      },
      {
        id: '90s-film', name: '90s Film Look',
        prompt: '90s film photography, grainy, slightly faded colors, nostalgic vibe, disposable camera look',
        thumbnail: p_url('90s-film-thumb'), tagline: 'Authentic 90s nostalgia.', tags: ['vintage', '90s', 'retro', 'film'],
        previewImages: [p_url('90s-1', 400), p_url('90s-2', 400), p_url('90s-3', 400)],
      },
    ]
  },
  {
    id: 'viral-styles',
    name: 'TikTok Viral Styles',
    icon: TrendingUp,
    presets: [
      {
        id: 'ai-fashion-shoot', name: 'AI Fashion Shoot',
        prompt: 'hyperrealistic full-body shot of an AI-generated fashion model, haute couture, walking on a runway, editorial lighting, Vogue aesthetic',
        thumbnail: p_url('fashion-thumb'), tagline: 'Create stunning, hyper-real models.', tags: ['fashion', 'realistic', 'portrait', 'vogue'],
        previewImages: [p_url('fashion-1', 400), p_url('fashion-2', 400), p_url('fashion-3', 400)],
      },
      {
        id: 'glowy-skin-portrait', name: 'Glowy Skin',
        prompt: 'dreamy portrait with glowing skin, soft focus, ethereal lighting, pastel colors, fantasy glow, bloom effect',
        thumbnail: p_url('glow-thumb'), tagline: 'Ethereal portraits with a magical glow.', tags: ['portrait', 'fantasy', 'glow', 'dreamy'],
        previewImages: [p_url('glow-1', 400), p_url('glow-2', 400), p_url('glow-3', 400)],
      },
      {
        id: 'y2k-glossy', name: 'Y2K Glossy',
        prompt: 'Y2K aesthetic, glossy 3D character, cybercore, airbrush finish, iridescent and holographic materials, pink and chrome, early 2000s vibe',
        thumbnail: p_url('y2k-thumb'), tagline: 'Nostalgic, glossy, early 2000s style.', tags: ['y2k', '3d', 'glossy', 'cyber'],
        previewImages: [p_url('y2k-1', 400), p_url('y2k-2', 400), p_url('y2k-3', 400)],
      },
    ]
  }
];
