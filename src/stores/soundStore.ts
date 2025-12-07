// Audio Manager Store - Complete audio system with SFX and Music

import { create } from 'zustand';
import { Audio, AVPlaybackSource } from 'expo-av';
import { Platform } from 'react-native';

// Sound effect types
export type SoundName =
  | 'yippee'
  | 'oh_no'
  | 'click'
  | 'dig'
  | 'build'
  | 'splash'
  | 'splat'
  | 'explosion'
  | 'steel_clink'
  | 'spawn'
  | 'blocker'
  | 'climber'
  | 'floater'
  | 'miner'
  | 'basher'
  | 'builder_step'
  | 'level_complete'
  | 'level_fail'
  | 'nuke'
  | 'pause'
  | 'unpause'
  | 'countdown_tick';

// Music track types
export type MusicTrack =
  | 'menu'
  | 'gameplay_fun'
  | 'gameplay_tricky'
  | 'gameplay_taxing'
  | 'gameplay_mayhem'
  | 'victory'
  | 'defeat';

interface SoundStore {
  // SFX
  sounds: Map<SoundName, Audio.Sound>;
  soundPool: Map<SoundName, Audio.Sound[]>;

  // Music
  currentMusic: Audio.Sound | null;
  currentMusicTrack: MusicTrack | null;
  musicTracks: Map<MusicTrack, string>;

  // State
  isLoaded: boolean;
  sfxVolume: number;
  musicVolume: number;
  isSfxMuted: boolean;
  isMusicMuted: boolean;

  // SFX Actions
  preloadAllSounds: () => Promise<void>;
  playSound: (name: SoundName, options?: { volume?: number; rate?: number }) => Promise<void>;
  stopSound: (name: SoundName) => Promise<void>;
  setSfxVolume: (volume: number) => void;
  toggleSfxMute: () => void;

  // Music Actions
  playMusic: (track: MusicTrack, loop?: boolean) => Promise<void>;
  stopMusic: () => Promise<void>;
  pauseMusic: () => Promise<void>;
  resumeMusic: () => Promise<void>;
  setMusicVolume: (volume: number) => void;
  toggleMusicMute: () => void;
  crossfadeTo: (track: MusicTrack, duration?: number) => Promise<void>;

  // Utility
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  cleanup: () => Promise<void>;
}

// Silent WAV for placeholder sounds
const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

// Create a placeholder sound that works cross-platform
const createPlaceholderSound = async (): Promise<Audio.Sound> => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: SILENT_WAV },
      { shouldPlay: false }
    );
    return sound;
  } catch {
    // Return a mock sound object if creation fails
    return {
      setVolumeAsync: async () => {},
      setPositionAsync: async () => {},
      setRateAsync: async () => {},
      playAsync: async () => {},
      pauseAsync: async () => {},
      stopAsync: async () => {},
      unloadAsync: async () => {},
      setIsLoopingAsync: async () => {},
      getStatusAsync: async () => ({ isLoaded: false }),
    } as unknown as Audio.Sound;
  }
};

// Pool size for frequently used sounds
const POOL_SIZE = 3;
const POOLED_SOUNDS: SoundName[] = ['dig', 'build', 'click', 'spawn', 'builder_step'];

// All sound names for preloading
const ALL_SOUNDS: SoundName[] = [
  'yippee', 'oh_no', 'click', 'dig', 'build', 'splash', 'splat',
  'explosion', 'steel_clink', 'spawn', 'blocker', 'climber', 'floater',
  'miner', 'basher', 'builder_step', 'level_complete', 'level_fail',
  'nuke', 'pause', 'unpause', 'countdown_tick',
];

