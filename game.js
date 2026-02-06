const STATE = {
    view: 'title', // title, class, map, combat, reward, gameover
    player: {
        class: null,
        hp: 80,
        maxHp: 80,
        gold: 0,
        energy: 3,
        maxEnergy: 3,
        block: 0,
        deck: [],
        hand: [],
        discard: [],
        drawPile: [],
        relics: [],
        potions: [], // Max 3
        status: {}
    },
    enemy: null,
    map: [],
    currentFloor: -1,
    currentPathIndex: -1,
    shop: null, // Store shop state
    rng: Math.random
};

const KEYWORD_DB = {
    "Strength": "Increases attack damage by X.",
    "Dexterity": "Increases Block gained from cards by X.",
    "Vulnerable": "Target takes 50% more damage from attacks.",
    "Weak": "Target deals 25% less damage with attacks.",
    "Poison": "At the end of their turn, target takes X damage and Poison reduces by 1.",
    "Block": "Prevents damage until next turn.",
    "Exhaust": "Removed from your deck until the end of combat.",
    "Wrath": "Deal double damage. Take double damage.",
    "Calm": "When you leave this stance, gain 2 Energy.",
    "Shiv": "0 Cost Attack. Deal 4 damage. Exhaust.",
    "Dazed": "Unplayable. Ethereal.",
    "Wound": "Unplayable."
};

function getKeywordsFromText(text) {
    if (!text) return [];
    return Object.keys(KEYWORD_DB).filter(k => text.includes(k));
}

function showTooltip(e, keywords) {
    const container = document.getElementById('tooltip-container');
    if (!keywords || keywords.length === 0) return;
    
    container.innerHTML = '';
    keywords.forEach(k => {
        const div = document.createElement('div');
        div.className = 'tooltip-keyword';
        div.innerHTML = `<span class="tooltip-title">${k}</span> ${KEYWORD_DB[k]}`;
        container.appendChild(div);
    });
    
    container.style.display = 'block';
    moveTooltip(e);
}

function hideTooltip() {
    const container = document.getElementById('tooltip-container');
    container.style.display = 'none';
}

function moveTooltip(e) {
    const container = document.getElementById('tooltip-container');
    if (container.style.display === 'none') return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    // Offset to avoid cursor
    let top = y + 15;
    let left = x + 15;
    
    // Bounds check
    if (left + 250 > window.innerWidth) left = x - 265;
    if (top + container.offsetHeight > window.innerHeight) top = y - container.offsetHeight - 10;
    
    container.style.left = `${left}px`;
    container.style.top = `${top}px`;
}

const CARD_DB = {
    "Strike": { type: "Attack", cost: 1, val: 6, desc: "Deal 6 damage.", img: "⚔️" },
    "Defend": { type: "Skill", cost: 1, block: 5, desc: "Gain 5 Block.", img: "🛡️" },
    "Bash": { type: "Attack", cost: 2, val: 8, vul: 2, desc: "Deal 8 dmg. Apply 2 Vulnerable.", img: "🔨" },
    "Neutralize": { type: "Attack", cost: 0, val: 3, weak: 1, desc: "Deal 3 dmg. Apply 1 Weak.", img: "🧪" },
    "Survivor": { type: "Skill", cost: 1, block: 8, discard: 1, desc: "Gain 8 Block. Discard 1 card.", img: "🌫️" },
    "Eruption": { type: "Attack", cost: 2, val: 9, wrath: true, desc: "Deal 9 dmg. Enter Wrath.", img: "🔥" },
    "Vigilance": { type: "Skill", cost: 2, block: 8, calm: true, desc: "Gain 8 Block. Enter Calm.", img: "🧘" },
    "Cleave": { type: "Attack", cost: 1, val: 8, desc: "Deal 8 damage to ALL enemies (Targeting TBD).", img: "🪓" },
    "Pommel Strike": { type: "Attack", cost: 1, val: 9, draw: 1, desc: "Deal 9 dmg. Draw 1 card.", img: "🗡️" },
    "Shrug It Off": { type: "Skill", cost: 1, block: 8, draw: 1, desc: "Gain 8 Block. Draw 1 card.", img: "🤷" },
    "Deadly Poison": { type: "Skill", cost: 1, poison: 5, desc: "Apply 5 Poison.", img: "☠️" },
    "Blade Dance": { type: "Skill", cost: 1, shivs: 2, desc: "Add 2 Shivs to hand.", img: "🗡️" },
    "Shiv": { type: "Attack", cost: 0, val: 4, exhaust: true, desc: "Deal 4 damage. Exhaust.", img: "🔪" },

    // --- IRONCLAD EXPANSION ---
    "Iron Wave": { type: "Attack", cost: 1, val: 5, block: 5, desc: "Deal 5 damage. Gain 5 Block.", img: "🛡️⚔️" },
    "Clothesline": { type: "Attack", cost: 2, val: 12, weak: 2, desc: "Deal 12 damage. Apply 2 Weak.", img: "🧺" },
    "Thunderclap": { type: "Attack", cost: 1, val: 4, vul: 1, desc: "Deal 4 damage. Apply 1 Vulnerable.", img: "⚡" },
    "Twin Strike": { type: "Attack", cost: 1, val: 10, desc: "Deal 10 damage.", img: "⚔️⚔️" },
    "Sword Boomerang": { type: "Attack", cost: 1, val: 9, desc: "Deal 9 damage.", img: "🪃" },
    "Inflame": { type: "Power", cost: 1, strength_gain: 2, desc: "Gain 2 Strength.", img: "💪" },
    "Spot Weakness": { type: "Skill", cost: 1, strength_gain: 3, desc: "Gain 3 Strength.", img: "🎯" },
    "Reaper": { type: "Attack", cost: 2, val: 4, heal: 4, desc: "Deal 4 damage. Heal 4 HP.", img: "🧛" },
    "Flame Barrier": { type: "Skill", cost: 2, block: 12, desc: "Gain 12 Block.", img: "🔥🛡️" },
    "Uppercut": { type: "Attack", cost: 2, val: 13, weak: 1, vul: 1, desc: "Deal 13 dmg. Apply 1 Weak, 1 Vuln.", img: "🥊" },

    // --- SILENT EXPANSION ---
    "Dagger Spray": { type: "Attack", cost: 1, val: 4, desc: "Deal 4 damage.", img: "🗡️💨" },
    "Dagger Throw": { type: "Attack", cost: 1, val: 9, draw: 1, desc: "Deal 9 damage. Draw 1 card.", img: "🗡️🎯" },
    "Poisoned Stab": { type: "Attack", cost: 1, val: 6, poison: 3, desc: "Deal 6 dmg. Apply 3 Poison.", img: "🗡️☠️" },
    "Sucker Punch": { type: "Attack", cost: 1, val: 7, weak: 1, desc: "Deal 7 damage. Apply 1 Weak.", img: "👊" },
    "Backflip": { type: "Skill", cost: 1, block: 5, draw: 2, desc: "Gain 5 Block. Draw 2 cards.", img: "🤸" },
    "Footwork": { type: "Power", cost: 1, dexterity_gain: 2, desc: "Gain 2 Dexterity.", img: "👟" },
    "Leg Sweep": { type: "Skill", cost: 2, block: 11, weak: 2, desc: "Gain 11 Block. Apply 2 Weak.", img: "🦵" },
    "Crippling Cloud": { type: "Skill", cost: 2, poison: 3, weak: 2, desc: "Apply 3 Poison and 2 Weak.", img: "☁️" },
    "Bouncing Flask": { type: "Skill", cost: 2, poison: 9, desc: "Apply 9 Poison.", img: "🏺" },
    "Adrenaline": { type: "Skill", cost: 0, energy_gain: 1, draw: 2, exhaust: true, desc: "Gain 1 Energy. Draw 2. Exhaust.", img: "💉" }
};

