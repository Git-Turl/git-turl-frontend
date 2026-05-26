import { Mp3Encoder } from '@breezystack/lamejs';

const MP3_KBPS = 128;
const SAMPLE_BLOCK = 1152;

const toInt16 = (channel: Float32Array): Int16Array => {
  const out = new Int16Array(channel.length);
  for (let i = 0; i < channel.length; i++) {
    const s = Math.max(-1, Math.min(1, channel[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
};

/**
 * Web Audio API로 webm/opus 등 임의 오디오 Blob을 디코딩한 뒤
 * lamejs로 mp3 Blob을 인코딩해 반환한다.
 */
export const encodeBlobToMp3 = async (input: Blob): Promise<Blob> => {
  const arrayBuffer = await input.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioCtx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    audioCtx.close();
  }

  const channels = Math.min(decoded.numberOfChannels, 2);
  const sampleRate = decoded.sampleRate;
  const encoder = new Mp3Encoder(channels, sampleRate, MP3_KBPS);

  const left = toInt16(decoded.getChannelData(0));
  const right =
    channels === 2 ? toInt16(decoded.getChannelData(1)) : undefined;

  const mp3Chunks: Uint8Array[] = [];
  for (let i = 0; i < left.length; i += SAMPLE_BLOCK) {
    const leftChunk = left.subarray(i, i + SAMPLE_BLOCK);
    const buf = right
      ? encoder.encodeBuffer(leftChunk, right.subarray(i, i + SAMPLE_BLOCK))
      : encoder.encodeBuffer(leftChunk);
    if (buf.length > 0) mp3Chunks.push(buf);
  }
  const flush = encoder.flush();
  if (flush.length > 0) mp3Chunks.push(flush);

  return new Blob(mp3Chunks as BlobPart[], { type: 'audio/mpeg' });
};
