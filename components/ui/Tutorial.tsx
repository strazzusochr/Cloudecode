// Tutorial Component for New Players

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Tutorial steps
const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Lemmings 3D!',
    content: 'Your goal is to guide the lemmings safely from the entrance to the exit. They walk mindlessly forward, so you must use skills to help them overcome obstacles.',
    highlight: null,
  },
  {
    title: 'The Skill Panel',
    content: 'Use the skill panel at the bottom to select abilities. Click on a lemming to assign the selected skill. Each skill has a limited number of uses shown by the counter.',
    highlight: 'skillPanel',
  },
  {
    title: '8 Essential Skills',
    content: `
• CLIMBER: Scales vertical walls
• FLOATER: Survives any fall with umbrella
• BOMBER: Explodes after countdown
• BLOCKER: Stops other lemmings
• BUILDER: Creates diagonal staircase
• BASHER: Tunnels horizontally
• MINER: Digs diagonally downward
• DIGGER: Digs straight down
    `.trim(),
    highlight: null,
  },
  {
    title: 'Release Rate',
    content: 'Adjust the release rate to control how fast lemmings spawn from the entrance. A lower rate gives you more time to set up, while a higher rate finishes faster.',
    highlight: 'releaseRate',
  },
  {
    title: 'Camera Controls',
    content: 'Use FREE mode to pan around the level. Use FOLLOW mode to track a specific lemming. Use +/- to adjust game speed for easier gameplay or faster completion.',
    highlight: 'camera',
  },
  {
    title: 'Winning & Stars',
    content: 'Save the required number of lemmings to win. Earn up to 3 stars based on how many you save - 90%+ for 3 stars, 70%+ for 2 stars, or just meeting the requirement for 1 star.',
    highlight: 'hud',
  },
  {
    title: 'Keyboard Shortcuts',
    content: `
• 1-8: Select skills quickly
• P / ESC: Pause the game
• + / -: Adjust release rate
• Mouse drag: Pan camera
• Mouse scroll: Zoom in/out
    `.trim(),
    highlight: null,
  },
  {
    title: "You're Ready!",
    content: 'Good luck saving those lemmings! Remember, patience and planning are key. If you fail, you can always retry the level.',
    highlight: null,
  },
];

interface TutorialProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export default function Tutorial({ onComplete, forceShow = false }: TutorialProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if tutorial has been completed before
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem('tutorial-completed');
        if (completed !== 'true' || forceShow) {
          setVisible(true);
        }
      } catch (error) {
        // Show tutorial if we can't check status
        setVisible(true);
      }
      setLoading(false);
    };

    checkTutorialStatus();
  }, [forceShow]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('tutorial-completed', 'true');
    } catch (error) {
      // Ignore save errors
    }
    setVisible(false);
    onComplete();
  };

  if (loading || !visible) {
    return null;
  }

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {TUTORIAL_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Step Counter */}
          <Text style={styles.stepCounter}>
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </Text>

          {/* Title */}
          <Text style={styles.title}>{step.title}</Text>

          {/* Content */}
          <ScrollView style={styles.contentScroll}>
            <Text style={styles.content}>{step.content}</Text>
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.buttons}>
            {!isFirstStep && (
              <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                <Text style={styles.buttonText}>BACK</Text>
              </TouchableOpacity>
            )}

            {isFirstStep && (
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkip}
              >
                <Text style={styles.skipButtonText}>SKIP</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>
                {isLastStep ? 'START PLAYING' : 'NEXT'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Reset tutorial (for settings screen)
export async function resetTutorial(): Promise<void> {
  try {
    await AsyncStorage.removeItem('tutorial-completed');
  } catch (error) {
    // Ignore errors
  }
}

// Check if tutorial has been completed
export async function isTutorialCompleted(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem('tutorial-completed');
    return completed === 'true';
  } catch (error) {
    return false;
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: Math.min(500, width - 40),
    maxHeight: height * 0.8,
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: '#2e7d32',
  },
  stepCounter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentScroll: {
    maxHeight: 200,
    marginBottom: 24,
  },
  content: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#333',
    minWidth: 100,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