const RELIC_DB = [
    { name: "Vajra", desc: "Start each combat with 1 Strength." },
    { name: "Anchor", desc: "Start each combat with 10 Block." },
    { name: "Bag of Marbles", desc: "At start of combat, apply 1 Vulnerable to enemies." },
    { name: "Happy Flower", desc: "Every 3 turns, gain 1 Energy." },
    { name: "Oddly Smooth Stone", desc: "Start each combat with 1 Dexterity." },
    { name: "Lantern", desc: "Gain 1 Energy on the first turn of combat." },
    { name: "Blood Vial", desc: "At start of combat, heal 2 HP." },
    { name: "Bag of Preparation", desc: "Draw 2 additional cards on the first turn of combat." },
    { name: "Orichalcum", desc: "If you end your turn without Block, gain 6 Block." },
    { name: "Regal Pillow", desc: "Heal an additional 15 HP when you Rest." },
    { name: "Meal Ticket", desc: "Heal 15 HP whenever you enter a shop." },
    { name: "Mutagenic Strength", desc: "Start each combat with 3 Strength that is lost at the end of turn 1." },
    { name: "Red Skull", desc: "While your HP is at or below 50%, you have 3 additional Strength." },
    { name: "Paper Phrog", desc: "Enemies with Vulnerable take 75% more damage rather than 50%." }
];

const POTION_DB = {
    "Fire Potion": { desc: "Deal 20 damage to the enemy.", rarity: "common", effect: (s) => { 
        s.enemy.hp -= 20; 
        if (s.enemy.hp < 0) s.enemy.hp = 0;
    }},
    "Block Potion": { desc: "Gain 12 Block.", rarity: "common", effect: (s) => { 
        s.player.block += 12; 
    }},
    "Energy Potion": { desc: "Gain 2 Energy.", rarity: "common", effect: (s) => { 
        s.player.energy += 2; 
    }},
    "Strength Potion": { desc: "Gain 2 Strength.", rarity: "uncommon", effect: (s) => { 
        s.player.status.strength = (s.player.status.strength || 0) + 2; 
    }},
    "Weak Potion": { desc: "Apply 3 Weak to the enemy.", rarity: "common", effect: (s) => { 
        s.enemy.status.weak = (s.enemy.status.weak || 0) + 3; 
    }}
};

const ENEMY_DB = [
    { name: "Cultist", hp: 48, intent: "buff", val: 0, sprite: "🦅" },
    { name: "Jaw Worm", hp: 40, intent: "attack", val: 11, sprite: "🐛" },
    { name: "Louse", hp: 10, intent: "debuff", val: 0, sprite: "🐜" }
];

const BOSS_DB = {
    "The Guardian": { 
        name: "The Guardian", 
        hp: 200, 
        sprite: "🗿",
        logic: (turn) => {
            const cycle = (turn - 1) % 3; // 0, 1, 2
            if (cycle === 0) {
                return { intent: 'attack', val: 12, hits: 1, desc: "Smash" };
            } else if (cycle === 1) {
                return { intent: 'defend', block: 20, desc: "Fortify" };
            } else {
                return { intent: 'attack', val: 4, hits: 3, desc: "Whirlwind" };
            }
        }
    }
};

const EVENT_DB = [
    {
        id: "fountain",
        title: "The Divine Fountain",
        image: "⛲",
        desc: "You stumble upon a glowing fountain of pristine water. You feel thirsty.",
        options: [
            { text: "Drink (Heal 20 HP)", action: (p) => { p.hp = Math.min(p.maxHp, p.hp + 20); return "You feel refreshed."; } },
            { text: "Fill Bottle (Remove a Card)", action: (p) => { 
                // Simple removal: Remove random card for now, or prompt? 
                // To keep it simple for this step: remove a random Strike or Defend if possible
                const idx = p.deck.findIndex(c => c === 'Strike' || c === 'Defend');
                if (idx > -1) {
                    const removed = p.deck.splice(idx, 1)[0];
                    return `You bottled the water. ${removed} removed from deck.`;
                }
                return "You have no basic cards to remove!";
            } },
            { text: "Leave", action: () => "You walk away." }
        ]
    },
    {
        id: "world_of_goop",
        title: "World of Goop",
        image: "🦠",
        desc: "You fall into a puddle of slime. It speaks to you. 'Give me gold... or flesh...'",
        options: [
            { text: "Offer Flesh (Lose 10 HP, Gain 50 Gold)", action: (p) => { 
                p.hp -= 10; 
                p.gold += 50; 
                return "The goop takes your blood. You find gold inside."; 
            } },
            { text: "Leave", action: () => "You scramble out of the pit." }
        ]
    },
    {
        id: "cursed_tome",
        title: "Cursed Tome",
        image: "📖",
        desc: "An ancient book lies open. It promises power at a price.",
        options: [
            { text: "Read (Lose 5 HP, Gain random card)", action: (p) => {
                p.hp -= 5;
                const keys = Object.keys(CARD_DB);
                const c = keys[Math.floor(Math.random() * keys.length)];
                p.deck.push(c);
                return `You read the forbidden words. Acquired ${c}.`;
            } },
            { text: "Leave", action: () => "Better not touch it." }
        ]
    }
];

const CLASSES = {
    "Ironclad": { hp: 80, relic: "Burning Blood", deck: ["Strike", "Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Bash"], icon: "🔴", color: "#e74c3c", img: "assets/ironclad.svg" },
    "Silent": { hp: 70, relic: "Ring of Snake", deck: ["Strike", "Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Defend", "Neutralize", "Survivor"], icon: "🟢", color: "#2ecc71", img: "assets/silent.svg" }
};

// --- INITIALIZATION ---
window.onload = () => {
    showView('title');
    document.getElementById('btn-start-game').onclick = startGame;
};

function showView(viewName) {
    // Cleanup previous view's effects
    if (STATE.view === 'combat' && cleanupParallax) {
        cleanupParallax();
        cleanupParallax = null;
    }

    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    STATE.view = viewName;

    // Setup new view's effects
    if (viewName === 'combat') {
        cleanupParallax = initParallax();
    }
}

// --- GAME FLOW ---
function startGame() {
    showView('class');
    renderClassSelection();
}

