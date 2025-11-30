# River Crossing Puzzle Ultimate - 3D Tutorial Level

Ein wunderschönes 3D-Puzzle-Spiel, entwickelt mit React Native, Expo und Three.js.

## 📱 Beschreibung

Das klassische "River Crossing Puzzle" in einer modernen 3D-Umgebung. Bringe den Farmer, Wolf, Schaf und Kohl sicher über den Fluss, ohne dass jemand gefressen wird!

## 🎮 Spielregeln

- **Ziel**: Alle 4 Charaktere sicher auf das rechte Ufer bringen
- **Steuerung**: Nur der Farmer kann das Boot steuern
- **Kapazität**: Das Boot kann maximal 2 Passagiere tragen (Farmer + 1)
- **Konflikte**:
  - Wolf + Schaf alleine = Game Over
  - Schaf + Kohl alleine = Game Over
  - Wolf + Kohl alleine = OK

## 🌟 Features

- ✨ Wunderschöne 3D-Grafik mit Three.js
- 🎯 Tutorial-System für neue Spieler
- ⭐ 3-Sterne-Bewertungssystem
- 🎵 Sound und Musik (optional)
- 📊 Statistiken (Züge, Zeit)
- ⚙️ Einstellbare Grafik-Qualität

## 🚀 Installation & Start

### Voraussetzungen

- Node.js (v18+)
- npm oder yarn
- Expo Go App auf dem Smartphone (iOS/Android)

### Installation

```bash
# Dependencies installieren
npm install

# App starten
npm start

# Oder direkt für Android
npm run android

# Oder für iOS
npm run ios
```

### Mit Expo Go testen

1. Installiere "Expo Go" aus dem App Store (iOS) oder Play Store (Android)
2. Führe `npm start` aus
3. Scanne den QR-Code mit deinem Smartphone
4. Die App wird automatisch geladen

## 🎨 Technologie-Stack

- **React Native** (0.76.5) - Cross-Platform Framework
- **Expo** (~52.0.0) - Build & Deployment Platform
- **Three.js** (0.145.0) - 3D-Engine
- **Expo-GL** - WebGL für React Native
- **TypeScript** - Type Safety

## 📁 Projektstruktur

```
Cloudecode/
├── app/                    # Expo Router Screens
│   ├── _layout.tsx        # Root Layout
│   └── index.tsx          # Hauptspiel-Screen
├── components/            # React-Komponenten
│   └── GameScene.tsx     # 3D-Szene
├── game/                  # Spiellogik
│   ├── characters/       # Charakter-Komponenten
│   ├── environment/      # Umgebungs-Komponenten
│   ├── logic/            # Spiellogik
│   └── ui/               # UI-Komponenten
│       ├── GameHUD.tsx
│       ├── TutorialOverlay.tsx
│       ├── VictoryScreen.tsx
│       ├── DefeatScreen.tsx
│       └── PauseMenu.tsx
├── assets/                # Bilder, Sounds, etc.
├── types/                 # TypeScript Types
└── package.json

```

## 🎯 Optimale Lösung

Die optimale Lösung benötigt **7 Züge**:

1. Farmer + Schaf → Rechts
2. Farmer ← Links
3. Farmer + Wolf → Rechts
4. Farmer + Schaf ← Links
5. Farmer + Kohl → Rechts
6. Farmer ← Links
7. Farmer + Schaf → Rechts

**GEWONNEN!** 🎉

## 📊 Bewertungssystem

- ⭐ **1 Stern**: Level geschafft (beliebig viele Züge)
- ⭐⭐ **2 Sterne**: ≤9 Züge UND ≤3 Minuten
- ⭐⭐⭐ **3 Sterne**: 7 Züge (optimal) UND ≤2 Minuten

## ⚙️ Einstellungen

- **Musik**: Ein/Aus
- **Soundeffekte**: Ein/Aus
- **Tutorial**: Ein/Aus (beim Neustart)
- **Grafik-Qualität**: Auto, Niedrig, Mittel, Hoch

## 🐛 Bekannte Probleme

- Erste Ladezeit kann auf älteren Geräten länger sein
- 3D-Performance variiert je nach Gerät

## 🔮 Geplante Features

- Level 2-10 mit steigender Schwierigkeit
- Verschiedene Themen (Winterlandschaft, Wüste, etc.)
- Globale Bestenlisten
- Achievements/Erfolge

## 📝 Lizenz

Dieses Projekt wurde für Bildungszwecke erstellt.

## 👨‍💻 Entwickler

Entwickelt mit ❤️ und Claude AI

---

**Viel Spaß beim Spielen!** 🎮
