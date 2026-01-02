# Game-Based Learning Platform 🎮

A modular, pack-driven learning platform designed primarily for hearing-impaired children, using **games + visuals** to make learning engaging, structured, and resilient.

Built to scale across multiple sign systems, categories, and game types.

---

## 🧠 Core Idea

Instead of hard-coding games and content:

- **Content is organized into Packs**
- **Games are generic and reusable**
- **Visuals are data-driven**
- **Assets are preloaded once per pack**
- **Games are sandboxed to prevent crashes**

This allows new content to be added **without touching game logic**.

---

## 🧩 Architecture Overview

### 🔹 Screen Flow (State-Driven Routing)

```
Main Page (Categories)
   ↓
Sign Type Page (Packs)
   ↓
Content Page (Games)
   ↓
Game Screen (Learn / Quiz / Match / etc.)
```

No React Router — navigation is handled via **explicit app state** for better control and recovery.

---

## 📦 Packs & Data-Driven Content

Each **Pack** represents a learning unit (e.g. Alphabets, Colors, Everyday Objects).

A pack includes:
- Structured JSON data
- Visual definitions (style / image / svg / color)
- Optional preloaded assets (images, videos, SVGs)

Example:
```json
{
  "name": "Colors",
  "visual": { "type": "color", "value": "#FF0000" }
}
```

---

## 🎨 Sign Visual System

All visuals are rendered through a **single component**:

```
src/components/SignVisual.jsx
```

Supported visual types:
- `style` → centered text on styled background
- `color` → solid color blocks
- `image` → preloaded images
- `svg` → scalable vector signs

Games do **not care** how a sign is rendered — they just receive data.

---

## ⚡ Asset Preloading

- Packs preload their assets **once**
- Stored in memory via a shared preload utility
- Passed down to games as `assets`

This ensures:
- No repeated loading
- Faster gameplay
- Offline-friendly structure (future-ready)

---

## 🎮 Game System

Games are:
- **Generic**
- **Reusable**
- **Unlocked via progress**
- **Pack-agnostic**

Current game types:
- Learn
- Quiz
- Match
- (Sequence planned)

Games receive:
```js
{
  data,        // pack signs
  pack,
  category,
  assets,
  onExit
}
```

---

## 🛡️ Crash-Safe Design (Important)

Each game is wrapped in a **Game Error Boundary**.

If a game:
- crashes
- has a missing variable
- receives invalid data

➡️ The app **automatically recovers**:
- Returns to Pack Content Screen
- Shows a modal: *“Game failed to load. Please try again later.”*

This prevents white screens and user lock-out.

---

## 💾 Progress Tracking

Progress is stored locally:
- Completion status
- Best score
- Attempt count
- Game unlock logic

Handled via:
```
src/utils/storage.js
```

---

## 🗂️ Folder Structure (Key Parts)

```
src/
 ├─ components/
 │   ├─ MainPage.jsx
 │   ├─ SignTypePage.jsx
 │   ├─ ContentPage.jsx
 │   ├─ SignVisual.jsx
 │   └─ GameErrorBoundary.jsx
 │
 ├─ games/
 │   ├─ LearnGame.jsx
 │   ├─ QuizGame.jsx
 │   ├─ MatchGame.jsx
 │
 ├─ data/
 │   ├─ categories.json
 │   ├─ packs/
 │   └─ gameTemplates.json
 │
 ├─ utils/
 │   ├─ preloadPack.js
 │   └─ storage.js
 │
 └─ App.jsx
```

---

## 🛠️ Tech Stack

- React (Vite)
- Tailwind CSS
- LocalStorage
- Data-driven JSON architecture
- No external state libraries

---

## ▶️ Run the Project

```bash
npm install
npm run dev
```

---

## 🌱 Future Roadmap

- More game types
- Better animations
- Accessibility tuning
- Analytics & progress sync
- Optional backend support

---

❤️ Built with care for accessible, resilient, and scalable learning.