function renderClassSelection() {
    const container = document.getElementById('class-selection');
    container.innerHTML = '';
    Object.keys(CLASSES).forEach(clsKey => {
        const cls = CLASSES[clsKey];
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `
            <div class="class-icon" style="color:${cls.color}">${cls.icon}</div>
            <h2>${clsKey}</h2>
            <p>HP: ${cls.hp}</p>
            <p>${cls.relic}</p>
        `;
        card.onclick = () => selectClass(clsKey);
        container.appendChild(card);
    });
}

function selectClass(className) {
    const cls = CLASSES[className];
    STATE.player.class = className;
    STATE.player.maxHp = cls.hp;
    STATE.player.hp = cls.hp;
    STATE.player.deck = [...cls.deck];
    STATE.player.relics = [cls.relic];
    STATE.currentFloor = -1;

    // Update Player Sprite
    const spriteContainer = document.querySelector('#player-entity .entity-sprite');
    if(spriteContainer) {
        spriteContainer.innerHTML = `<img src="${cls.img}" alt="${className}" style="width:100%; height:100%;">`;
    }
    
    generateMap();
    nextFloor();
}

// --- MAP SYSTEM ---
function generateMap() {
    STATE.map = [];
    const floors = 15;
    const width = 7;
    
    // Simple generation: each floor has nodes, connections to next floor
    for (let f = 0; f < floors; f++) {
        const row = [];
        let type = 'combat';
        if (f === 0) type = 'combat';
        else if (f === floors - 1) type = 'boss';
        else if (f % 4 === 0) type = 'elite'; // Simple logic
        else if (f % 3 === 0) type = 'event'; // Simple logic
        else if (f === 8) type = 'rest';
        
        // Randomize slightly
        const count = 3 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < count; i++) {
            // Re-roll type for variety inside the row
            let nodeType = type;
            if (f > 0 && f < floors - 1 && f !== 8) {
                const r = Math.random();
                if (r < 0.5) nodeType = 'combat';
                else if (r < 0.7) nodeType = 'event';
                else if (r < 0.85) nodeType = 'shop';
                else nodeType = 'elite';
            }
            if (f === 8) nodeType = 'rest'; // Hardcoded rest

            row.push({
                id: `f${f}-n${i}`,
                floor: f,
                index: i,
                type: nodeType,
                parents: [], // Nodes in f-1 that connect to this
                children: [] // Nodes in f+1
            });
        }
        STATE.map.push(row);
    }

    // Connect nodes
    for (let f = 0; f < floors - 1; f++) {
        const currentRow = STATE.map[f];
        const nextRow = STATE.map[f+1];
        
        currentRow.forEach(node => {
            // Connect to at least one node in next row
            // Simple logic: connect to nearby indices
            const start = Math.max(0, Math.floor(node.index * (nextRow.length / currentRow.length)));
            const end = Math.min(nextRow.length - 1, start + 1);
            
            for (let i = start; i <= end; i++) {
                node.children.push(i);
                nextRow[i].parents.push(node.index);
            }
        });
        
        // Ensure every next-row node has a parent (orphan prevention)
        nextRow.forEach((node, idx) => {
            if (node.parents.length === 0) {
                const parentIdx = Math.floor(idx * (currentRow.length / nextRow.length));
                currentRow[parentIdx].children.push(idx);
                node.parents.push(parentIdx);
            }
        });
    }
}

function renderMap() {
    const container = document.getElementById('map-container');
    container.innerHTML = '';
    
    // Render top-down (reverse array) so Boss is at top visually
    [...STATE.map].reverse().forEach((row, rIdx) => {
        const floorIdx = STATE.map.length - 1 - rIdx;
        const rowEl = document.createElement('div');
        rowEl.className = 'map-row';
        
        row.forEach(node => {
            const el = document.createElement('div');
            el.className = `map-node ${getNodeIcon(node.type)}`;
            el.innerHTML = getIconChar(node.type);
            
            // Interaction logic
            let isAccessible = false;
            if (STATE.currentFloor === -1 && floorIdx === 0) isAccessible = true;
            else if (floorIdx === STATE.currentFloor + 1) {
                // Check if connected to current node
                const prevNode = STATE.map[STATE.currentFloor][STATE.currentPathIndex];
                if (prevNode && prevNode.children.includes(node.index)) isAccessible = true;
            }

            if (floorIdx < STATE.currentFloor) el.classList.add('visited');
            else if (floorIdx === STATE.currentFloor && node.index === STATE.currentPathIndex) {
                el.classList.add('active'); // Current location
                el.classList.add('visited');
            }
            else if (isAccessible) {
                el.classList.add('active');
                el.onclick = () => visitNode(node);
            } else {
                el.classList.add('locked');
            }

            rowEl.appendChild(el);
        });
        container.appendChild(rowEl);
    });
}

function getNodeIcon(type) {
    return type; // class name
}
function getIconChar(type) {
    const map = { combat: '⚔️', elite: '👹', boss: '👑', event: '?', rest: '🔥', shop: '💰' };
    return map[type] || '❓';
}

function visitNode(node) {
    STATE.currentFloor = node.floor;
    STATE.currentPathIndex = node.index;
    
    if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss') {
        startCombat(node.type);
    } else if (node.type === 'event') {
        startEvent();
    } else if (node.type === 'shop') {
        if (STATE.player.relics.includes("Meal Ticket")) {
             STATE.player.hp = Math.min(STATE.player.maxHp, STATE.player.hp + 15);
        }
        startShop();
    } else if (node.type === 'rest') {
        // Auto heal for now
        let healAmt = Math.floor(STATE.player.maxHp * 0.3);
        if (STATE.player.relics.includes("Regal Pillow")) healAmt += 15;
        
        STATE.player.hp = Math.min(STATE.player.maxHp, STATE.player.hp + healAmt);
        alert(`Rested! Healed ${healAmt} HP.`);
        nextFloor(); // Go back to map
    } else {
        alert(`Visited ${node.type}. Nothing happened yet.`);
        nextFloor();
    }
}

// --- EVENT SYSTEM ---
function startEvent() {
    showView('event');
    const event = EVENT_DB[Math.floor(Math.random() * EVENT_DB.length)];
    
    document.getElementById('event-title').innerText = event.title;
    document.getElementById('event-image').innerText = event.image;
    document.getElementById('event-desc').innerText = event.desc;
    
    const container = document.getElementById('event-options');
    container.innerHTML = '';
    
    event.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'event-option-btn';
        // Basic style for now
        btn.style.padding = '15px';
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        btn.style.background = '#34495e';
        btn.style.color = 'white';
        btn.style.border = '1px solid #7f8c8d';
        btn.style.cursor = 'pointer';
        btn.style.marginBottom = '10px';
        
        btn.onmouseover = () => btn.style.background = '#2c3e50';
        btn.onmouseout = () => btn.style.background = '#34495e';
        
        btn.innerText = `[${idx+1}] ${opt.text}`;
        btn.onclick = () => handleEventOption(opt);
        container.appendChild(btn);
    });
}

