// Scene Explorer State Store

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

export interface PlacedObject {
  id: string;
  modelUrl: string;
  modelName: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isStatic: boolean;
}

export interface Scene {
  id: string;
  name: string;
  placedObjects: PlacedObject[];
  createdAt: string;
  updatedAt: string;
}

interface SceneStore {
  scenes: Scene[];
  currentScene: Scene | null;
  placedObjects: PlacedObject[];
  selectedObjectId: string | null;

  createScene: (name: string) => Scene;
  loadScene: (id: string) => void;
  saveScene: () => void;
  deleteScene: (id: string) => void;

  addObject: (object: Omit<PlacedObject, 'id'>) => string;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<PlacedObject>) => void;
  selectObject: (id: string | null) => void;
  clearScene: () => void;
}

// Storage abstraction
const storage = Platform.OS === 'web'
  ? {
      getItem: (name: string) => Promise.resolve(localStorage.getItem(name)),
      setItem: (name: string, value: string) => {
        localStorage.setItem(name, value);
        return Promise.resolve();
      },
      removeItem: (name: string) => {
        localStorage.removeItem(name);
        return Promise.resolve();
      },
    }
  : createJSONStorage(() => ({
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    }));

let nextObjectId = 0;

export const useSceneStore = create<SceneStore>()(
  persist(
    (set, get) => ({
      scenes: [],
      currentScene: null,
      placedObjects: [],
      selectedObjectId: null,

      createScene: (name: string) => {
        const scene: Scene = {
          id: `scene-${Date.now()}`,
          name,
          placedObjects: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          scenes: [...state.scenes, scene],
          currentScene: scene,
          placedObjects: [],
          selectedObjectId: null,
        }));

        return scene;
      },

      loadScene: (id: string) => {
        const scene = get().scenes.find((s) => s.id === id);
        if (scene) {
          set({
            currentScene: scene,
            placedObjects: [...scene.placedObjects],
            selectedObjectId: null,
          });
        } else {
          // Create default scene
          get().createScene('Default Scene');
        }
      },

      saveScene: () => {
        const { currentScene, placedObjects } = get();
        if (!currentScene) return;

        const updatedScene: Scene = {
          ...currentScene,
          placedObjects: [...placedObjects],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          scenes: state.scenes.map((s) =>
            s.id === currentScene.id ? updatedScene : s
          ),
          currentScene: updatedScene,
        }));
      },

      deleteScene: (id: string) => {
        set((state) => ({
          scenes: state.scenes.filter((s) => s.id !== id),
          currentScene:
            state.currentScene?.id === id ? null : state.currentScene,
          placedObjects:
            state.currentScene?.id === id ? [] : state.placedObjects,
        }));
      },

      addObject: (object: Omit<PlacedObject, 'id'>) => {
        const id = `obj-${nextObjectId++}`;
        const newObject: PlacedObject = { ...object, id };

        set((state) => ({
          placedObjects: [...state.placedObjects, newObject],
        }));

        return id;
      },

      removeObject: (id: string) => {
        set((state) => ({
          placedObjects: state.placedObjects.filter((o) => o.id !== id),
          selectedObjectId:
            state.selectedObjectId === id ? null : state.selectedObjectId,
        }));
      },

      updateObject: (id: string, updates: Partial<PlacedObject>) => {
        set((state) => ({
          placedObjects: state.placedObjects.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        }));
      },

      selectObject: (id: string | null) => {
        set({ selectedObjectId: id });
      },

      clearScene: () => {
        set({
          placedObjects: [],
          selectedObjectId: null,
        });
      },
    }),
    {
      name: 'lemmings-scene-storage',
      storage,
      partialize: (state) => ({ scenes: state.scenes }),
    }
  )
);
