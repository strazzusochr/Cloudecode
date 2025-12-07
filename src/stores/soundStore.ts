// Audio Manager Store

import { create } from 'zustand';
import { Audio, AVPlaybackSource } from 'expo-av';

type SoundName =
  | 'yippee'
  | 'oh_no'
  | 'click'
  | 'dig'
  | 'build'
  | 'splash'
  | 'splat'
  | 'explosion'
  | 'steel_clink'
  | 'spawn';

interface SoundStore {
  sounds: Map<SoundName, Audio.Sound>;
  isLoaded: boolean;
  volume: number;
  isMuted: boolean;

  preloadAllSounds: () => Promise<void>;
  playSound: (name: SoundName) => Promise<void>;
  stopSound: (name: SoundName) => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  cleanup: () => Promise<void>;
}

// Placeholder sound sources (in a real app, these would be actual audio files)
// Using silent sounds or generating them programmatically for now
const createPlaceholderSound = async (): Promise<Audio.Sound> => {
  const { sound } = await Audio.Sound.createAsync(
    // Using a simple approach - in production, use real audio files
    { uri: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA' },
    { shouldPlay: false }
  );
  return sound;
};

export const useSoundStore = create<SoundStore>((set, get) => ({
  sounds: new Map(),
  isLoaded: false,
  volume: 1.0,
  isMuted: false,

  preloadAllSounds: async () => {
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const sounds = get().sounds;
      const soundNames: SoundName[] = [
        'yippee',
        'oh_no',
        'click',
        'dig',
        'build',
        'splash',
        'splat',
        'explosion',
        'steel_clink',
        'spawn',
      ];

      // In a real app, load actual sound files
      // For now, create placeholder sounds
      for (const name of soundNames) {
        try {
          const sound = await createPlaceholderSound();
          sounds.set(name, sound);
        } catch (e) {
          console.warn(`Failed to load sound: ${name}`);
        }
      }

      set({ isLoaded: true });
    } catch (error) {
      console.warn('Failed to initialize audio', error);
      set({ isLoaded: true }); // Continue anyway
    }
  },

  playSound: async (name: SoundName) => {
    const { sounds, isMuted, volume } = get();
    if (isMuted) return;

    const sound = sounds.get(name);
    if (!sound) return;

    try {
      await sound.setVolumeAsync(volume);
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

  setVolume: (volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    set({ volume: newVolume });

    // Update volume for all loaded sounds
    const { sounds } = get();
    sounds.forEach((sound) => {
      sound.setVolumeAsync(newVolume).catch(() => {});
    });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  cleanup: async () => {
    const { sounds } = get();

    for (const sound of sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    sounds.clear();
    set({ isLoaded: false });
  },
}));