function handleEventOption(opt) {
    const resultText = opt.action(STATE.player);
    
    // Show result
    document.getElementById('event-desc').innerText += `\n\n> ${resultText}`;
    
    // Clear options and add "Continue"
    const container = document.getElementById('event-options');
    container.innerHTML = '';
    
    const btn = document.createElement('button');
    btn.className = 'event-option-btn'; // reuse style class if I added it to CSS, otherwise inline again?
    // Let's just inline for consistency with above for now
    btn.style.padding = '15px';
    btn.style.width = '100%';
    btn.style.background = '#27ae60';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.innerText = "Continue";
    btn.onclick = () => {
        if (STATE.player.hp <= 0) {
            alert("You died from the event!");
            location.reload();
        } else {
            nextFloor();
        }
    };
    container.appendChild(btn);
}

function nextFloor() {
    showView('map');
    renderMap();
}

// --- COMBAT SYSTEM ---
function startCombat(type) {
    showView('combat');
    // Setup Enemy
    let enemyData;
    if (type === 'boss') {
        enemyData = BOSS_DB["The Guardian"];
    } else {
        enemyData = ENEMY_DB[Math.floor(Math.random() * ENEMY_DB.length)];
    }

    STATE.enemy = {
        name: enemyData.name,
        hp: enemyData.hp,
        maxHp: enemyData.hp,
        block: 0,
        intent: 'unknown',
        nextVal: 0,
        sprite: enemyData.sprite,
        status: {},
        logic: enemyData.logic // Store AI logic
    };
    // Default intent for non-bosses (legacy support)
    if (!STATE.enemy.logic) {
        STATE.enemy.intent = enemyData.intent;
        STATE.enemy.nextVal = enemyData.val;
    }

    if (type === 'elite') STATE.enemy.hp = Math.floor(STATE.enemy.hp * 1.5);

    // Setup Player
    STATE.player.drawPile = [...STATE.player.deck]; // Copy deck
    shuffle(STATE.player.drawPile);
    STATE.player.hand = [];
    STATE.player.discard = [];
    STATE.player.energy = 3;
    STATE.player.block = 0;
    STATE.player.status = { strength: 0, dexterity: 0, weak: 0, vulnerable: 0 };
    STATE.enemy.status = { poison: 0, weak: 0, vulnerable: 0 };

    // Apply Relics
    if (STATE.player.relics.includes("Vajra")) STATE.player.status.strength += 1;
    if (STATE.player.relics.includes("Anchor")) STATE.player.block += 10;
    if (STATE.player.relics.includes("Bag of Marbles")) STATE.enemy.status.vulnerable += 1;
    if (STATE.player.relics.includes("Oddly Smooth Stone")) STATE.player.status.dexterity += 1;
    if (STATE.player.relics.includes("Blood Vial")) STATE.player.hp = Math.min(STATE.player.maxHp, STATE.player.hp + 2);
    if (STATE.player.relics.includes("Mutagenic Strength")) STATE.player.status.strength += 3;
    if (STATE.player.relics.includes("Ring of Snake")) drawCards(2);

    STATE.turn = 0;
    startTurn();
    updateCombatUI();
}

function updateEnemyIntent() {
    if (STATE.enemy.logic) {
        const move = STATE.enemy.logic(STATE.turn);
        STATE.enemy.intent = move.intent;
        STATE.enemy.nextVal = move.val || 0;
        STATE.enemy.nextBlock = move.block || 0;
        STATE.enemy.hits = move.hits || 1;
        STATE.enemy.intentDesc = move.desc || "";
    } else {
        // Basic AI Overrides
        if (STATE.enemy.name === "Cultist") {
            if (STATE.turn === 1) {
                STATE.enemy.intent = 'buff';
            } else {
                STATE.enemy.intent = 'attack';
                STATE.enemy.nextVal = 6 + STATE.turn; 
            }
        } else if (STATE.enemy.name === "Jaw Worm") {
            // Simple cycle
            const r = STATE.turn % 3;
            if (r === 1) { STATE.enemy.intent = 'attack'; STATE.enemy.nextVal = 11; }
            else if (r === 2) { STATE.enemy.intent = 'defend'; STATE.enemy.nextBlock = 5; }
            else { STATE.enemy.intent = 'buff'; }
        }
    }
}

function startTurn() {
    // Re-enable end turn button
    const endTurnBtn = document.querySelector('.end-turn-btn');
    if (endTurnBtn) {
        endTurnBtn.disabled = false;
        endTurnBtn.style.opacity = 1;
    }

    STATE.turn++;
    updateEnemyIntent();
    STATE.player.energy = 3;
    
    // Turn 1 Relics that give Energy
    if (STATE.turn === 1) {
        if (STATE.player.relics.includes("Lantern")) STATE.player.energy += 1;
        if (STATE.player.relics.includes("Ancient Tea Set")) { 
             // Logic for tea set requires persistent state from previous Rest. 
             // Skipping for now as I didn't add it to DB, sticking to list.
        }
    }
    
    // Happy Flower
    if (STATE.player.relics.includes("Happy Flower") && STATE.turn % 3 === 0) {
        STATE.player.energy += 1;
    }

    STATE.player.block = 0; // Block expires
    
    // Draw
    drawCards(5);

    // Bag of Preparation (Turn 1)
    if (STATE.turn === 1 && STATE.player.relics.includes("Bag of Preparation")) {
        drawCards(2);
    }

    updateCombatUI();
}

function drawCards(n) {
    for (let i = 0; i < n; i++) {
        if (STATE.player.drawPile.length === 0) {
            if (STATE.player.discard.length === 0) break;
            STATE.player.drawPile = [...STATE.player.discard];
            STATE.player.discard = [];
            shuffle(STATE.player.drawPile);
        }
        STATE.player.hand.push(STATE.player.drawPile.pop());
    }
}

// --- VISUAL POLISH ---
function showFloatingText(targetId, text, color) {
    const target = document.getElementById(targetId);
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.color = color;
    
    // Center on target
    const left = rect.left + rect.width / 2;
    const top = rect.top;
    
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    
    document.body.appendChild(el);
    
    // Remove after animation
    setTimeout(() => {
        el.remove();
    }, 1000);
}

function animateCardPlay(cardIndex, targetId, callback) {
    const handContainer = document.getElementById('hand-container');
    const cardEl = handContainer.children[cardIndex];
    if (!cardEl) {
        callback();
        return;
    }

    // Clone for animation to avoid layout shifts in hand immediately
    const clone = cardEl.cloneNode(true);
    const rect = cardEl.getBoundingClientRect();
    
    clone.classList.add('played-anim');
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.margin = '0';
    
    document.body.appendChild(clone);
    
    // Hide original
    cardEl.style.opacity = '0';
    
    // Move to target
    const target = document.getElementById(targetId);
    const targetRect = target.getBoundingClientRect();
    
    // Force reflow
    clone.getBoundingClientRect();
    
    // Animate to center of target
    clone.style.top = `${targetRect.top + targetRect.height/2 - rect.height/2}px`;
    clone.style.left = `${targetRect.left + targetRect.width/2 - rect.width/2}px`;
    clone.style.opacity = '0';
    clone.style.transform = 'scale(0.5)';
    
    setTimeout(() => {
        clone.remove();
        callback();
    }, 500);
}

