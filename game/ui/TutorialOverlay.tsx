import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    id: 1,
    text: 'Willkommen beim River Crossing Puzzle! 🎮',
    subText: 'Tippe auf "Weiter" um zu beginnen.',
  },
  {
    id: 2,
    text: 'Dein Ziel',
    subText: 'Bringe den Farmer 👨‍🌾, Wolf 🐺, Schaf 🐑 und Kohl 🥬 sicher auf die andere Seite des Flusses.',
  },
  {
    id: 3,
    text: 'Wie es funktioniert',
    subText: 'Tippe auf einen Charakter, um ihn auszuwählen. Dann tippe auf das Boot, um ihn einzuladen.',
  },
  {
    id: 4,
    text: 'Wichtige Regel #1',
    subText: '⚠️ Wolf und Schaf dürfen NICHT alleine sein - der Wolf würde das Schaf fressen!',
  },
  {
    id: 5,
    text: 'Wichtige Regel #2',
    subText: '⚠️ Schaf und Kohl dürfen NICHT alleine sein - das Schaf würde den Kohl fressen!',
  },
  {
    id: 6,
    text: 'Der Farmer ist der Schlüssel',
    subText: 'Nur der Farmer kann das Boot steuern. Er muss immer im Boot sein!',
  },
  {
    id: 7,
    text: 'Platz im Boot',
    subText: 'Das Boot hat nur Platz für 2: Der Farmer + 1 weiteres Wesen/Objekt.',
  },
  {
    id: 8,
    text: 'Die Herausforderung',
    subText: 'Schaffe es in 7 Zügen für 3 Sterne! ⭐⭐⭐',
  },
  {
    id: 9,
    text: 'Bereit?',
    subText: 'Jetzt bist du dran! Viel Erfolg! 🍀',
  },
];

export default function TutorialOverlay({ onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Überspringen</Text>
        </TouchableOpacity>

        {/* Tutorial Card */}
        <View style={styles.card}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Content */}
          <Text style={styles.title}>{step.text}</Text>
          <Text style={styles.subText}>{step.subText}</Text>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={currentStep === 0}
            >
              <Text style={styles.navButtonText}>← Zurück</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep === tutorialSteps.length - 1 ? 'Los geht\'s!' : 'Weiter →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  skipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    width: Math.min(width - 40, 500),
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#FFF',
  },
  navButtonDisabled: {
    borderColor: '#CCC',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
});