export const useSoundStore = create<SoundStore>((set, get) => ({
  // SFX
  sounds: new Map(),
  soundPool: new Map(),

  // Music
  currentMusic: null,
  currentMusicTrack: null,
  musicTracks: new Map([
    ['menu', 'assets/audio/music/menu.mp3'],
    ['gameplay_fun', 'assets/audio/music/fun.mp3'],
    ['gameplay_tricky', 'assets/audio/music/tricky.mp3'],
    ['gameplay_taxing', 'assets/audio/music/taxing.mp3'],
    ['gameplay_mayhem', 'assets/audio/music/mayhem.mp3'],
    ['victory', 'assets/audio/music/victory.mp3'],
    ['defeat', 'assets/audio/music/defeat.mp3'],
  ]),

  // State
  isLoaded: false,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  isSfxMuted: false,
  isMusicMuted: false,

  preloadAllSounds: async () => {
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const sounds = get().sounds;
      const soundPool = get().soundPool;

      // Load all sounds
      for (const name of ALL_SOUNDS) {
        try {
          const sound = await createPlaceholderSound();
          sounds.set(name, sound);
        } catch (e) {
          console.warn(`Failed to load sound: ${name}`);
        }
      }

      // Create sound pools for frequently used sounds
      for (const name of POOLED_SOUNDS) {
        const pool: Audio.Sound[] = [];
        for (let i = 0; i < POOL_SIZE; i++) {
          try {
            const sound = await createPlaceholderSound();
            pool.push(sound);
          } catch (e) {
            // Ignore pool creation errors
          }
        }
        soundPool.set(name, pool);
      }

      set({ isLoaded: true });
    } catch (error) {
      console.warn('Failed to initialize audio', error);
      set({ isLoaded: true }); // Continue anyway
    }
  },

  playSound: async (name: SoundName, options?: { volume?: number; rate?: number }) => {
    const { sounds, soundPool, isSfxMuted, sfxVolume } = get();
    if (isSfxMuted) return;

    const effectiveVolume = (options?.volume ?? 1) * sfxVolume;
    const rate = options?.rate ?? 1;

    // Try to use pooled sound first
    const pool = soundPool.get(name);
    if (pool && pool.length > 0) {
      // Round-robin through pool
      const sound = pool.shift()!;
      pool.push(sound);

      try {
        await sound.setVolumeAsync(effectiveVolume);
        if (rate !== 1) {
          await sound.setRateAsync(rate, true);
        }
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch (error) {
        console.warn(`Failed to play pooled sound: ${name}`, error);
      }
      return;
    }

    // Fall back to single sound
    const sound = sounds.get(name);
    if (!sound) return;

    try {
      await sound.setVolumeAsync(effectiveVolume);
      if (rate !== 1) {
        await sound.setRateAsync(rate, true);
      }
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.warn(`Failed to play sound: ${name}`, error);
    }
  },

  stopSound: async (name: SoundName) => {
    const sound = get().sounds.get(name);
    if (sound) {
      try {
        await sound.stopAsync();
      } catch (error) {
        console.warn(`Failed to stop sound: ${name}`);
      }
    }
  },

  setSfxVolume: (volume: number) => {
    set({ sfxVolume: Math.max(0, Math.min(1, volume)) });
  },

  toggleSfxMute: () => {
    set((state) => ({ isSfxMuted: !state.isSfxMuted }));
  },

  // Music playback
  playMusic: async (track: MusicTrack, loop = true) => {
    const { currentMusic, currentMusicTrack, musicTracks, isMusicMuted, musicVolume } = get();

    // Don't restart same track
    if (currentMusicTrack === track && currentMusic) {
      return;
    }

    // Stop current music
    if (currentMusic) {
      try {
        await currentMusic.stopAsync();
        await currentMusic.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
    }

    // For now, use placeholder (in production, load actual music files)
    try {
      const music = await createPlaceholderSound();
      await music.setVolumeAsync(isMusicMuted ? 0 : musicVolume);
      await music.setIsLoopingAsync(loop);
      await music.playAsync();

      set({ currentMusic: music, currentMusicTrack: track });
    } catch (error) {
      console.warn(`Failed to play music: ${track}`, error);
    }
  },

  stopMusic: async () => {
    const { currentMusic } = get();
    if (currentMusic) {
      try {
        await currentMusic.stopAsync();
        await currentMusic.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
      set({ currentMusic: null, currentMusicTrack: null });
    }
  },

  pauseMusic: async () => {
    const { currentMusic } = get();
    if (currentMusic) {
      try {
        await currentMusic.pauseAsync();
      } catch (error) {
        console.warn('Failed to pause music', error);
      }
    }
  },

  resumeMusic: async () => {
    const { currentMusic, isMusicMuted } = get();
    if (currentMusic && !isMusicMuted) {
      try {
        await currentMusic.playAsync();
      } catch (error) {
        console.warn('Failed to resume music', error);
      }
    }
  },

  setMusicVolume: (volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    set({ musicVolume: newVolume });

    const { currentMusic, isMusicMuted } = get();
    if (currentMusic && !isMusicMuted) {
      currentMusic.setVolumeAsync(newVolume).catch(() => {});
    }
  },

  toggleMusicMute: () => {
    const { isMusicMuted, currentMusic, musicVolume } = get();
    const newMuted = !isMusicMuted;
    set({ isMusicMuted: newMuted });

    if (currentMusic) {
      currentMusic.setVolumeAsync(newMuted ? 0 : musicVolume).catch(() => {});
    }
  },

  crossfadeTo: async (track: MusicTrack, duration = 1000) => {
    const { currentMusic, musicVolume, isMusicMuted } = get();

    // Create new music track
    const newMusic = await createPlaceholderSound();
    await newMusic.setVolumeAsync(0);
    await newMusic.setIsLoopingAsync(true);
    await newMusic.playAsync();

    // Crossfade
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const oldVolume = (1 - progress) * (isMusicMuted ? 0 : musicVolume);
      const newVolume = progress * (isMusicMuted ? 0 : musicVolume);

      if (currentMusic) {
        await currentMusic.setVolumeAsync(oldVolume);
      }
      await newMusic.setVolumeAsync(newVolume);

      await new Promise((resolve) => setTimeout(resolve, stepDuration));
    }

    // Cleanup old music
    if (currentMusic) {
      await currentMusic.stopAsync();
      await currentMusic.unloadAsync();
    }

    set({ currentMusic: newMusic, currentMusicTrack: track });
  },

  // Legacy compatibility
  setVolume: (volume: number) => {
    get().setSfxVolume(volume);
    get().setMusicVolume(volume);
  },

  toggleMute: () => {
    get().toggleSfxMute();
    get().toggleMusicMute();
  },

  cleanup: async () => {
    const { sounds, soundPool, currentMusic } = get();

    // Cleanup SFX
    for (const sound of sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
    }
    sounds.clear();

    // Cleanup sound pools
    for (const pool of soundPool.values()) {
      for (const sound of pool) {
        try {
          await sound.unloadAsync();
        } catch {
          // Ignore cleanup errors
        }
      }
    }
    soundPool.clear();

    // Cleanup music
    if (currentMusic) {
      try {
        await currentMusic.stopAsync();
        await currentMusic.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
    }

    set({
      isLoaded: false,
      currentMusic: null,
      currentMusicTrack: null,
    });
  },
}));

// Helper function to get music track for difficulty
export function getMusicTrackForCategory(category: string): MusicTrack {
  switch (category.toLowerCase()) {
    case 'fun':
      return 'gameplay_fun';
    case 'tricky':
      return 'gameplay_tricky';
    case 'taxing':
      return 'gameplay_taxing';
    case 'mayhem':
      return 'gameplay_mayhem';
    default:
      return 'gameplay_fun';
  }
}