async function playCard(handIndex) {
    if (STATE.view !== 'combat') return; // Safety
    
    const cardName = STATE.player.hand[handIndex];
    const card = CARD_DB[cardName];
    
    if (STATE.player.energy < card.cost) return; // Not enough energy
    
    // Lock interaction
    const oldOnClick = document.getElementById('hand-container').style.pointerEvents;
    document.getElementById('hand-container').style.pointerEvents = 'none';

    // Determine visual target (Self for skills/buffs, Enemy for attacks)
    // Simple heuristic: if it has 'val' (damage) or 'vul'/'weak', it targets enemy.
    let targetId = 'player-entity';
    if (card.val || card.vul || card.weak || card.poison) {
        targetId = 'enemy-entity';
    }

    animateCardPlay(handIndex, targetId, async () => {
        STATE.player.energy -= card.cost;
        STATE.player.hand.splice(handIndex, 1);
        STATE.player.discard.push(cardName);
        
        // Effects
        if (card.val) {
            let dmg = card.val;
            
            // Strength
            let strength = STATE.player.status.strength || 0;
            if (STATE.player.relics.includes("Red Skull") && STATE.player.hp <= STATE.player.maxHp * 0.5) {
                strength += 3;
            }
            dmg += strength;

            // Vulnerable
            if (STATE.enemy.status.vulnerable) {
                const vulnMult = STATE.player.relics.includes("Paper Phrog") ? 1.75 : 1.5;
                dmg = Math.floor(dmg * vulnMult);
            }

            if (STATE.player.status.weak) dmg = Math.floor(dmg * 0.75);
            
            let blocked = Math.min(STATE.enemy.block, dmg);
            STATE.enemy.block -= blocked;
            const actualDmg = dmg - blocked;
            STATE.enemy.hp -= actualDmg;
            
            // Visual Damage
            if (actualDmg > 0) {
                showFloatingText('enemy-entity', `-${actualDmg}`, '#e74c3c');
                // Shake effect
                const enemyEl = document.getElementById('enemy-entity');
                enemyEl.classList.add('shake');
                setTimeout(() => enemyEl.classList.remove('shake'), 500);
            } else {
                showFloatingText('enemy-entity', "Blocked", '#3498db');
            }
        }
        
        // Block
        if (card.block) {
            let blk = card.block;
            if (STATE.player.status.dexterity) blk += STATE.player.status.dexterity;
            STATE.player.block += blk;
            showFloatingText('player-entity', `+${blk} 🛡️`, '#3498db');
        }
        
        if (card.vul) {
            STATE.enemy.status.vulnerable = (STATE.enemy.status.vulnerable || 0) + card.vul;
            showFloatingText('enemy-entity', "Vulnerable", '#f39c12');
        }
        if (card.weak) {
            STATE.enemy.status.weak = (STATE.enemy.status.weak || 0) + card.weak;
            showFloatingText('enemy-entity', "Weak", '#f39c12');
        }
        if (card.draw) {
            drawCards(card.draw);
        }
        if (card.poison) {
            STATE.enemy.status.poison = (STATE.enemy.status.poison || 0) + card.poison;
            showFloatingText('enemy-entity', `${card.poison} Poison`, '#2ecc71');
        }
        if (card.shivs) {
            for(let i=0; i<card.shivs; i++) {
                if (STATE.player.hand.length < 10) STATE.player.hand.push("Shiv");
            }
        }
        if (card.exhaust) {
            const idx = STATE.player.discard.indexOf(cardName); // Logic fix: playCard pushes to discard earlier in this func
             // We just pushed it: STATE.player.discard.push(cardName);
             // So pop it back off
             STATE.player.discard.pop();
        }
        
        // New Mechanics Support
        if (card.strength_gain) {
            STATE.player.status.strength = (STATE.player.status.strength || 0) + card.strength_gain;
            showFloatingText('player-entity', `+${card.strength_gain} Str`, '#e74c3c');
        }
        if (card.dexterity_gain) {
            STATE.player.status.dexterity = (STATE.player.status.dexterity || 0) + card.dexterity_gain;
            showFloatingText('player-entity', `+${card.dexterity_gain} Dex`, '#2ecc71');
        }
        if (card.energy_gain) {
            STATE.player.energy += card.energy_gain;
            showFloatingText('player-entity', `+${card.energy_gain} Energy`, '#f1c40f');
        }
        if (card.heal) {
            STATE.player.hp = Math.min(STATE.player.maxHp, STATE.player.hp + card.heal);
            showFloatingText('player-entity', `+${card.heal} HP`, '#2ecc71');
        }

        updateCombatUI();

        // Check Win
        if (STATE.enemy.hp <= 0) {
            document.getElementById('enemy-entity').classList.add('dead');
            setTimeout(() => {
                winCombat();
                document.getElementById('hand-container').style.pointerEvents = 'auto';
                document.getElementById('enemy-entity').classList.remove('dead');
            }, 1000);
            return;
        }
        
        document.getElementById('hand-container').style.pointerEvents = 'auto';
    });
}

