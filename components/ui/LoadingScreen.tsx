// Loading Screen with Tips

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

const { width } = Dimensions.get('window');

// Gameplay tips to show during loading
const TIPS = [
  'Climbers can scale vertical walls - assign early to overcome obstacles!',
  'Floaters survive any fall - essential for high drops.',
  'Bombers explode after 5 seconds - use them to clear blocked paths.',
  'Blockers stop other lemmings - place them strategically to redirect traffic.',
  'Builders create diagonal bridges - perfect for crossing gaps.',
  'Bashers tunnel horizontally through terrain.',
  'Miners dig diagonally downward at 45 degrees.',
  'Diggers bore straight down - useful for creating shortcuts.',
  'You can adjust the release rate to control lemming flow.',
  'Press P or ESC to pause the game anytime.',
  'Use keys 1-8 to quickly select skills.',
  'Click on a lemming to assign the selected skill.',
  'Watch the minimap to track lemmings across the level.',
  'Some skills can be combined - Climbers can also be Floaters!',
  'The timer shows how much time remains - plan accordingly.',
  'Save the required number of lemmings to win the level.',
  'Nuke is a last resort - it destroys all remaining lemmings!',
  'Drag to rotate the camera, scroll to zoom.',
  'Levels get progressively harder - FUN, TRICKY, TAXING, MAYHEM.',
  'Three stars require saving almost all lemmings with time to spare.',
];

interface LoadingScreenProps {
  message?: string;
  progress?: number; // 0-100
  levelName?: string;
}

export default function LoadingScreen({
  message = 'Loading...',
  progress,
  levelName,
}: LoadingScreenProps) {
  const [currentTip, setCurrentTip] = useState('');
  const spinAnim = useState(new Animated.Value(0))[0];
  const dotAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(1))[0];

  // Select random tip on mount and rotate every 4 seconds
  useEffect(() => {
    const selectRandomTip = () => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change tip
        const randomIndex = Math.floor(Math.random() * TIPS.length);
        setCurrentTip(TIPS[randomIndex]);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    };

    // Initial tip
    const randomIndex = Math.floor(Math.random() * TIPS.length);
    setCurrentTip(TIPS[randomIndex]);

    // Rotate tips every 4 seconds
    const tipInterval = setInterval(selectRandomTip, 4000);

    return () => clearInterval(tipInterval);
  }, []);

  // Spinning animation for loader
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    return () => spin.stop();
  }, []);

  // Dot animation for loading text
  useEffect(() => {
    const dot = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 3,
          duration: 1200,
          easing: Easing.step0,
          useNativeDriver: false,
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    dot.start();

    return () => dot.stop();
  }, []);

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Level Name (if provided) */}
      {levelName && (
        <Text style={styles.levelName}>{levelName}</Text>
      )}

      {/* Spinner */}
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[
            styles.spinner,
            { transform: [{ rotate: spinInterpolation }] },
          ]}
        >
          {/* Lemming-inspired spinner */}
          <View style={styles.spinnerInner}>
            <View style={[styles.spinnerDot, styles.dotTop]} />
            <View style={[styles.spinnerDot, styles.dotRight]} />
            <View style={[styles.spinnerDot, styles.dotBottom]} />
            <View style={[styles.spinnerDot, styles.dotLeft]} />
          </View>
        </Animated.View>
      </View>

      {/* Loading Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Progress Bar (if progress provided) */}
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(0, progress))}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}

      {/* Tip Section */}
      <Animated.View style={[styles.tipContainer, { opacity: fadeAnim }]}>
        <Text style={styles.tipLabel}>TIP:</Text>
        <Text style={styles.tipText}>{currentTip}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  levelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    letterSpacing: 2,
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  spinner: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  dotTop: {
    top: -5,
  },
  dotRight: {
    right: -5,
  },
  dotBottom: {
    bottom: -5,
  },
  dotLeft: {
    left: -5,
  },
  message: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 16,
  },
  progressContainer: {
    width: Math.min(300, width - 60),
    alignItems: 'center',
    marginBottom: 40,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  tipContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    letterSpacing: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
});
