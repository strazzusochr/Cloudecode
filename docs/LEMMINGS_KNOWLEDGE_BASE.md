# Umfassende Wissensbasis für Lemmings (2006) PSP 3D Web-Game Clone

Die vollständige Recherche für einen High-End 3D Web-Game Prompt ist abgeschlossen. Diese Wissensbasis deckt alle notwendigen Aspekte ab, um einen detaillierten Prompt für Qwen AI zu erstellen.

---

## Lemmings (2006) PSP – Vollständige Spielspezifikation

Die PSP-Version von Team17 enthält **156 Level** (120 originale + 36 neue) mit Pre-rendered 3D-Hintergründen und 2D-Gameplay. Die Lemminge erscheinen als kleine Figuren mit **hellrosa Haut, grünen strubbeligen Haaren und blauen Roben**.

### Die 8 klassischen Skills mit exakten Verhaltensweisen

**Climber** verleiht permanente Kletterfähigkeit – der Lemming erhält sichtbare Kletter-Ausrüstung und erklimmt vertikale Flächen automatisch. Bei Überhängen fällt er herunter. Kombinierbar mit Floater zum "Athlete"-Combo.

**Floater** aktiviert einen Regenschirm bei jedem Fall und garantiert sichere Landung aus jeder Höhe. Ebenfalls permanenter Skill, der automatisch bei Stürzen ausgelöst wird.

**Bomber** startet einen **5-Sekunden-Countdown** (sichtbar über dem Kopf: 5-4-3-2-1), dann explodiert der Lemming mit Konfetti-Effekt und hinterlässt einen kreisförmigen Krater. Zerstört destruktibles Terrain, aber keine anderen Lemminge oder Stahl. Einzige Methode, Blocker zu entfernen.

**Blocker** lässt den Lemming mit ausgestreckten Armen stehen bleiben. Alle anderen Lemminge drehen bei Kontakt um. Kann nicht neu zugewiesen werden (außer Bomber) und bleibt permanent, bis zerstört oder Boden entfernt.

**Builder** baut eine diagonale Treppe mit exakt **12 Steinen** (Steigung ca. 45°). Animation: Pause-Platzieren-Schritt-Wiederholen. Wichtig: Bei den letzten 3 Steinen zeigt der Lemming eine Warnanimation (Achselzucken).

**Basher** gräbt horizontal durch destruktibles Terrain mit Hammer/Spitzhacke. Stoppt bei Luft, Stahl oder nicht-zerstörbarem Material und erzeugt einen begehbaren Tunnel.

**Miner** gräbt diagonal nach unten (~45°-Winkel) in Laufrichtung mit sichtbarem gelben Helm. Stoppt bei Durchbruch oder Stahl.

**Digger** gräbt vertikal nach unten mit Krallen. Erzeugt einen Schacht, in den andere Lemminge fallen können.

### Level-Struktur und Schwierigkeitsgrade

Die vier Schwierigkeitskategorien mit je **30 Levels**:

| Kategorie | Charakteristik |
|-----------|----------------|
| **FUN** | Tutorial-Levels, grundlegende Skills lernen, hohe Rettungsquoten erreichbar |
| **TRICKY** | Moderate Herausforderung, reduzierte Skill-Zuweisung |
| **TAXING** | Komplexe Puzzles, knappe Zeitlimits, präziser Skill-Einsatz |
| **MAYHEM** | Experten-Schwierigkeit, minimale Skills, maximale Herausforderung |

**Level-Komponenten**: Falltür-Eingänge, Ziel-Türen, destruktibles/unzerstörbares Terrain, Stahl-Bereiche (sichtbar schraffiert), Fallen (Bärenfallen, Rotorblätter, Pressen, Flammen), Wasser/Lava-Gefahren.

### Spielmechaniken im Detail

Die **Release Rate** (1-99) steuert den Abstand zwischen Lemmingen am Eingang – kann nur erhöht, nie unter den Level-Startwert gesenkt werden. **Zeitlimits** variieren von 1-10 Minuten pro Level mit blinkendem Timer unter 30 Sekunden.