function endTurn() {
    const endTurnBtn = document.querySelector('.end-turn-btn');
    if (endTurnBtn.disabled) return;
    endTurnBtn.disabled = true;
    endTurnBtn.style.opacity = 0.5;

    // End of Turn Relics
    if (STATE.player.relics.includes("Orichalcum") && STATE.player.block === 0) {
        STATE.player.block += 6;
    }
    if (STATE.turn === 1 && STATE.player.relics.includes("Mutagenic Strength")) {
        STATE.player.status.strength -= 3;
    }

    // Poison Damage
    if (STATE.enemy.status.poison > 0) {
        STATE.enemy.hp -= STATE.enemy.status.poison;
        showFloatingText('enemy-entity', `-${STATE.enemy.status.poison}`, '#2ecc71');
        STATE.enemy.status.poison--;
        updateCombatUI();
        
        if (STATE.enemy.hp <= 0) {
             document.getElementById('enemy-entity').classList.add('dead');
             setTimeout(() => winCombat(), 1000);
             return;
        }
    }

    // Enemy Action - with delay for visual pacing
    setTimeout(() => {
        const intent = STATE.enemy.intent;
        const str = STATE.enemy.status.strength || 0;
        
        if (intent === 'attack' || intent === 'multi_attack') {
            const hits = STATE.enemy.hits || 1;
            
            // Function to handle multiple hits sequentially
            let hitCount = 0;
            const hitInterval = setInterval(() => {
                if (hitCount >= hits) {
                    clearInterval(hitInterval);
                    finishTurn();
                    return;
                }
                
                let dmg = STATE.enemy.nextVal + str;
                if (STATE.enemy.status.weak) dmg = Math.floor(dmg * 0.75);
                
                let blocked = Math.min(STATE.player.block, dmg);
                STATE.player.block -= blocked;
                const actualDmg = dmg - blocked;
                STATE.player.hp -= actualDmg;
                
                if (actualDmg > 0) {
                    showFloatingText('player-entity', `-${actualDmg}`, '#e74c3c');
                    const pEl = document.getElementById('player-entity');
                    pEl.classList.add('shake');
                    setTimeout(() => pEl.classList.remove('shake'), 200);
                } else {
                    showFloatingText('player-entity', "Blocked", '#3498db');
                }
                
                updateCombatUI();
                
                if (STATE.player.hp <= 0) {
                    clearInterval(hitInterval);
                    document.getElementById('player-entity').classList.add('dead');
                    setTimeout(() => {
                        alert("GAME OVER");
                        location.reload();
                    }, 1000);
                }
                
                hitCount++;
            }, 300); // 300ms between hits
            
        } else {
            // Non-attack actions
            if (intent === 'buff') {
                STATE.enemy.status.strength = (STATE.enemy.status.strength || 0) + 2;
                STATE.enemy.nextVal += 2;
                showFloatingText('enemy-entity', "Buff!", '#f1c40f');
            } else if (intent === 'defend') {
                STATE.enemy.block += (STATE.enemy.nextBlock || 0);
                showFloatingText('enemy-entity', "Block", '#3498db');
            } else if (intent === 'defend_buff') {
                STATE.enemy.block += (STATE.enemy.nextBlock || 0);
                // Also attack logic mixed in? 
                // Original code: if nextVal > 0 it attacks. 
                // For simplicity let's just do it instantly
                 if (STATE.enemy.nextVal > 0) {
                     let dmg = STATE.enemy.nextVal + str;
                     if (STATE.enemy.status.weak) dmg = Math.floor(dmg * 0.75);
                     let blocked = Math.min(STATE.player.block, dmg);
                     STATE.player.block -= blocked;
                     STATE.player.hp -= (dmg - blocked);
                     showFloatingText('player-entity', `-${dmg-blocked}`, '#e74c3c');
                }
            } else if (intent === 'debuff') {
                STATE.player.status.weak = (STATE.player.status.weak || 0) + 2;
                showFloatingText('player-entity', "Weakened", '#f39c12');
            }
            
            updateCombatUI();
            finishTurn();
        }
    }, 500);

    function finishTurn() {
        if (STATE.player.hp <= 0) return; // Handled in loop
        
        // Discard Hand
        STATE.player.discard.push(...STATE.player.hand);
        STATE.player.hand = [];
        
        // Status Decay
        if (STATE.enemy.status.vulnerable) STATE.enemy.status.vulnerable--;
        if (STATE.enemy.status.weak) STATE.enemy.status.weak--;

        setTimeout(startTurn, 500);
    }
}

function winCombat() {
    // Relic: Burning Blood
    if (STATE.player.relics.includes("Burning Blood")) {
        STATE.player.hp = Math.min(STATE.player.maxHp, STATE.player.hp + 6);
    }

    showView('reward');
    const container = document.getElementById('reward-choices');
    container.innerHTML = '';

    // Gold Reward
    const goldReward = 10 + Math.floor(Math.random() * 20);
    STATE.player.gold += goldReward;
    
    const goldMsg = document.createElement('div');
    goldMsg.style.color = '#f1c40f';
    goldMsg.style.fontSize = '1.5em';
    goldMsg.style.marginBottom = '20px';
    goldMsg.innerHTML = `<strong>VICTORY!</strong><br>Found ${goldReward} Gold!`;
    container.appendChild(goldMsg);

    // Potion Chance (40%)
    if (STATE.player.potions.length < 3 && Math.random() < 0.4) {
        const pKeys = Object.keys(POTION_DB);
        const pName = pKeys[Math.floor(Math.random() * pKeys.length)];
        STATE.player.potions.push(pName);
        
        const potionMsg = document.createElement('div');
        potionMsg.style.color = '#9b59b6';
        potionMsg.style.fontSize = '1.2em';
        potionMsg.style.marginBottom = '20px';
        potionMsg.innerHTML = `<strong>POTION FOUND:</strong> ${pName}`;
        container.appendChild(potionMsg);
    }
    
    // Check for Elite Relic
    const currentNode = STATE.map[STATE.currentFloor][STATE.currentPathIndex];
    if (currentNode.type === 'elite') {
        const relic = RELIC_DB[Math.floor(Math.random() * RELIC_DB.length)];
        STATE.player.relics.push(relic.name);
        
        const relicMsg = document.createElement('div');
        relicMsg.style.color = '#e67e22';
        relicMsg.style.fontSize = '1.2em';
        relicMsg.style.marginBottom = '20px';
        relicMsg.innerHTML = `<strong>ELITE REWARD:</strong> Found <em>${relic.name}</em>!<br><small>${relic.desc}</small>`;
        container.appendChild(relicMsg);
    }

    // Generate 3 random cards
    const options = [];
    const keys = Object.keys(CARD_DB);
    for (let i=0; i<3; i++) options.push(keys[Math.floor(Math.random() * keys.length)]);
    
    // const container already defined above
    // container.innerHTML = ''; // Actually we want to clear it? No, we appended the relic message.
    // If we clear it here, we lose the relic message.
    
    options.forEach(cName => {
        const cardData = CARD_DB[cName];
        const typeClass = `type-${cardData.type.toLowerCase()}`;
        const el = document.createElement('div');
        el.className = `card reward-card ${typeClass}`;
        el.innerHTML = `
            <div class="card-cost">${cardData.cost}</div>
            <div class="card-image">${cardData.img}</div>
            <div class="card-name">${cName}</div>
            <div class="card-desc">${cardData.desc}</div>
            <div class="card-type-text">${cardData.type}</div>
        `;
        el.onclick = () => {
            STATE.player.deck.push(cName);
            nextFloor();
        };
        
        const keywords = getKeywordsFromText(cardData.desc);
        if (keywords.length > 0) {
            el.onmouseenter = (e) => showTooltip(e, keywords);
            el.onmouseleave = () => hideTooltip();
            el.onmousemove = (e) => moveTooltip(e);
        }

        container.appendChild(el);
    });
    
    const skip = document.createElement('button');
    skip.innerText = "Skip Rewards";
    skip.className = "end-turn-btn"; // reuse style
    skip.style.position = 'relative';
    skip.style.bottom = 'auto';
    skip.style.right = 'auto';
    skip.onclick = () => nextFloor();
    container.appendChild(skip);
}

