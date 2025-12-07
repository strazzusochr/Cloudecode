import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      <Stack.Screen name="menu" />
      <Stack.Screen name="level-select/[category]" />
      <Stack.Screen name="play/[levelId]" />
      <Stack.Screen name="editor" />
      <Stack.Screen name="browse" />
      <Stack.Screen name="asset-manager" />
      <Stack.Screen name="scene-explorer" />
      <Stack.Screen name="tech-demo" />
    </Stack>
  );
}