Die **Nuke-Funktion** erfordert Doppelklick zur Bestätigung und verwandelt alle verbleibenden Lemminge in Bomber – jeder ruft "Oh no!" vor der Explosion. **Sichere Fallhöhe** beträgt ca. 63 Pixel; darüber "splatter" die Lemminge.

**Pause-Mechanik** friert das Spiel komplett ein, erlaubt aber weiterhin Skill-Auswahl und Release-Rate-Anpassung – essentiell für strategische Planung.

### UI-Elemente für originalgetreue Nachbildung

Das **Skill-Panel** am unteren Bildschirmrand zeigt acht Skill-Buttons mit Verfügbarkeitszählern, Plus/Minus für Release Rate, Pause- und Nuke-Button. Die **Informationsanzeige** enthält: Lemming unter Cursor (Typ), OUT-Counter (aktuell im Level), IN-Counter (gerettet), Prozent-Anforderung, Timer (MM:SS).

Die **Minimap** zeigt Level-Übersicht mit aktueller Ansichtsposition und Lemming-Positionen als Punkte. Das **Cursor-System** verwendet ein Fadenkreuz mit quadratischem Highlight um anwählbare Lemminge.

### Visuelle Themen und Audio-Design

**Fünf Grafik-Themes**: Dirt/Earth (Outdoor, Gras, Holzbrücken), Fire/Hell (vulkanisch, Lava, rot-orange), Marble/Pillar (griechisch-römisch, Säulen), Crystal/Tech (lila-blau, Kristalle), Brick/Construction (industriell, Metallträger, Ketten).

**Sound-Design** umfasst: Falltür-Knarren, Skill-Zuweisungs-Klick, Baugeräusche (Stein-Klacken), Grabe-Geräusche, Explosions-Pop, Splatter-Aufprall, Ertrinken-Platschen, Stahl-Klingen bei blockiertem Graben. Die kultigen **Voice-Clips** "Yippee!" (beim Erreichen des Ziels) und "Oh no!" (vor Bomber-Explosion) sind charakteristisch.

---

## React Three Fiber – High-Performance 3D-Entwicklung

### Instancing für viele gleichzeitige Einheiten

Für 50-100+ Lemminge ist **InstancedMesh** unerlässlich – alle Charaktere in einem einzigen Draw Call:

```jsx
function Lemmings({ count = 100, temp = new THREE.Object3D() }) {
  const instancedMeshRef = useRef()

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      temp.position.set(positions[i].x, positions[i].y, positions[i].z)
      temp.updateMatrix()
      instancedMeshRef.current.setMatrixAt(i, temp.matrix)
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, count]}>
      <primitive object={lemmingGeometry} />
      <meshToonMaterial />
    </instancedMesh>
  )
}
```

**BatchedMesh** (Three.js r160+) erlaubt mehrere verschiedene Geometrien in einem Draw Call – nützlich für verschiedene Lemming-Zustände.

### Performance-Optimierung für WebGL

**LOD-System** mit Dreis `<Detailed />`:
```jsx
<Detailed distances={[0, 20, 50]}>
  <mesh geometry={highPoly} />
  <mesh geometry={medPoly} />
  <mesh geometry={lowPoly} />
</Detailed>
```

**Kritische Best Practices**: Geometrien und Materialien außerhalb von Komponenten erstellen und wiederverwenden. `useMemo` für teure Berechnungen. `visible={false}` statt Conditional Rendering für teure Komponenten. On-Demand-Rendering mit `frameloop="demand"` für statische Szenen.

**Performance-Monitoring**:
```jsx
<PerformanceMonitor
  onIncline={() => setDpr(2)}
  onDecline={() => setDpr(1)}
>
```

Zielwerte: **unter 200 Draw Calls** (Mobile) bzw. 500-1000 (Desktop), **unter 1M Triangles** für 60fps.

### Physik mit React-Three-Rapier

```jsx
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'

<Physics>
  <RigidBody type="fixed"> {/* Terrain */}
    <mesh geometry={terrainGeometry} />
  </RigidBody>

  <RigidBody colliders="hull"> {/* Lemming */}
    <mesh geometry={lemmingGeometry} />
  </RigidBody>

  {/* Sensoren für Trigger-Zonen */}
  <CuboidCollider
    args={[5, 5, 1]}
    sensor
    onIntersectionEnter={() => handleExitReached()}
  />
</Physics>
```

