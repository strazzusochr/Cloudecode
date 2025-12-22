# DEZENTRALE SUCHMASCHINE - HAUPTPROJEKT

> **Haupt-Suchmaschine:** YaCy P2P Search Engine
> **Visualisierung:** Antigravity 3D
> **Version:** Beast Mode Edition
> **Erstellt:** 2025-12-18

---

## HAUPT-SUCHMASCHINE: YaCy

### Primare Such-URL
```
http://localhost:8090/yacysearch.html?query=nachrichten&resource=global&urlmaskfilter=.*&prefermaskfilter=&nav=all&auth=
```

### YaCy Admin-Oberflachen

| Funktion | URL | Beschreibung |
|----------|-----|--------------|
| **Suche** | http://localhost:8090/yacysearch.html | Haupt-Suchseite |
| **Crawler starten** | http://localhost:8090/CrawlStartExpert.html | Experten-Crawl-Einstellungen |
| **Einfacher Crawl** | http://localhost:8090/CrawlStartSite.html | Einzelne Seite crawlen |
| **Status** | http://localhost:8090/Status.html | System-Status & RAM |
| **Einstellungen** | http://localhost:8090/ConfigBasic.html | Grundkonfiguration |
| **Netzwerk** | http://localhost:8090/Network.html | Peer-Ubersicht |
| **Performance** | http://localhost:8090/Performance_p.html | Performance-Metriken |
| **Index Browser** | http://localhost:8090/IndexBrowser_p.html | Index durchsuchen |

### Installation
```
yacy/
├── htroot/           # 142+ HTML-Seiten (Web-Interface)
├── DATA/             # Datenbank & Index
├── lib/              # Java-Libraries
└── startYACY.bat     # Starter-Script (Windows)
└── startYACY.sh      # Starter-Script (Linux)
```

---

## ALLE LOCALHOST-SERVICES

| Plattform | URL | Typ |
|-----------|-----|-----|
| **YaCy Suche** | http://localhost:8090 | P2P Suchmaschine |
| **3D Visualisierung** | http://localhost:5173 | Antigravity React App |
| **SearXNG** | http://localhost:8888 | Meta-Suchmaschine |

---

## ALGORITHM-FREE PLATTFORMEN

### Alternative Frontends ohne Algorithmus

| Plattform | Algorithm-Free URL | Beschreibung |
|-----------|-------------------|--------------|
| **YouTube** | https://yewtu.be | Invidious - YouTube ohne Tracking |
| **Twitter/X** | https://nitter.net | Twitter ohne Algorithmus |
| **Reddit** | https://libreddit.kavin.rocks | Reddit ohne Tracking |
| **Maps** | https://openstreetmap.org | Freie Karten |

### Weitere Invidious-Instanzen (YouTube)
- https://vid.puffyan.us
- https://invidious.snopyta.org
- https://invidious.kavin.rocks

### Weitere Nitter-Instanzen (Twitter)
- https://nitter.42l.fr
- https://nitter.pussthecat.org
- https://nitter.namazso.eu

### Weitere LibReddit-Instanzen
- https://libredd.it
- https://libreddit.spike.codes

---

## QUICK-START BEFEHLE

### YaCy starten (Linux)
```bash
cd yacy
./startYACY.sh
```

### YaCy starten (Windows)
```powershell
cd yacy
.\startYACY.bat
```

### 3D Visualisierung starten
```bash
cd visualization
npm run dev
```

### SearXNG starten (Docker)
```bash
docker start searxng
# Oder neu starten:
docker run -d --name searxng -p 8888:8080 searxng/searxng
```

---

## SERVICE-UBERSICHT

```
┌─────────────────────────────────────────────────────────────┐
│                    DEZENTRALE SUCHE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   YaCy      │  │  SearXNG    │  │  Antigrav   │          │
│  │  :8090      │  │   :8888     │  │   :5173     │          │
│  │  P2P DHT    │  │  Meta-Such  │  │  3D Viz     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│              ┌───────────▼───────────┐                       │
│              │  ALGORITHM-FREE WEB   │                       │
│              │  yewtu.be | nitter    │                       │
│              │  libreddit | OSM      │                       │
│              └───────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## KONFIGURATION

### YaCy Beast Mode (12 GB RAM)

Konfigurationsdatei: `yacy/DATA/SETTINGS/yacy.conf`

### Wichtigste Settings:
```ini
javastart_Xmx=12288          # 12 GB Max Heap
crawler.MaxActiveThreads=200  # Crawler-Threads
crawlingMaxPages=100000       # Max Seiten
port=8090                     # HTTP Port
```

---

## FEATURES

### YaCy P2P Suchmaschine
- Vollstandig dezentral (kein zentraler Server)
- P2P Kademlia DHT Protokoll
- Eigener verteilter Index
- 142+ Admin-Seiten
- Beast Mode: 12 GB RAM
- 200 Crawler-Threads

### Antigravity 3D Visualisierung
- 6 Netzwerk-Modi
- 500+ simulierte Nodes
- Physik-basierte Animation
- Echte YaCy-API-Integration
- SearXNG Meta-Suche
- Ollama AI-Chat

### Algorithm-Free Web
- YouTube ohne Empfehlungen
- Twitter ohne Algorithmus
- Reddit ohne Tracking
- Freie OpenStreetMap

---

## WICHTIGSTE LINKS

```
# Localhost Services
http://localhost:8090/yacysearch.html    # YaCy Suche
http://localhost:8090/Status.html        # YaCy Status
http://localhost:8090/CrawlStartExpert.html  # Crawler
http://localhost:5173                    # 3D Visualisierung
http://localhost:8888                    # SearXNG

# Algorithm-Free
https://yewtu.be                         # YouTube Alternative
https://nitter.net                       # Twitter Alternative
https://libreddit.kavin.rocks            # Reddit Alternative
https://openstreetmap.org                # Maps Alternative
```

---

**DEZENTRALE SUCHE - BEAST MODE AKTIVIERT!**
