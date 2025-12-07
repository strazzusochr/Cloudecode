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
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { TerrainType } from '../../src/terrain/terrainUtils';
import { SkillType } from '../../src/types/game';
import { THEME_IDS, getThemeConfig } from '../../src/themes';

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

const SKILL_NAMES: SkillType[] = ['CLIMBER', 'FLOATER', 'BOMBER', 'BLOCKER', 'BUILDER', 'BASHER', 'MINER', 'DIGGER'];

interface LevelSettings {
  totalLemmings: number;
  requiredSaved: number;
  releaseRate: number;
  timeLimit: number;
  themeId: string;
  skills: Record<string, number>;
}

export default function EditorScreen() {
  const [terrain, setTerrain] = useState<Uint8Array>(() => new Uint8Array(GRID_WIDTH * GRID_HEIGHT));
  const [selectedBrush, setSelectedBrush] = useState<BrushType>('SOLID');
  const [brushSize, setBrushSize] = useState(1);
  const [levelName, setLevelName] = useState('My Level');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [settings, setSettings] = useState<LevelSettings>({
    totalLemmings: 50,
    requiredSaved: 25,
    releaseRate: 50,
    timeLimit: 300,
    themeId: 'dirt',
    skills: {
      CLIMBER: 10,
      FLOATER: 10,
      BOMBER: 10,
      BLOCKER: 10,
      BUILDER: 10,
      BASHER: 10,
      MINER: 10,
      DIGGER: 10,
    },
  });

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

  const updateSetting = useCallback(<K extends keyof LevelSettings>(
    key: K,
    value: LevelSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSkill = useCallback((skill: string, value: number) => {
    setSettings((prev) => ({
      ...prev,
      skills: { ...prev.skills, [skill]: Math.max(0, Math.min(99, value)) },
    }));
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
      themeId: settings.themeId,
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      terrain: Array.from(terrain),
      spawnPosition: spawnRef.current,
      exitPosition: exitRef.current,
      totalLemmings: settings.totalLemmings,
      requiredSaved: settings.requiredSaved,
      releaseRate: settings.releaseRate,
      timeLimit: settings.timeLimit,
      skills: {
        climber: settings.skills.CLIMBER,
        floater: settings.skills.FLOATER,
        bomber: settings.skills.BOMBER,
        blocker: settings.skills.BLOCKER,
        builder: settings.skills.BUILDER,
        basher: settings.skills.BASHER,
        miner: settings.skills.MINER,
        digger: settings.skills.DIGGER,
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
  }, [terrain, levelName, settings]);

  const brushes: BrushType[] = ['AIR', 'SOLID', 'STEEL', 'WATER', 'LAVA', 'SPAWN', 'EXIT'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LEVEL EDITOR</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setShowSettingsModal(true)}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsButtonText}>SETTINGS</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>EXPORT</Text>
          </TouchableOpacity>
        </View>
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

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>LEVEL SETTINGS</Text>

            <ScrollView style={styles.modalScroll}>
              {/* Level Parameters */}
              <Text style={styles.sectionTitle}>Level Parameters</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Total Lemmings:</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateSetting('totalLemmings', Math.max(1, settings.totalLemmings - 5))}
                  >
                    <Text style={styles.numberButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{settings.totalLemmings}</Text>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateSetting('totalLemmings', Math.min(100, settings.totalLemmings + 5))}
                  >
                    <Text style={styles.numberButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Required Saved:</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateSetting('requiredSaved', Math.max(1, settings.requiredSaved - 5))}
                  >
                    <Text style={styles.numberButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{settings.requiredSaved}</Text>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateSetting('requiredSaved', Math.min(settings.totalLemmings, settings.requiredSaved + 5))}
                  >
                    <Text style={styles.numberButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Release Rate:</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateSetting('releaseRate', Math.max(1, settings.releaseRate - 5))}
                  >
                    <Text style={styles.numberButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{settings.releaseRate}</Text>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateSetting('releaseRate', Math.min(99, settings.releaseRate + 5))}
                  >
                    <Text style={styles.numberButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Time Limit (sec):</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateSetting('timeLimit', Math.max(60, settings.timeLimit - 30))}
                  >
                    <Text style={styles.numberButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{settings.timeLimit}</Text>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateSetting('timeLimit', Math.min(600, settings.timeLimit + 30))}
                  >
                    <Text style={styles.numberButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Theme Selection */}
              <Text style={styles.sectionTitle}>Theme</Text>
              <View style={styles.themeGrid}>
                {THEME_IDS.map((themeId) => (
                  <TouchableOpacity
                    key={themeId}
                    style={[
                      styles.themeButton,
                      { backgroundColor: getThemeConfig(themeId).solidColor },
                      settings.themeId === themeId && styles.themeButtonSelected,
                    ]}
                    onPress={() => updateSetting('themeId', themeId)}
                  >
                    <Text style={styles.themeButtonText}>{themeId.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Skills */}
              <Text style={styles.sectionTitle}>Available Skills</Text>
              <View style={styles.skillsGrid}>
                {SKILL_NAMES.map((skill) => (
                  <View key={skill} style={styles.skillRow}>
                    <Text style={styles.skillLabel}>{skill}</Text>
                    <View style={styles.numberInput}>
                      <TouchableOpacity
                        style={styles.numberButtonSmall}
                        onPress={() => updateSkill(skill, settings.skills[skill] - 1)}
                      >
                        <Text style={styles.numberButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.skillValue}>{settings.skills[skill]}</Text>
                      <TouchableOpacity
                        style={styles.numberButtonSmall}
                        onPress={() => updateSkill(skill, settings.skills[skill] + 1)}
                      >
                        <Text style={styles.numberButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.closeModalButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  settingsButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  modalScroll: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 14,
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberButton: {
    width: 36,
    height: 36,
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonSmall: {
    width: 28,
    height: 28,
    backgroundColor: '#2a2a4e',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  numberValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeButtonSelected: {
    borderColor: '#fff',
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  skillsGrid: {
    gap: 8,
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a4e',
    padding: 8,
    borderRadius: 6,
  },
  skillLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  skillValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  closeModalButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