// --- SHOP SYSTEM ---
function startShop() {
    showView('shop');
    
    // Generate Shop Inventory
    STATE.shop = {
        cards: [],
        relics: [],
        potions: [],
        removalCost: 75,
        canRemove: true
    };

    // 5 Random Cards
    const allCards = Object.keys(CARD_DB);
    for(let i=0; i<5; i++) {
        const c = allCards[Math.floor(Math.random() * allCards.length)];
        const baseCost = 40 + Math.floor(Math.random() * 20); // 40-60 gold
        STATE.shop.cards.push({ name: c, price: baseCost, id: `card-${i}` });
    }

    // 2 Random Relics
    const potentialRelics = RELIC_DB.filter(r => !STATE.player.relics.includes(r.name));
    for(let i=0; i<2 && i<potentialRelics.length; i++) {
        // Simple distinct pick attempt
        let r;
        let attempts = 0;
        do {
            r = potentialRelics[Math.floor(Math.random() * potentialRelics.length)];
            attempts++;
        } while (STATE.shop.relics.find(existing => existing.name === r.name) && attempts < 10);
        
        if (r && !STATE.shop.relics.find(existing => existing.name === r.name)) {
             STATE.shop.relics.push({ name: r.name, desc: r.desc, price: 150 + Math.floor(Math.random() * 50), id: `relic-${i}` });
        }
    }

    // 3 Random Potions
    const allPotions = Object.keys(POTION_DB);
    for(let i=0; i<3; i++) {
        const p = allPotions[Math.floor(Math.random() * allPotions.length)];
        const price = 50 + Math.floor(Math.random() * 20);
        STATE.shop.potions.push({ name: p, price: price, id: `potion-${i}`, desc: POTION_DB[p].desc });
    }

    renderShop();
}

function renderShop() {
    document.getElementById('shop-gold-display').innerText = STATE.player.gold;
    
    // Cards
    const cardContainer = document.getElementById('shop-cards');
    cardContainer.innerHTML = '';
    STATE.shop.cards.forEach(item => {
        const cardData = CARD_DB[item.name];
        const typeClass = `type-${cardData.type.toLowerCase()}`;
        const wrapper = document.createElement('div');
        wrapper.className = 'shop-item';
        if (item.sold) wrapper.classList.add('sold-out');
        
        wrapper.innerHTML = `
            <div class="card ${typeClass}" style="pointer-events: none;">
                <div class="card-cost">${cardData.cost}</div>
                <div class="card-image">${cardData.img}</div>
                <div class="card-name">${item.name}</div>
                <div class="card-desc">${cardData.desc}</div>
                <div class="card-type-text">${cardData.type}</div>
            </div>
            <div class="price-tag">${item.price} G</div>
        `;
        
        wrapper.onclick = () => buyShopItem('card', item);
        
        const keywords = getKeywordsFromText(cardData.desc);
        if (keywords.length > 0) {
            wrapper.onmouseenter = (e) => showTooltip(e, keywords);
            wrapper.onmouseleave = () => hideTooltip();
            wrapper.onmousemove = (e) => moveTooltip(e);
        }

        cardContainer.appendChild(wrapper);
    });

    // Relics
    const relicContainer = document.getElementById('shop-relics');
    relicContainer.innerHTML = '';
    STATE.shop.relics.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'shop-item';
        if (item.sold) wrapper.classList.add('sold-out');
        
        wrapper.innerHTML = `
            <div class="relic-item" title="${item.desc}">🔮</div>
            <div style="text-align:center; font-size:0.8em; margin-top:5px;">${item.name}</div>
            <div class="price-tag">${item.price} G</div>
        `;
        wrapper.onclick = () => buyShopItem('relic', item);
        relicContainer.appendChild(wrapper);
    });

    // Potions
    // We need to inject a container for potions if it doesn't exist, or just reuse services?
    // The HTML has sections hardcoded. I need to update HTML to have a potion section or inject it.
    // Let's check HTML again.
    // It has: Cards, Relics, Services.
    // I should probably edit HTML to add Potions section first.
    // But I can also append it to Relics container temporarily or just insert it into Services?
    // No, better to add a section in HTML.
    
    // For now in JS, let's assume I will add the HTML container.
    const potionContainer = document.getElementById('shop-potions');
    if (potionContainer) {
        potionContainer.innerHTML = '';
        STATE.shop.potions.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'shop-item';
            if (item.sold) wrapper.classList.add('sold-out');
            
            // Emoji map
            let icon = "🧪";
            if (item.name.includes("Fire")) icon = "🔥";
            if (item.name.includes("Block")) icon = "🛡️";
            if (item.name.includes("Energy")) icon = "⚡";
            if (item.name.includes("Strength")) icon = "💪";
            
            wrapper.innerHTML = `
                <div class="relic-item" style="border-radius:50%; border-style:dashed;" title="${item.desc}">${icon}</div>
                <div style="text-align:center; font-size:0.8em; margin-top:5px;">${item.name}</div>
                <div class="price-tag">${item.price} G</div>
            `;
            wrapper.onclick = () => buyShopItem('potion', item);
            potionContainer.appendChild(wrapper);
        });
    }

    // Services (Removal)
    const serviceContainer = document.getElementById('shop-services');
    serviceContainer.innerHTML = '';
    const removal = document.createElement('div');
    removal.className = 'shop-item';
    if (!STATE.shop.canRemove) removal.classList.add('sold-out');
    
    removal.innerHTML = `
        <div class="service-item">
            <div style="font-size: 2em; margin-bottom: 10px;">🔥</div>
            <div>Remove Card</div>
        </div>
        <div class="price-tag">${STATE.shop.removalCost} G</div>
    `;
    removal.onclick = () => buyRemoval();
    serviceContainer.appendChild(removal);
}

function buyShopItem(type, item) {
    if (item.sold) return;
    
    if (STATE.player.gold >= item.price) {
        STATE.player.gold -= item.price;
        item.sold = true;
        
        if (type === 'card') {
            STATE.player.deck.push(item.name);
            speakShop("A fine choice.");
        } else if (type === 'relic') {
            STATE.player.relics.push(item.name);
            speakShop("Powerful artifact, that.");
        } else if (type === 'potion') {
            if (STATE.player.potions.length >= 3) {
                STATE.player.gold += item.price; // Refund
                item.sold = false;
                speakShop("Your potion belt is full!", true);
                return;
            }
            STATE.player.potions.push(item.name);
            speakShop("Drink responsibly.");
        }
        renderShop();
    } else {
        speakShop("Not enough gold!", true);
    }
}

function buyRemoval() {
    if (!STATE.shop.canRemove) return;
    
    if (STATE.player.gold >= STATE.shop.removalCost) {
        const cardName = prompt("Enter full name of card to remove:\n" + STATE.player.deck.join(", "));
        if (!cardName) return;
        
        // Find index (case insensitive for UX)
        const idx = STATE.player.deck.findIndex(c => c.toLowerCase() === cardName.toLowerCase());
        
        if (idx > -1) {
            const removedCard = STATE.player.deck[idx];
            STATE.player.gold -= STATE.shop.removalCost;
            STATE.player.deck.splice(idx, 1);
            STATE.shop.canRemove = false;
            speakShop(`${removedCard} removed.`);
            renderShop();
        } else {
            alert("Card not found in deck. Check spelling.");
        }
    } else {
        speakShop("You cannot afford my services.", true);
    }
}

