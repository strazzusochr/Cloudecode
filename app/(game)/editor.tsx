import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { TerrainType } from '../../src/terrain/terrainUtils';

const { width, height } = Dimensions.get('window');
const GRID_WIDTH = 160;
const GRID_HEIGHT = 80;
const CELL_SIZE = Math.min((width - 200) / GRID_WIDTH, (height - 200) / GRID_HEIGHT, 6);

type BrushType = 'AIR' | 'SOLID' | 'STEEL' | 'WATER' | 'LAVA' | 'SPAWN' | 'EXIT';

const BRUSH_COLORS: Record<BrushType, string> = {
  AIR: '#000000',
  SOLID: '#8B5A2B',
  STEEL: '#808080',
  WATER: '#0066ff',
  LAVA: '#ff3300',
  SPAWN: '#00ff00',
  EXIT: '#ffff00',
};

const BRUSH_TERRAIN: Record<BrushType, TerrainType> = {
  AIR: TerrainType.AIR,
  SOLID: TerrainType.SOLID,
  STEEL: TerrainType.STEEL,
  WATER: TerrainType.WATER,
  LAVA: TerrainType.LAVA,
  SPAWN: TerrainType.SPAWN,
  EXIT: TerrainType.EXIT,
};

export default function EditorScreen() {
  const [terrain, setTerrain] = useState<Uint8Array>(() => new Uint8Array(GRID_WIDTH * GRID_HEIGHT));
  const [selectedBrush, setSelectedBrush] = useState<BrushType>('SOLID');
  const [brushSize, setBrushSize] = useState(1);
  const [levelName, setLevelName] = useState('My Level');
  const [isDrawing, setIsDrawing] = useState(false);

  const spawnRef = useRef<{ x: number; y: number } | null>(null);
  const exitRef = useRef<{ x: number; y: number } | null>(null);

  const paintCell = useCallback((x: number, y: number) => {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;

    setTerrain((prev) => {
      const next = new Uint8Array(prev);
      const halfSize = Math.floor(brushSize / 2);

      for (let dy = -halfSize; dy <= halfSize; dy++) {
        for (let dx = -halfSize; dx <= halfSize; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < GRID_WIDTH && py >= 0 && py < GRID_HEIGHT) {
            const index = py * GRID_WIDTH + px;
            next[index] = BRUSH_TERRAIN[selectedBrush];

            // Track spawn/exit positions
            if (selectedBrush === 'SPAWN') {
              spawnRef.current = { x: px, y: py };
            } else if (selectedBrush === 'EXIT') {
              exitRef.current = { x: px, y: py };
            }
          }
        }
      }
      return next;
    });
  }, [selectedBrush, brushSize]);

  const handleGridPress = useCallback((event: any) => {
    if (Platform.OS === 'web') {
      const rect = event.target.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);
      paintCell(x, y);
    }
  }, [paintCell]);

  const handleClear = useCallback(() => {
    setTerrain(new Uint8Array(GRID_WIDTH * GRID_HEIGHT));
    spawnRef.current = null;
    exitRef.current = null;
  }, []);

  const handleExport = useCallback(() => {
    if (!spawnRef.current || !exitRef.current) {
      Alert.alert('Error', 'Please place both SPAWN and EXIT points');
      return;
    }

    const levelData = {
      id: `custom-${Date.now()}`,
      name: levelName,
      category: 'CUSTOM',
      themeId: 'dirt',
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      terrain: Array.from(terrain),
      spawnPosition: spawnRef.current,
      exitPosition: exitRef.current,
      totalLemmings: 50,
      requiredSaved: 25,
      releaseRate: 50,
      timeLimit: 300,
      skills: {
        climber: 10,
        floater: 10,
        bomber: 10,
        blocker: 10,
        builder: 10,
        basher: 10,
        miner: 10,
        digger: 10,
      },
    };

    const json = JSON.stringify(levelData, null, 2);

    if (Platform.OS === 'web') {
      // Copy to clipboard on web
      navigator.clipboard?.writeText(json);
      Alert.alert('Exported!', 'Level JSON copied to clipboard');
    } else {
      Alert.alert('Level Data', json.substring(0, 500) + '...');
    }
  }, [terrain, levelName]);

  const brushes: BrushType[] = ['AIR', 'SOLID', 'STEEL', 'WATER', 'LAVA', 'SPAWN', 'EXIT'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LEVEL EDITOR</Text>
        <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
          <Text style={styles.exportButtonText}>EXPORT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>BRUSHES</Text>
          {brushes.map((brush) => (
            <TouchableOpacity
              key={brush}
              style={[
                styles.brushButton,
                { backgroundColor: BRUSH_COLORS[brush] },
                selectedBrush === brush && styles.brushButtonSelected,
              ]}
              onPress={() => setSelectedBrush(brush)}
            >
              <Text style={styles.brushButtonText}>{brush}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.toolbarTitle, { marginTop: 20 }]}>BRUSH SIZE</Text>
          <View style={styles.sizeContainer}>
            {[1, 3, 5, 7].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  brushSize === size && styles.sizeButtonSelected,
                ]}
                onPress={() => setBrushSize(size)}
              >
                <Text style={styles.sizeButtonText}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.toolbarTitle, { marginTop: 20 }]}>LEVEL NAME</Text>
          <TextInput
            style={styles.nameInput}
            value={levelName}
            onChangeText={setLevelName}
            placeholder="Level name"
            placeholderTextColor="#666"
          />

          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>CLEAR ALL</Text>
          </TouchableOpacity>
        </View>

        {/* Grid Canvas */}
        <ScrollView horizontal contentContainerStyle={styles.gridScrollContainer}>
          <ScrollView contentContainerStyle={styles.gridScrollContainer}>
            <View
              style={[
                styles.grid,
                { width: GRID_WIDTH * CELL_SIZE, height: GRID_HEIGHT * CELL_SIZE },
              ]}
              onTouchStart={() => setIsDrawing(true)}
              onTouchEnd={() => setIsDrawing(false)}
              onTouchMove={(e) => {
                if (isDrawing) {
                  const touch = e.nativeEvent.touches[0];
                  // Handle touch painting
                }
              }}
              {...(Platform.OS === 'web' ? {
                onMouseDown: (e: any) => {
                  setIsDrawing(true);
                  handleGridPress(e);
                },
                onMouseUp: () => setIsDrawing(false),
                onMouseMove: (e: any) => {
                  if (isDrawing) handleGridPress(e);
                },
                onMouseLeave: () => setIsDrawing(false),
              } : {})}
            >
              {/* Render terrain cells */}
              {Array.from({ length: GRID_HEIGHT }, (_, y) => (
                <View key={y} style={styles.gridRow}>
                  {Array.from({ length: GRID_WIDTH }, (_, x) => {
                    const index = y * GRID_WIDTH + x;
                    const type = terrain[index];
                    let color = '#111';
                    if (type === TerrainType.SOLID) color = BRUSH_COLORS.SOLID;
                    else if (type === TerrainType.STEEL) color = BRUSH_COLORS.STEEL;
                    else if (type === TerrainType.WATER) color = BRUSH_COLORS.WATER;
                    else if (type === TerrainType.LAVA) color = BRUSH_COLORS.LAVA;
                    else if (type === TerrainType.SPAWN) color = BRUSH_COLORS.SPAWN;
                    else if (type === TerrainType.EXIT) color = BRUSH_COLORS.EXIT;

                    return (
                      <View
                        key={x}
                        style={[
                          styles.gridCell,
                          { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: color },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Grid: {GRID_WIDTH}x{GRID_HEIGHT}</Text>
        <Text style={styles.infoText}>
          Spawn: {spawnRef.current ? `(${spawnRef.current.x}, ${spawnRef.current.y})` : 'Not set'}
        </Text>
        <Text style={styles.infoText}>
          Exit: {exitRef.current ? `(${exitRef.current.x}, ${exitRef.current.y})` : 'Not set'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    letterSpacing: 2,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  toolbar: {
    width: 150,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#3a3a5e',
  },
  toolbarTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  brushButton: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  brushButtonSelected: {
    borderColor: '#fff',
  },
  brushButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  sizeButton: {
    width: 35,
    height: 35,
    backgroundColor: '#2a2a4e',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sizeButtonSelected: {
    borderColor: '#4CAF50',
  },
  sizeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nameInput: {
    backgroundColor: '#2a2a4e',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gridScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    borderWidth: 0.5,
    borderColor: '#222',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#3a3a5e',
  },
  infoText: {
    color: '#888',
    fontSize: 12,
  },
});
