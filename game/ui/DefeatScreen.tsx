import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface DefeatScreenProps {
  onRestart: () => void;
  onShowHint: () => void;
}

export default function DefeatScreen({ onRestart, onShowHint }: DefeatScreenProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Modal transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateX: shakeAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>😱</Text>
          <Text style={styles.title}>OH NEIN!</Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Das Schaf wurde gefressen!
            </Text>
          </View>

          <Text style={styles.explanation}>
            Wolf und Schaf dürfen nicht alleine auf einem Ufer sein.
            {'\n\n'}
            Der Farmer muss aufpassen!
          </Text>

          <View style={styles.hintBox}>
            <Text style={styles.hintIcon}>💡</Text>
            <Text style={styles.hintText}>
              Tipp: Nimm zuerst das Schaf mit rüber!
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onShowHint}>
              <Text style={styles.secondaryButtonText}>💡 Hilfe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={onRestart}>
              <Text style={styles.primaryButtonText}>🔄 Nochmal versuchen</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(139, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: Math.min(width - 40, 500),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningIcon: {
    fontSize: 32,
  },
  warningText: {
    fontSize: 18,
    color: '#D32F2F',
    fontWeight: 'bold',
    flex: 1,
  },
  explanation: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  hintBox: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#FBC02D',
  },
  hintIcon: {
    fontSize: 24,
  },
  hintText: {
    fontSize: 14,
    color: '#F57F17',
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#FBC02D',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57F17',
    textAlign: 'center',
  },
});