function speakShop(msg, isAngry = false) {
    const el = document.getElementById('shop-message');
    if(el) {
        el.innerText = msg;
        el.style.color = isAngry ? '#e74c3c' : '#a1887f';
        if (isAngry) {
            el.classList.add('shake');
            setTimeout(() => el.classList.remove('shake'), 500);
        }
    }
}

function usePotion(index) {
    const potionName = STATE.player.potions[index];
    if (!potionName) return;
    
    // Check if usable
    if (STATE.view !== 'combat') {
        alert("Potions can only be used in combat!");
        return;
    }
    
    const pData = POTION_DB[potionName];
    pData.effect(STATE);
    
    // Visual Feedback
    if (potionName === "Fire Potion") showFloatingText('enemy-entity', "-20", '#e74c3c');
    if (potionName === "Block Potion") showFloatingText('player-entity', "+12 🛡️", '#3498db');
    if (potionName === "Energy Potion") showFloatingText('player-entity', "+2 Energy", '#f1c40f');
    if (potionName === "Strength Potion") showFloatingText('player-entity', "+2 Str", '#e74c3c');
    if (potionName === "Weak Potion") showFloatingText('enemy-entity', "Weakened", '#f39c12');

    STATE.player.potions.splice(index, 1);
    updateCombatUI();

    // Check Win (Fire Potion)
    if (STATE.enemy.hp <= 0) {
        document.getElementById('enemy-entity').classList.add('dead');
        setTimeout(() => winCombat(), 1000);
    }
}


// --- PARALLAX EFFECT ---
function initParallax() {
    const combatView = document.getElementById('view-combat');
    if (!combatView) return;

    const bgFar = document.getElementById('bg-far');
    const bgNear = document.getElementById('bg-near');

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = combatView;

        const xPercent = (clientX / offsetWidth - 0.5) * 2;
        const yPercent = (clientY / offsetHeight - 0.5) * 2;

        // Adjust intensity
        const farX = -xPercent * 10; // Moves less
        const farY = -yPercent * 5;
        const nearX = -xPercent * 20; // Moves more
        const nearY = -yPercent * 10;

        requestAnimationFrame(() => {
            if (bgFar) bgFar.style.transform = `translate(${farX}px, ${farY}px)`;
            if (bgNear) bgNear.style.transform = `translate(${nearX}px, ${nearY}px)`;
        });
    };

    combatView.addEventListener('mousemove', handleMouseMove);
    
    // Return a cleanup function
    return () => {
        combatView.removeEventListener('mousemove', handleMouseMove);
        // Reset styles
        if (bgFar) bgFar.style.transform = 'translate(0, 0)';
        if (bgNear) bgNear.style.transform = 'translate(0, 0)';
    };
}

let cleanupParallax = null;

// --- UI UPDATERS ---

function updateCombatUI() {
    // Potions
    const potionsContainer = document.getElementById('potions-container');
    potionsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const potionName = STATE.player.potions[i];
        const slot = document.createElement('div');
        slot.className = 'potion-slot';
        
        if (potionName) {
            slot.classList.add('filled');
            const pData = POTION_DB[potionName];
            // Simple emoji mapping
            let icon = "🧪";
            if (potionName.includes("Fire")) icon = "🔥";
            if (potionName.includes("Block")) icon = "🛡️";
            if (potionName.includes("Energy")) icon = "⚡";
            if (potionName.includes("Strength")) icon = "💪";
            if (potionName.includes("Weak")) icon = "🌫️";
            
            slot.innerHTML = `
                <div class="potion-icon">${icon}</div>
                <div class="potion-tooltip">
                    <strong>${potionName}</strong><br>
                    ${pData.desc}<br>
                    <em style="color:#aaa; font-size:0.8em">Click to Use</em>
                </div>
            `;
            slot.onclick = (e) => {
                e.stopPropagation();
                usePotion(i);
            };
        } else {
            slot.innerHTML = `<div style="font-size:0.8em; color:#555;">Empty</div>`;
        }
        potionsContainer.appendChild(slot);
    }

    // Stats
    document.getElementById('player-hp-text').innerText = `${STATE.player.hp}/${STATE.player.maxHp}`;
    document.getElementById('player-hp-fill').style.width = `${(STATE.player.hp / STATE.player.maxHp)*100}%`;
    document.getElementById('player-block').innerText = STATE.player.block;
    document.getElementById('energy-val').innerText = `${STATE.player.energy}/${STATE.player.maxEnergy}`;
    
    document.getElementById('enemy-hp-text').innerText = `${STATE.enemy.hp}/${STATE.enemy.maxHp}`;
    document.getElementById('enemy-hp-fill').style.width = `${(STATE.enemy.hp / STATE.enemy.maxHp)*100}%`;
    document.getElementById('enemy-block').innerText = STATE.enemy.block;
    document.getElementById('enemy-sprite').innerText = STATE.enemy.sprite;
    
    // Intent
    let intentIcon = "❓";
    const val = STATE.enemy.nextVal;
    if (STATE.enemy.intent === 'attack') intentIcon = "⚔️ " + val;
    else if (STATE.enemy.intent === 'multi_attack') intentIcon = `⚔️ ${val}x${STATE.enemy.hits}`;
    else if (STATE.enemy.intent === 'buff') intentIcon = "💪";
    else if (STATE.enemy.intent === 'defend') intentIcon = "🛡️";
    else if (STATE.enemy.intent === 'defend_buff') intentIcon = "🛡️⚔️";
    else if (STATE.enemy.intent === 'debuff') intentIcon = "🧪";
    
    if (STATE.enemy.intentDesc) intentIcon += ` (${STATE.enemy.intentDesc})`;
    
    document.getElementById('enemy-intent').innerText = intentIcon;

    // Hand
    const handContainer = document.getElementById('hand-container');
    handContainer.innerHTML = '';
    STATE.player.hand.forEach((cName, idx) => {
        const cData = CARD_DB[cName];
        const typeClass = `type-${cData.type.toLowerCase()}`;
        const el = document.createElement('div');
        el.className = `card ${STATE.player.energy >= cData.cost ? 'playable' : 'unplayable'} ${typeClass}`;
        el.innerHTML = `
            <div class="card-cost">${cData.cost}</div>
            <div class="card-image">${cData.img}</div>
            <div class="card-name">${cName}</div>
            <div class="card-desc">${cData.desc}</div>
            <div class="card-type-text">${cData.type}</div>
        `;
        el.onclick = () => playCard(idx);

        const keywords = getKeywordsFromText(cData.desc);
        if (keywords.length > 0) {
            el.onmouseenter = (e) => showTooltip(e, keywords);
            el.onmouseleave = () => hideTooltip();
            el.onmousemove = (e) => moveTooltip(e);
        }

        handContainer.appendChild(el);
    });
    
    document.getElementById('draw-pile-count').innerText = STATE.player.drawPile.length;
    document.getElementById('discard-pile-count').innerText = STATE.player.discard.length;
}

// Utils
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
