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