**Collision Groups** für effiziente Kollisionserkennung zwischen Lemming-Gruppen, Terrain und Gefahren.

### State Management mit Zustand + ECS

**Zustand** für globalen Game State:
```jsx
const useGameStore = create((set, get) => ({
  lemmingsOut: 0,
  lemmingsSaved: 0,
  timeRemaining: 300,
  selectedSkill: 'climber',
  releaseRate: 50,
  // Transient Updates (kein Re-Render)
  updateLemmingPosition: (id, pos) => {...}
}))

// In useFrame - direkt auf State zugreifen ohne Re-Render
useFrame(() => {
  const { lemmingsOut } = useGameStore.getState()
})
```

**Miniplex ECS** für Entity-Management:
```jsx
const ECS = createECS<{
  position: { x: number; y: number; z: number }
  velocity: { x: number; y: number }
  skill: 'climber' | 'floater' | 'bomber' | null
  state: 'walking' | 'climbing' | 'digging' | 'falling' | 'blocking'
  isLemming: true
}>()
```

### Stylized Rendering mit Toon-Shading

```jsx
// Gradient-Map für Cel-Shading
const gradientMap = useLoader(TextureLoader, '/gradient3.png')
gradientMap.minFilter = THREE.NearestFilter
gradientMap.magFilter = THREE.NearestFilter

<mesh>
  <sphereGeometry />
  <meshToonMaterial color="#00ff00" gradientMap={gradientMap} />
</mesh>
```

**Post-Processing** für AAA-Look:
```jsx
<EffectComposer>
  <Bloom luminanceThreshold={1.1} mipmapBlur />
  <Outline selection={[selectedLemming]} edgeStrength={2.5} />
  <Vignette offset={0.1} darkness={1.1} />
</EffectComposer>
```

---

## Technischer Stack für Cross-Platform

### Empfohlene Versionen (Dezember 2025)

```json
{
  "react": "^19.0.0",
  "@react-three/fiber": "^9.0.0",
  "@react-three/drei": "^9.120.0",
  "@react-three/rapier": "latest",
  "@react-three/postprocessing": "latest",
  "three": "^0.170.0",
  "zustand": "^5.0.0",
  "expo": "~52.0.0",
  "expo-gl": "~16.0.0",
  "expo-three": "^8.0.0",
  "expo-av": "~15.0.0",
  "expo-router": "~4.0.0"
}
```

**React 19 Vorteile**: Verbesserte Suspense-Behandlung, WebGPU-Support über async `gl` prop, besseres Concurrent Rendering für komplexe Szenen.

### Expo Router für Game-Navigation

```
app/
  (game)/
    menu.tsx          // Hauptmenü
    level-select/
      [category].tsx  // Fun/Tricky/Taxing/Mayhem
    play/
      [levelId].tsx   // Gameplay-Screen
    editor.tsx        // Level-Editor
  _layout.tsx
```

**State Preservation**: Layout-Files erhalten State über Child-Routes hinweg. Stack-Navigation für Zurück-Funktion zum Menü.

### Asset-Loading und Optimierung

```jsx
import { useGLTF } from '@react-three/drei'

// Preloading für schnelles Level-Laden
useGLTF.preload(['/lemming.glb', '/terrain.glb', '/traps.glb'])

function Lemming() {
  const { nodes, materials, animations } = useGLTF('/lemming.glb')
  const { actions } = useAnimations(animations, nodes.armature)

  useEffect(() => {
    actions.walk?.play()
  }, [])

  return <primitive object={nodes.body} />
}
```

**Draco-Kompression** reduziert GLB-Dateien um 70-90%:
```bash
gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp
```

### Audio-Integration mit expo-av

