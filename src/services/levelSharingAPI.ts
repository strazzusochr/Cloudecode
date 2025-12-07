// Level Sharing API (Simulated)

import type { LevelData } from '../types/game';

export interface OnlineLevel {
  id: string;
  name: string;
  author: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  plays: number;
  rating: number;
  createdAt: string;
  levelData?: LevelData;
}

// Simulated online levels database
const MOCK_ONLINE_LEVELS: OnlineLevel[] = [
  {
    id: 'online-1',
    name: 'The Great Escape',
    author: 'LemmingMaster',
    difficulty: 'Easy',
    plays: 1523,
    rating: 4.5,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'online-2',
    name: 'Precision Required',
    author: 'PuzzlePro',
    difficulty: 'Hard',
    plays: 892,
    rating: 4.8,
    createdAt: '2024-02-20T14:45:00Z',
  },
  {
    id: 'online-3',
    name: 'Steel Fortress',
    author: 'ArchitectX',
    difficulty: 'Expert',
    plays: 456,
    rating: 4.2,
    createdAt: '2024-03-05T09:15:00Z',
  },
  {
    id: 'online-4',
    name: 'Bridge Builder Challenge',
    author: 'BuilderBob',
    difficulty: 'Medium',
    plays: 2341,
    rating: 4.6,
    createdAt: '2024-03-10T16:20:00Z',
  },
  {
    id: 'online-5',
    name: "Digger's Paradise",
    author: 'MoleMan',
    difficulty: 'Easy',
    plays: 1876,
    rating: 4.4,
    createdAt: '2024-03-18T11:00:00Z',
  },
  {
    id: 'online-6',
    name: 'The Labyrinth',
    author: 'MazeRunner',
    difficulty: 'Expert',
    plays: 234,
    rating: 4.9,
    createdAt: '2024-03-25T08:30:00Z',
  },
  {
    id: 'online-7',
    name: 'Quick Thinking',
    author: 'SpeedDemon',
    difficulty: 'Medium',
    plays: 1567,
    rating: 4.3,
    createdAt: '2024-04-01T13:45:00Z',
  },
  {
    id: 'online-8',
    name: 'Lava Lake',
    author: 'HotStuff',
    difficulty: 'Hard',
    plays: 678,
    rating: 4.7,
    createdAt: '2024-04-10T17:30:00Z',
  },
  {
    id: 'online-9',
    name: 'Sky High',
    author: 'CloudWalker',
    difficulty: 'Medium',
    plays: 1234,
    rating: 4.5,
    createdAt: '2024-04-15T10:00:00Z',
  },
  {
    id: 'online-10',
    name: 'The Impossible',
    author: 'ChallengeKing',
    difficulty: 'Expert',
    plays: 123,
    rating: 5.0,
    createdAt: '2024-04-20T15:15:00Z',
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// List online levels
export async function listOnlineLevels(): Promise<OnlineLevel[]> {
  await delay(500 + Math.random() * 500); // Simulate network latency
  return [...MOCK_ONLINE_LEVELS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Get level by ID
export async function getOnlineLevel(id: string): Promise<OnlineLevel | null> {
  await delay(300 + Math.random() * 300);
  return MOCK_ONLINE_LEVELS.find((level) => level.id === id) || null;
}

// Upload a level
export async function uploadLevel(
  levelData: LevelData,
  author: string
): Promise<{ success: boolean; id: string }> {
  await delay(800 + Math.random() * 400);

  // Simulate successful upload
  const newLevel: OnlineLevel = {
    id: `online-${Date.now()}`,
    name: levelData.name,
    author,
    difficulty: determineDifficulty(levelData),
    plays: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
    levelData,
  };

  MOCK_ONLINE_LEVELS.push(newLevel);

  return { success: true, id: newLevel.id };
}

// Download a level
export async function downloadLevel(id: string): Promise<LevelData | null> {
  await delay(400 + Math.random() * 300);

  const level = MOCK_ONLINE_LEVELS.find((l) => l.id === id);
  if (level?.levelData) {
    // Increment play count
    level.plays++;
    return level.levelData;
  }

  return null;
}

// Rate a level
export async function rateLevel(
  id: string,
  rating: number
): Promise<{ success: boolean }> {
  await delay(300);

  const level = MOCK_ONLINE_LEVELS.find((l) => l.id === id);
  if (level) {
    // Simple average calculation (in real app, would track individual ratings)
    level.rating = (level.rating + rating) / 2;
    return { success: true };
  }

  return { success: false };
}

// Helper: Determine difficulty based on level data
function determineDifficulty(
  levelData: LevelData
): 'Easy' | 'Medium' | 'Hard' | 'Expert' {
  const totalSkills = Object.values(levelData.skills).reduce((a, b) => a + b, 0);
  const requiredPercent =
    levelData.requiredSaved / levelData.totalLemmings;
  const timePerLemming = levelData.timeLimit / levelData.totalLemmings;

  if (totalSkills > 50 && requiredPercent < 0.5 && timePerLemming > 5) {
    return 'Easy';
  } else if (totalSkills > 30 && requiredPercent < 0.7 && timePerLemming > 3) {
    return 'Medium';
  } else if (totalSkills > 15 && requiredPercent < 0.9 && timePerLemming > 2) {
    return 'Hard';
  } else {
    return 'Expert';
  }
}

// Search levels
export async function searchLevels(
  query: string
): Promise<OnlineLevel[]> {
  await delay(400 + Math.random() * 300);

  const lowerQuery = query.toLowerCase();
  return MOCK_ONLINE_LEVELS.filter(
    (level) =>
      level.name.toLowerCase().includes(lowerQuery) ||
      level.author.toLowerCase().includes(lowerQuery)
  );
}

// Get top rated levels
export async function getTopRatedLevels(
  limit: number = 10
): Promise<OnlineLevel[]> {
  await delay(400);

  return [...MOCK_ONLINE_LEVELS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

// Get most played levels
export async function getMostPlayedLevels(
  limit: number = 10
): Promise<OnlineLevel[]> {
  await delay(400);

  return [...MOCK_ONLINE_LEVELS]
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit);
}
