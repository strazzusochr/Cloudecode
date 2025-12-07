// 3D Asset Library Store

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface Asset {
  id: string;
  name: string;
  url: string;
  tags: string[];
  thumbnail: string;
  createdAt: string;
}

interface AssetStore {
  assets: Asset[];
  searchTerm: string;

  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  setSearchTerm: (term: string) => void;
  getAssetById: (id: string) => Asset | undefined;
}

// Use localStorage on web, AsyncStorage on native
const storage = Platform.OS === 'web'
  ? {
      getItem: (name: string) => {
        const value = localStorage.getItem(name);
        return Promise.resolve(value);
      },
      setItem: (name: string, value: string) => {
        localStorage.setItem(name, value);
        return Promise.resolve();
      },
      removeItem: (name: string) => {
        localStorage.removeItem(name);
        return Promise.resolve();
      },
    }
  : createJSONStorage(() => AsyncStorage);

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      assets: [],
      searchTerm: '',

      addAsset: (asset: Asset) => {
        set((state) => ({
          assets: [...state.assets, asset],
        }));
      },

      removeAsset: (id: string) => {
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        }));
      },

      updateAsset: (id: string, updates: Partial<Asset>) => {
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      setSearchTerm: (term: string) => {
        set({ searchTerm: term });
      },

      getAssetById: (id: string) => {
        return get().assets.find((a) => a.id === id);
      },
    }),
    {
      name: 'lemmings-asset-storage',
      storage,
      partialize: (state) => ({ assets: state.assets }),
    }
  )
);