```jsx
import { Audio } from 'expo-av'

// Sound-Manager Setup
const soundRefs = {
  yippee: new Audio.Sound(),
  ohNo: new Audio.Sound(),
  click: new Audio.Sound(),
  dig: new Audio.Sound()
}

await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false
})

// Preload all sounds
await soundRefs.yippee.loadAsync(require('./assets/sfx/yippee.mp3'))

// Playback
const playSound = async (name: keyof typeof soundRefs) => {
  await soundRefs[name].playFromPositionAsync(0)
}
```

### Bekannte Limitierungen und Workarounds

| Problem | Lösung |
|---------|--------|
| iOS Simulator crasht | Nur physische iOS-Geräte testen |
| Drei-Komponenten mit `document` | Import von `@react-three/drei/native` |
| KTX2-Texturen auf Native | Unkomprimierte Texturen oder manuelles CompressedTexture |
| pixelStorei Crash | Canvas `onCreated` Workaround anwenden |

---

## AI-Prompt-Strukturierung für Qwen

### Qwen3-Coder Spezifikationen

**Kontext-Fenster**: 256K Tokens nativ, erweiterbar auf 1M Tokens. **Coding-Stärken**: 358+ Programmiersprachen, Agentic Coding mit Multi-Turn Tool-Interaktionen, Repository-Scale Understanding. **Optimale Temperatur**: 0.1-0.3 für Code-Generierung.

### Optimale Prompt-Struktur für komplexe Projekte

Strukturierte 16K-Token-Prompts übertreffen monolithische 128K-Token-Prompts in Genauigkeit. **Empfohlene Hierarchie**:

```markdown
# LEMMINGS 3D CLONE - VOLLSTÄNDIGE SPEZIFIKATION

## ABSCHNITT 1: EXECUTIVE SUMMARY (50-100 Tokens)
## ABSCHNITT 2: ROLLE UND KONTEXT (100-200 Tokens)
## ABSCHNITT 3: TECHNISCHE UMGEBUNG (200-500 Tokens)
## ABSCHNITT 4: SPIELDESIGN-SPEZIFIKATIONEN (2.000-4.000 Tokens)
### 4.1 Core Gameplay Loop
### 4.2 Skills/Fähigkeiten (detailliert)
### 4.3 Level-Design-Anforderungen
### 4.4 Visual Style Guide
### 4.5 Audio-Anforderungen
## ABSCHNITT 5: TECHNISCHE SPEZIFIKATIONEN (2.000-4.000 Tokens)
## ABSCHNITT 6: CONSTRAINTS UND EDGE CASES (500-1.000 Tokens)
## ABSCHNITT 7: OUTPUT-FORMAT (200-500 Tokens)
```

### Spielmechanik-Spezifikation (Template)

```markdown
### SKILL: Builder
**Beschreibung**: Baut diagonale Treppe aufwärts
**Spieler-Aktion**: Skill-Button klicken, dann Lemming auswählen
**System-Reaktion**:
  1. Lemming pausiert, Animation "brick_place" (0.3s)
  2. Brick-Entity an Position spawnen
  3. Lemming bewegt sich einen Schritt diagonal hoch
  4. Wiederhole 12x
  5. Bei Brick 10-12: "shrug" Warnung-Animation einblenden
**Abbruch-Bedingungen**: Kopf trifft Decke, 12 Bricks verbraucht, Level-Rand erreicht
**Cooldown**: Keiner (kann erneut zugewiesen werden)
```

### State Machine Definition (JSON-Format für Qwen)

```json
{
  "states": {
    "WALKING": {
      "animation": "lemming_walk",
      "onUpdate": ["MoveForward()", "CheckGround()", "CheckWall()"],
      "transitions": [
        {"to": "FALLING", "condition": "!isGrounded"},
        {"to": "TURNING", "condition": "hitWall AND !isClimber"},
        {"to": "CLIMBING", "condition": "hitWall AND isClimber"}
      ]
    },
    "DIGGING": {
      "animation": "lemming_dig",
      "onUpdate": ["DigTerrain()", "CheckBelow()"],
      "transitions": [
        {"to": "FALLING", "condition": "brokeThrough"},
        {"to": "WALKING", "condition": "hitSteel"}
      ]
    }
  }
}
```

### Iterative Entwicklung mit Prompt-Chaining

