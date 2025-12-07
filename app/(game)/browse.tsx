import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { listOnlineLevels, OnlineLevel } from '../../src/services/levelSharingAPI';

export default function BrowseScreen() {
  const [levels, setLevels] = useState<OnlineLevel[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<OnlineLevel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  useEffect(() => {
    loadLevels();
  }, []);

  useEffect(() => {
    filterLevels();
  }, [levels, searchTerm, selectedDifficulty]);

  const loadLevels = async () => {
    setIsLoading(true);
    const onlineLevels = await listOnlineLevels();
    setLevels(onlineLevels);
    setIsLoading(false);
  };

  const filterLevels = () => {
    let result = levels;

    if (searchTerm) {
      result = result.filter(
        (level) =>
          level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          level.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDifficulty) {
      result = result.filter((level) => level.difficulty === selectedDifficulty);
    }

    setFilteredLevels(result);
  };

  const handlePlayLevel = (level: OnlineLevel) => {
    // In a real app, this would download and play the level
    router.push(`/(game)/play/${level.id}`);
  };

  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];

  const renderLevel = ({ item }: { item: OnlineLevel }) => (
    <TouchableOpacity
      style={styles.levelCard}
      onPress={() => handlePlayLevel(item)}
      activeOpacity={0.7}
    >
      <View style={styles.levelInfo}>
        <Text style={styles.levelName}>{item.name}</Text>
        <Text style={styles.levelAuthor}>by {item.author}</Text>
        <View style={styles.levelStats}>
          <Text style={styles.levelStat}>
            {item.difficulty}
          </Text>
          <Text style={styles.levelStat}>
            {item.plays} plays
          </Text>
          <Text style={styles.levelStat}>
            {'*'.repeat(Math.round(item.rating))} ({item.rating.toFixed(1)})
          </Text>
        </View>
      </View>
      <View style={styles.playButton}>
        <Text style={styles.playButtonText}>PLAY</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>BROWSE LEVELS</Text>
        <TouchableOpacity onPress={loadLevels} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>REFRESH</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search levels or authors..."
          placeholderTextColor="#666"
        />
        <View style={styles.difficultyFilter}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              !selectedDifficulty && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedDifficulty(null)}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          {difficulties.map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[
                styles.filterButton,
                selectedDifficulty === diff && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedDifficulty(diff)}
            >
              <Text style={styles.filterButtonText}>{diff}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Level List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading levels...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLevels}
          renderItem={renderLevel}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No levels found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}

      {/* Stats Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {filteredLevels.length} of {levels.length} levels
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
    color: '#FF9800',
    letterSpacing: 2,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  filterContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  searchInput: {
    backgroundColor: '#2a2a4e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  difficultyFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#2a2a4e',
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 10,
  },
  listContent: {
    padding: 15,
  },
  levelCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelAuthor: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  levelStats: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 8,
  },
  levelStat: {
    color: '#4CAF50',
    fontSize: 12,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#888',
    marginTop: 5,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#3a3a5e',
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
});
