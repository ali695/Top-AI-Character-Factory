
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: BaseAudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function mixAudio(
  voiceBytes: Uint8Array,
  backgroundLayerId: string | null,
  options: {
    reverbAmount: number;
    backgroundVolume: number;
    speed: number;
    pitch: number;
  }
): Promise<Blob> {
  // Use a temporary context to create the initial buffer from raw bytes
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const tempCtx = new AudioContextClass({ sampleRate: 24000 });
  const voiceBuffer = await decodeAudioData(voiceBytes, tempCtx, 24000, 1);
  tempCtx.close();

  // Mapping options to AudioParams
  // Speed: 50 -> 1.0. Range 0.5 to 1.5
  const speedRate = 0.5 + (options.speed / 100); 
  // Pitch: 50 -> 0. Range -600 to +600 cents (detune)
  const detune = (options.pitch - 50) * 12;

  // Calculate duration
  const voiceDuration = voiceBuffer.duration / speedRate;
  const outputDuration = voiceDuration + 2.0; // Add tail for reverb
  const sampleRate = 24000;

  const offlineCtx = new OfflineAudioContext(1, Math.ceil(outputDuration * sampleRate), sampleRate);

  // Voice Source
  const source = offlineCtx.createBufferSource();
  source.buffer = voiceBuffer;
  source.playbackRate.value = speedRate;
  source.detune.value = detune;

  // Reverb
  const wetGain = offlineCtx.createGain();
  // reverbAmount 0-100. Max wet gain 0.5
  wetGain.gain.value = (options.reverbAmount / 100) * 0.5;

  const dryGain = offlineCtx.createGain();
  dryGain.gain.value = 1.0;

  if (options.reverbAmount > 0) {
    const convolver = offlineCtx.createConvolver();
    convolver.buffer = createImpulseResponse(offlineCtx, 2.0, 2.0);
    source.connect(convolver);
    convolver.connect(wetGain);
  }

  wetGain.connect(offlineCtx.destination);
  source.connect(dryGain);
  dryGain.connect(offlineCtx.destination);

  // Background Layer
  if (backgroundLayerId && backgroundLayerId !== 'none') {
    const bgGain = offlineCtx.createGain();
    bgGain.gain.value = (options.backgroundVolume / 100) * 0.25; // Scale down bg volume
    
    const bgSource = createSyntheticBackground(offlineCtx, backgroundLayerId, outputDuration);
    if (bgSource) {
      bgSource.connect(bgGain);
      bgGain.connect(offlineCtx.destination);
      bgSource.start();
    }
  }

  source.start();

  const renderedBuffer = await offlineCtx.startRendering();
  return bufferToWav(renderedBuffer);
}

function createImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number) {
  const length = ctx.sampleRate * duration;
  const impulse = ctx.createBuffer(1, length, ctx.sampleRate);
  const impulseData = impulse.getChannelData(0);

  for (let i = 0; i < length; i++) {
    impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return impulse;
}

function createSyntheticBackground(ctx: BaseAudioContext, type: string, duration: number): AudioScheduledSourceNode | null {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Simple Noise Generation with minimal shaping
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  // Very basic filtering/shaping based on type to simulate ambiance without assets
  if (type === 'rain') {
    // Pink-ish noise approximation
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        data[i] = b0 + b1 + b2 + white * 0.1848;
    }
  } else if (type === 'night') {
      // Quiet with sine tones
      for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 0.1) + (Math.sin(i * 0.001) * 0.05);
      }
  } else if (type === 'fire') {
      // Crackle
       for (let i = 0; i < bufferSize; i++) {
           data[i] = (Math.random() > 0.95 ? Math.random() : 0) * 0.5;
       }
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  return src;
}

function bufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });
}
