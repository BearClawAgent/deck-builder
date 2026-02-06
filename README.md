# Claw Spire - Deck Builder

A "Slay the Spire" inspired roguelike deck builder running entirely in the browser.

## Features

- **Two Classes:**
  - **Ironclad (Red):** High HP, healing relic, starts with Strike/Defend/Bash.
  - **Silent (Green):** Lower HP, drawing relic, starts with Neutralize/Survivor/Strike/Defend.
- **Map System:** Generate a 15-floor spire with branching paths. You must choose your path carefully.
  - ⚔️ **Combat:** Normal enemies.
  - 👹 **Elite:** Harder enemies that drop Relics.
  - 🔥 **Rest:** Heal 30% HP.
  - 👑 **Boss:** Final challenge at floor 15.
- **Combat:**
  - Turn-based card combat.
  - Energy system (3 energy per turn).
  - Status effects: Vulnerable (50% more dmg), Weak (25% less dmg), Poison.
  - Intent system: See what the enemy plans to do.
- **Rewards:**
  - Draft new cards after every victory.
  - Gain powerful Relics from Elite enemies.

## Development Roadmap (Phase 2: Visual Overhaul)

The goal is to reach feature parity with the core mechanics of Slay the Spire.

### Phase 1: Core Mechanics (Complete)
- [x] **Fix Game Start:** Ensure "Start Game" button works reliably on all browsers.
- [x] **Events System:** Implement `?` rooms with random text events and choices (Lose HP for Gold, Transform Card, etc.).
- [x] **Shop System:** Implement Gold currency, Shop nodes, buying cards/relics/potions, and Card Removal service.
- [x] **Expanded Card Pool:** Add 10-15 new cards per class (Commons, Uncommons, Rares).
- [x] **Potions:** Implement potion slots and consumables (Fire Potion, Block Potion, etc.).
- [x] **More Relics:** Add 10+ new relics with unique passive effects.
- [x] **Boss Mechanics:** distinct AI for the Boss (phases or special moves).
- [x] **Visual Polish:** Card play animations, damage numbers popping off targets, death animations.

### Phase 2: Art & UX (Current)
- [x] **Full Screen UI:** Update CSS to make the play area fill the entire browser window (100vw/100vh).
- [x] **Character Layout:** Move Player character left and up to avoid overlap with hand cards.
- [x] **Card Template:** Create a consistent HTML/CSS frame for cards with detailed image for the template border, like a MTG card (border, title, cost, desc, image container).
- [x] **Card Hover UX:** Add detailed tooltips and descriptions when hovering cards.
- [x] **Gen Art: Characters:** Use `nano-banana-pro` to generate Ironclad/Silent sprites. Style: "Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic." (Transparent bg).
- [x] **Gen Art: Backgrounds:** Use `nano-banana-pro` to generate detailed fight backgrounds (Ground, Near, Far layers). Same thick-line comic style.
- [x] **Parallax Effect:** Implement parallax scrolling/mouse-movement for the background layers in a fight scene. The characters are standing on the ground, and 2 layers of background behind them, close and far. The close layer should move more than the far layer when the mouse moves.
- [x] **Gen Art: Cards:** Use `nano-banana-pro` to generate unique art for all implemented cards. Style: High contrast, thick lines, dynamic action shots.

## How to Play

1. Open `index.html` in your browser.
2. Click "Start Game".
3. Select your Class.
4. Click on a highlighted Map Node (start at the bottom) to begin.
5. **In Combat:**
   - Click cards in your hand to play them.
   - Manage your Energy (blue orb).
   - Defeat the enemy before they defeat you!
   - Click "End Turn" when out of energy.
6. Climb to the top!

## Tech Stack

- Vanilla HTML/CSS/JS.
- No external dependencies.
- Single-page application architecture.
