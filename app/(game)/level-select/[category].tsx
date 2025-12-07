import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSoundStore, getMusicTrackForCategory } from '../../../src/stores/soundStore';
import { useProgressStore } from '../../../src/stores/progressStore';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = Math.min(80, (width - 80) / 6);

type Category = 'FUN' | 'TRICKY' | 'TAXING' | 'MAYHEM';

const CATEGORY_COLORS: Record<Category, string> = {
  FUN: '#4CAF50',
  TRICKY: '#FF9800',
  TAXING: '#f44336',
  MAYHEM: '#9C27B0',
};

const LEVELS_PER_CATEGORY = 30;

export default function LevelSelectScreen() {
  const { category } = useLocalSearchParams<{ category: Category }>();
  const validCategory = (category?.toUpperCase() as Category) || 'FUN';
  const color = CATEGORY_COLORS[validCategory] || CATEGORY_COLORS.FUN;
  const { playSound } = useSoundStore();
  const { getLevelProgress, isLevelUnlocked, getCategoryProgress } = useProgressStore();

  const categories: Category[] = ['FUN', 'TRICKY', 'TAXING', 'MAYHEM'];

  // Get category stats
  const categoryStats = useMemo(
    () => getCategoryProgress(validCategory),
    [validCategory, getCategoryProgress]
  );

  const handleLevelSelect = (levelNum: number) => {
    const levelId = `${validCategory.toLowerCase()}-${levelNum}`;
    if (!isLevelUnlocked(levelId, levelNum)) {
      // Level locked - play error sound or show message
      return;
    }
    playSound('click');
    router.push(`/(game)/play/${levelId}`);
  };

  const handleCategoryChange = (newCategory: Category) => {
    playSound('click');
    router.replace(`/(game)/level-select/${newCategory}`);
  };

  const getLevelStatus = (levelNum: number): { completed: boolean; stars: number; locked: boolean } => {
    const levelId = `${validCategory.toLowerCase()}-${levelNum}`;
    const progress = getLevelProgress(levelId);
    const unlocked = isLevelUnlocked(levelId, levelNum);

    if (!progress) {
      return { completed: false, stars: 0, locked: !unlocked };
    }
    return {
      completed: progress.completed,
      stars: progress.stars,
      locked: !unlocked
    };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color }]}>{validCategory} LEVELS</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.tab,
              { borderColor: CATEGORY_COLORS[cat] },
              validCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] + '40' },
            ]}
            onPress={() => handleCategoryChange(cat)}
          >
            <Text
              style={[
                styles.tabText,
                { color: CATEGORY_COLORS[cat] },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Level Grid */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        <View style={styles.grid}>
          {Array.from({ length: LEVELS_PER_CATEGORY }, (_, i) => i + 1).map((levelNum) => {
            const status = getLevelStatus(levelNum);
            return (
              <TouchableOpacity
                key={levelNum}
                style={[
                  styles.levelButton,
                  { borderColor: status.locked ? '#444' : color },
                  status.completed && styles.levelCompleted,
                  status.locked && styles.levelLocked,
                ]}
                onPress={() => handleLevelSelect(levelNum)}
                activeOpacity={status.locked ? 1 : 0.7}
                disabled={status.locked}
              >
                {status.locked ? (
                  <Text style={styles.lockIcon}>🔒</Text>
                ) : (
                  <>
                    <Text style={[styles.levelNumber, { color }]}>{levelNum}</Text>
                    {status.completed && (
                      <View style={styles.starsContainer}>
                        {[1, 2, 3].map((star) => (
                          <Text
                            key={star}
                            style={[
                              styles.star,
                              star <= status.stars ? styles.starFilled : styles.starEmpty,
                            ]}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Info Footer */}
      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            Completed: {categoryStats.completedCount}/{LEVELS_PER_CATEGORY}
          </Text>
          <Text style={styles.statText}>
            ★ {categoryStats.totalStars}/{LEVELS_PER_CATEGORY * 3}
          </Text>
          <Text style={styles.statText}>
            Perfect: {categoryStats.perfectCount}
          </Text>
        </View>
        <Text style={styles.footerText}>
          {validCategory === 'FUN' && 'Tutorial levels - Learn the basics'}
          {validCategory === 'TRICKY' && 'Moderate challenge - Think carefully'}
          {validCategory === 'TAXING' && 'Hard puzzles - Timing is key'}
          {validCategory === 'MAYHEM' && 'Expert difficulty - Minimal skills'}
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
    padding: 20,
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
    letterSpacing: 2,
  },
  placeholder: {
    width: 80,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gridContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 600,
    alignSelf: 'center',
  },
  levelButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  levelCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  levelLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    opacity: 0.6,
  },
  lockIcon: {
    fontSize: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    gap: 2,
  },
  star: {
    fontSize: 10,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#444',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3a3a5e',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  statText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
});
