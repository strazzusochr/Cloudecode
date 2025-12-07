import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

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

  const categories: Category[] = ['FUN', 'TRICKY', 'TAXING', 'MAYHEM'];

  const handleLevelSelect = (levelNum: number) => {
    const levelId = `${validCategory.toLowerCase()}-${levelNum}`;
    router.push(`/(game)/play/${levelId}`);
  };

  const handleCategoryChange = (newCategory: Category) => {
    router.replace(`/(game)/level-select/${newCategory}`);
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
          {Array.from({ length: LEVELS_PER_CATEGORY }, (_, i) => i + 1).map((levelNum) => (
            <TouchableOpacity
              key={levelNum}
              style={[styles.levelButton, { borderColor: color }]}
              onPress={() => handleLevelSelect(levelNum)}
              activeOpacity={0.7}
            >
              <Text style={[styles.levelNumber, { color }]}>{levelNum}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Info Footer */}
      <View style={styles.footer}>
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
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3a3a5e',
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
});
