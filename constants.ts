
import { ArtStyle, VoiceCategory } from './types';
import { Camera, Film, Tv2, ZoomIn, Brush, User, Swords, Rocket, FlaskConical, Smile, BookHeart, Ghost, Gamepad2, Scissors, Mic, Moon, Flame, Music, CloudRain, Speaker, TrendingUp, BookOpen, Heart, Globe, Paintbrush, Sparkles } from 'lucide-react';

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
    id: 'cartoon',
    name: 'Cartoon',
    prompt_suffix: 'western cartoon style, 2D flat animation, bold lines, expressive characters, vibrant flat colors',
    icon: Smile
  },
  {
    id: 'storybook',
    name: 'Storybook',
    prompt_suffix: 'whimsical storybook illustration, watercolor and ink, soft pastel colors, magical atmosphere, highly detailed background',
    icon: BookHeart
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
    id: 'horror',
    name: 'Horror',
    prompt_suffix: 'horror theme, dark, eerie, unsettling, dramatic shadows, grimy texture, scary atmosphere',
    icon: Ghost
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    prompt_suffix: 'sci-fi concept art, futuristic, high-tech, cyberpunk aesthetic, neon lighting',
    icon: Rocket
  },
  {
    id: 'retro-game',
    name: 'Retro Game',
    prompt_suffix: 'pixel art, 16-bit graphics, retro game style, dithering, vibrant sprites',
    icon: Gamepad2
  },
  {
    id: 'papercraft',
    name: 'Papercraft',
    prompt_suffix: 'layered papercraft style, paper texture, depth of field, origami look, soft shadows',
    icon: Scissors
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

export const VOICE_CATEGORIES: VoiceCategory[] = [
  {
    id: 'quranic',
    name: 'Quranic Recitation',
    icon: BookOpen,
    voices: [
      { id: 'mishary', name: 'Mishary Alafasy', description: 'Emotional, clear, melodic', gender: 'male' },
      { id: 'sudais', name: 'Sheikh Sudais', description: 'Powerful, resonant, Grand Mosque style', gender: 'male' },
      { id: 'minshawi', name: 'Al-Minshawi', description: 'Classic, emotional, tarteel', gender: 'male' },
      { id: 'husary', name: 'Al-Husary', description: 'Precise, slow, educational', gender: 'male' },
      { id: 'abdulbasit', name: 'Abdul Basit', description: 'High pitch, breath control, legendary', gender: 'male' },
      { id: 'ghamidi', name: 'Saad Al Ghamidi', description: 'Soft, soothing, rhythmic', gender: 'male' },
      { id: 'maher', name: 'Maher Al Muaiqly', description: 'Deep, flowing, emotional', gender: 'male' },
      { id: 'shuraim', name: 'Saud Al-Shuraim', description: 'Fast-paced, energetic', gender: 'male' },
    ]
  },
  {
    id: 'naat-noha',
    name: 'Naat / Noha',
    icon: Moon,
    voices: [
      { id: 'naat-pak', name: 'Pakistani Naat', description: 'Urdu accent, melodic, reverbed', gender: 'male' },
      { id: 'naat-ind', name: 'Indian Naat', description: 'Classical style, harmonic', gender: 'male' },
      { id: 'noha-deep', name: 'Noha Reciter (Deep)', description: 'Mournful, bass-heavy, slow', gender: 'male' },
      { id: 'noha-youth', name: 'Noha Reciter (Youth)', description: 'Energetic, high pitch, passionate', gender: 'male' },
      { id: 'noha-female', name: 'Female Noha Whisper', description: 'Soft, grieving, emotional', gender: 'female' },
      { id: 'naat-slow', name: 'Emotional Naat Slow', description: 'Very slow, crying tone', gender: 'male' },
      { id: 'naat-studio', name: 'Harmonic Naat Studio', description: 'Auto-tuned, chorus effect', gender: 'male' },
    ]
  },
  {
    id: 'fairy-tale',
    name: 'Fairy Tale & Cartoon',
    icon: Smile,
    voices: [
      { id: 'cartoon-boy', name: 'Cartoon Boy', description: 'High energy, youthful, adventurous', gender: 'male' },
      { id: 'cartoon-girl', name: 'Cartoon Girl', description: 'Sweet, bubbly, Disney-style', gender: 'female' },
      { id: 'magical-narrator', name: 'Magical Narrator', description: 'Whimsical, soft, storytelling', gender: 'female' },
      { id: 'disney-whisper', name: 'Disney-Style Whisper', description: 'Soft, enchanting, melodic', gender: 'female' },
      { id: 'fairy-queen', name: 'Fairy Queen', description: 'Ethereal, echoey, regal', gender: 'female' },
      { id: 'hobbit', name: 'Hobbit Storyteller', description: 'Warm, rustic, friendly', gender: 'male' },
    ]
  },
  {
    id: 'ultra-horror',
    name: 'Ultra Horror',
    icon: Ghost,
    voices: [
      { id: 'demonic', name: 'Demonic Entity', description: 'Distorted, deep, dual-layered', gender: 'male' },
      { id: 'eerie', name: 'Eerie Whisper', description: 'Close-mic, unsettling, breathy', gender: 'neutral' },
      { id: 'ghostly', name: 'Ghostly Wail', description: 'High pitch, reverb-heavy, distant', gender: 'female' },
      { id: 'terrified', name: 'Terrified Victim', description: 'Shaky, fast breathing, panic', gender: 'female' },
      { id: 'poltergeist', name: 'Poltergeist', description: 'Static interference, robotic glitch', gender: 'neutral' },
      { id: 'dark-possession', name: 'Dark Possession', description: 'Guttural, growling, intense', gender: 'male' },
    ]
  },
  {
    id: 'soft-intimate',
    name: 'Soft Intimate (Safe)',
    icon: Heart,
    voices: [
      { id: 'asmr-whisper', name: 'ASMR Whisper', description: 'Binaural, extremely close, tingling', gender: 'female' },
      { id: 'gentle-female', name: 'Female Gentle', description: 'Kind, caring, soft-spoken', gender: 'female' },
      { id: 'velvet', name: 'Velvet Whisper', description: 'Smooth, rich, relaxing', gender: 'female' },
      { id: 'warm-intimate', name: 'Warm Intimate', description: 'Cozy, personal, close proximity', gender: 'female' },
      { id: 'deep-sweet', name: 'Deep Sweet Female', description: 'Lower register, soothing, melodic', gender: 'female' },
      { id: 'breathy-girl', name: 'Breathy Soft Girl', description: 'Airy, light, delicate', gender: 'female' },
      { id: 'romantic', name: 'Romantic Whisper', description: 'Loving, slow, emotional', gender: 'female' },
    ]
  },
  {
    id: 'narration',
    name: 'Narration & Story',
    icon: Mic,
    voices: [
      { id: 'action-narrator', name: 'Action Narrator', description: 'Trailer style, deep, gritty', gender: 'male' },
      { id: 'documentary', name: 'Deep Documentary', description: 'Attenborough style, observant', gender: 'male' },
      { id: 'news-anchor', name: 'News Anchor', description: 'Professional, neutral, clear', gender: 'neutral' },
      { id: 'jazz-dj', name: 'Smooth Jazz DJ', description: 'Late night radio, cool, deep', gender: 'male' },
      { id: 'therapist', name: 'Calm Therapist', description: 'Reassuring, slow, patient', gender: 'female' },
      { id: 'villain', name: 'The Villain', description: 'Sophisticated, cold, calculating', gender: 'male' },
      { id: 'pirate', name: 'Pirate Captain', description: 'Rough, accented, boisterous', gender: 'male' },
      { id: 'crying', name: 'Emotional Crying', description: 'Breaking voice, sad, tearful', gender: 'female' },
    ]
  },
  {
    id: 'social',
    name: 'Social Media',
    icon: TrendingUp,
    voices: [
      { id: 'tiktok-story', name: 'TikTok Story', description: 'The classic text-to-speech voice', gender: 'female' },
      { id: 'insta-reel', name: 'Instagram Reel', description: 'Upbeat, aesthetic, lifestyle', gender: 'female' },
      { id: 'youtube-narrator', name: 'YouTube Top 10', description: 'Fast, engaging, punchy', gender: 'male' },
      { id: 'podcast-host', name: 'Podcast Host', description: 'Conversational, dynamic, friendly', gender: 'male' },
      { id: 'gym-voice', name: 'Motivational Gym', description: 'Shouting, energetic, intense', gender: 'male' },
    ]
  },
  {
    id: 'relaxation',
    name: 'Relaxation',
    icon: Moon,
    voices: [
      { id: 'sleep-whisper', name: 'Sleep Whisper', description: 'Monotone, extremely slow, fading', gender: 'female' },
      { id: 'calm-monk', name: 'Calm Monk', description: 'Resonant, peaceful, spiritual', gender: 'male' },
      { id: 'breathing-guide', name: 'Deep Breathing', description: 'Paced, instructional, soft', gender: 'neutral' },
      { id: 'spa-therapist', name: 'Spa Therapist', description: 'Gentle, welcoming, light', gender: 'female' },
      { id: 'reiki', name: 'Reiki Energy', description: 'Ethereal, healing tone', gender: 'female' },
    ]
  },
  {
    id: 'accents',
    name: 'Accents',
    icon: Globe,
    voices: [
      { id: 'british-male', name: 'British Male', description: 'RP Accent, formal', gender: 'male' },
      { id: 'british-female', name: 'British Female', description: 'RP Accent, posh', gender: 'female' },
      { id: 'german-female', name: 'German Velvet', description: 'Soft German accent, precise', gender: 'female' },
      { id: 'turkish-soft', name: 'Turkish Soft', description: 'Melodic Turkish accent', gender: 'female' },
      { id: 'arabic-deep', name: 'Arabic Deep', description: 'Heavy Arabic accent, resonant', gender: 'male' },
      { id: 'desi-urdu', name: 'Desi Urdu Accent', description: 'South Asian lilt, warm', gender: 'male' },
      { id: 'african-warm', name: 'African Warm', description: 'Deep, storytelling warmth', gender: 'male' },
      { id: 'american-neutral', name: 'American Neutral', description: 'Standard US accent', gender: 'neutral' },
    ]
  },
  {
    id: 'languages',
    name: 'Languages',
    icon: Globe,
    voices: [
      { id: 'lang-urdu', name: 'Urdu', description: 'Native speaker', gender: 'neutral' },
      { id: 'lang-english', name: 'English', description: 'Native speaker', gender: 'neutral' },
      { id: 'lang-hindi', name: 'Hindi', description: 'Native speaker', gender: 'neutral' },
      { id: 'lang-arabic', name: 'Arabic', description: 'Native speaker', gender: 'neutral' },
      { id: 'lang-turkish', name: 'Turkish', description: 'Native speaker', gender: 'neutral' },
      { id: 'lang-german', name: 'German', description: 'Native speaker', gender: 'neutral' },
      { id: 'lang-malay', name: 'Malay', description: 'Native speaker', gender: 'neutral' },
      { id: 'lang-indo', name: 'Indonesian', description: 'Native speaker', gender: 'neutral' },
      { id: 'lang-french', name: 'French', description: 'Native speaker', gender: 'neutral' },
    ]
  }
];

export const VOICE_EMOTIONS = [
  'Action', 'Dramatic', 'Friendly', 'Whispering', 'Emotional', 'Soft ASMR', 
  'Documentary', 'Terror', 'Spiritual', 'Islamic Recitation', 'News Anchor', 
  'Smooth Jazz DJ', 'Villain', 'Pirate', 'Fairy Tale Teller'
];

export const BACKGROUND_LAYERS = [
  { id: 'none', name: 'None', icon: Speaker },
  { id: 'rain', name: 'Soft Rain', icon: CloudRain },
  { id: 'fire', name: 'Fire Crackling', icon: Flame },
  { id: 'horror-ambience', name: 'Horror Ambience', icon: Ghost },
  { id: 'studio-reverb', name: 'Studio Reverb', icon: Mic },
  { id: 'night', name: 'Night Ambience', icon: Moon },
  { id: 'quranic-echo', name: 'Quranic Echo Hall', icon: BookHeart },
  { id: 'battle', name: 'Battle Scene', icon: Swords },
  { id: 'crowd', name: 'Crowd Noise', icon: User },
  { id: 'heartbeat', name: 'Heartbeat', icon: Heart },
  { id: 'horror-drone', name: 'Horror Drone', icon: Ghost },
  { id: 'soft-pads', name: 'Soft Pads', icon: Music },
  { id: 'meditation', name: 'Meditation Bells', icon: Sparkles },
  { id: 'muharram', name: 'Muharram Chest-Beat', icon: User },
];