**Phase 1**: Architektur & Setup (Prompts 1-3)
- Projekt-Struktur und Core-Interfaces generieren
- Base-Classes und abstrakte Verträge implementieren

**Phase 2**: Core Systems (Prompts 4-8)
- State Machine Framework
- Entity Component System
- Input Handling, Physik-Integration

**Phase 3**: Game Content (Prompts 9-15)
- Lemming-Character Implementation
- Skill-Behaviors
- Level-Loading System

**Phase 4**: UI & Polish (Prompts 16-20)
- HUD Implementation
- Menü-Systeme
- Audio-Integration

---

## 3D-Asset-Erstellung und Ressourcen

### Empfohlene Asset-Quellen

**Kostenlos**: itch.io (KayKit-Packs), Sketchfab, FreeStylized.com, Poly Pizza/Poly Haven (CC0). **Animations**: Mixamo für Auto-Rigging und tausende Motion-Capture-Animationen (Walk, Climb, Dig Cycles).

### Character Design für kleine Figuren

**Silhouetten-Prinzip**: Charaktere müssen allein durch Umriss erkennbar sein. Für Lemminge: Runde/weiche Formen für freundlich-niedlichen Look, übertriebene Features (grüne Haare als Erkennungsmerkmal), starker Farbkontrast zwischen Haut, Haaren und Kleidung.

**Optimierung für kleine Größe**: Exaggerierte Unterscheidungsmerkmale, effektive Nutzung von Negativraum, Test durch Schwarz-Füllung (wenn als Silhouette erkennbar = funktioniert).

### Terrain-Implementation

Für **destruktibles Terrain** wie Lemmings: **Voxel-basierter Ansatz** mit Chunk-System (32x32x32). Jedes Voxel repräsentiert Terrain – bei Dig/Bash/Mine werden Voxels entfernt. Marching Cubes oder Dual Contouring für glatte Oberflächen.

Alternative: **2D-Bitmap-Methode** (wie Original-Lemmings) – jedes Pixel = Terrain, Modifikation durch Pixelmanipulation mit Bresenham-Kreis für Explosionsradien.

### GLTF-Workflow

**Blender → GLTF Best Practices**: Alle Transforms anwenden (Ctrl+A) vor Export, IK-Animations backen (GLTF unterstützt keine IK-Constraints), GLB-Format (Binary) für kleinere Dateien, Draco-Kompression anwenden.

**Animation-Struktur**: Separate Clips für idle, walk, climb_up, dig_down, dig_horizontal, dig_diagonal, fall, land, block, explode_countdown, exit_celebration.

---

## Zusammenfassung der Kernspezifikationen

### Minimale Feature-Liste für authentischen Clone

- **8 Skills** mit exakten Verhaltensweisen (Climber permanent, Builder 12 Bricks, Bomber 5s Countdown)
- **Release Rate Control** (1-99, nur erhöhbar)
- **Nuke-Funktion** mit Bestätigung und "Oh no!" Audio
- **4 Schwierigkeitskategorien** mit je 30 Levels (120 Minimum)
- **UI**: Skill-Panel, Info-Display (OUT/IN/%), Timer, Minimap
- **5 visuelle Themes**: Dirt, Fire, Marble, Crystal, Brick
- **Destructible Terrain** mit Steel-Bereichen
- **Fallen und Gefahren**: Wasser, Lava, mechanische Fallen

### Technische Architektur-Empfehlung

**Frontend**: React 19 + R3F v9 + Expo für Cross-Platform
**State**: Zustand für globalen State + Miniplex ECS für Entities
**Physik**: react-three-rapier mit Collision Groups
**Rendering**: InstancedMesh für Lemminge, Toon-Shading, Post-Processing
**Assets**: GLTF/GLB mit Draco, Mixamo-Animationen
**Audio**: expo-av mit Sound-Manager-Pattern

Diese Wissensbasis enthält alle notwendigen Details, um einen umfassenden, strukturierten Prompt für Qwen zu erstellen, der die vollständige Entwicklung eines High-End 3D Lemmings (2006) PSP Clones mit React Three Fiber ermöglicht.

---

**Erstellt**: 2025-12-05
**Version**: 1.0.0
