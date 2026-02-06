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
        status: {}
    },
    enemy: null,
    map: [],
    currentFloor: -1,
    currentPathIndex: -1,
    rng: Math.random
};

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
    "Shiv": { type: "Attack", cost: 0, val: 4, exhaust: true, desc: "Deal 4 damage. Exhaust.", img: "🔪" }
};

const RELIC_DB = [
    { name: "Vajra", desc: "Start each combat with 1 Strength." },
    { name: "Anchor", desc: "Start each combat with 10 Block." },
    { name: "Bag of Marbles", desc: "At start of combat, apply 1 Vulnerable to enemies." },
    { name: "Happy Flower", desc: "Every 3 turns, gain 1 Energy." }
];

const ENEMY_DB = [
    { name: "Cultist", hp: 48, intent: "buff", val: 0, sprite: "🦅" },
    { name: "Jaw Worm", hp: 40, intent: "attack", val: 11, sprite: "🐛" },
    { name: "Louse", hp: 10, intent: "debuff", val: 0, sprite: "🐜" }
];

const CLASSES = {
    "Ironclad": { hp: 80, relic: "Burning Blood", deck: ["Strike", "Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Bash"], icon: "🔴", color: "#e74c3c" },
    "Silent": { hp: 70, relic: "Ring of Snake", deck: ["Strike", "Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Defend", "Neutralize", "Survivor"], icon: "🟢", color: "#2ecc71" }
};

// --- INITIALIZATION ---
window.onload = () => {
    showView('title');
};

function showView(viewName) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    STATE.view = viewName;
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
    } else if (node.type === 'rest') {
        // Auto heal for now
        STATE.player.hp = Math.min(STATE.player.maxHp, STATE.player.hp + Math.floor(STATE.player.maxHp * 0.3));
        alert("Rested! Healed 30% HP.");
        nextFloor(); // Go back to map
    } else {
        alert(`Visited ${node.type}. Nothing happened yet.`);
        nextFloor();
    }
}

function nextFloor() {
    showView('map');
    renderMap();
}

// --- COMBAT SYSTEM ---
function startCombat(type) {
    showView('combat');
    // Setup Enemy
    const enemyData = ENEMY_DB[Math.floor(Math.random() * ENEMY_DB.length)];
    STATE.enemy = {
        name: enemyData.name,
        hp: enemyData.hp,
        maxHp: enemyData.hp,
        block: 0,
        intent: enemyData.intent, // Simplistic intent logic
        nextVal: enemyData.val,
        sprite: enemyData.sprite,
        status: {}
    };
    if (type === 'boss') STATE.enemy.hp *= 3;
    else if (type === 'elite') STATE.enemy.hp *= 1.5;

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
    
    startTurn();
    updateCombatUI();
}

function startTurn() {
    STATE.player.energy = 3;
    STATE.player.block = 0; // Block expires
    // Anchor logic only first turn? (Simplified: Anchor is start of combat, so handled above)
    // Draw
    drawCards(5);
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

function playCard(handIndex) {
    const cardName = STATE.player.hand[handIndex];
    const card = CARD_DB[cardName];
    
    if (STATE.player.energy < card.cost) return; // Not enough energy
    
    STATE.player.energy -= card.cost;
    STATE.player.hand.splice(handIndex, 1);
    STATE.player.discard.push(cardName);
    
    // Effects
    if (card.val) {
        let dmg = card.val;
        if (STATE.player.status.strength) dmg += STATE.player.status.strength;
        if (STATE.enemy.status.vulnerable) dmg = Math.floor(dmg * 1.5);
        if (STATE.player.status.weak) dmg = Math.floor(dmg * 0.75);
        
        let blocked = Math.min(STATE.enemy.block, dmg);
        STATE.enemy.block -= blocked;
        STATE.enemy.hp -= (dmg - blocked);
    }
    if (card.block) {
        let blk = card.block;
        if (STATE.player.status.dexterity) blk += STATE.player.status.dexterity;
        STATE.player.block += blk;
    }
    if (card.vul) {
        STATE.enemy.status.vulnerable = (STATE.enemy.status.vulnerable || 0) + card.vul;
    }
    if (card.weak) {
        STATE.enemy.status.weak = (STATE.enemy.status.weak || 0) + card.weak;
    }
    if (card.draw) {
        drawCards(card.draw);
    }
    if (card.poison) {
        STATE.enemy.status.poison = (STATE.enemy.status.poison || 0) + card.poison;
    }
    if (card.shivs) {
        for(let i=0; i<card.shivs; i++) {
            if (STATE.player.hand.length < 10) STATE.player.hand.push("Shiv");
        }
    }
    if (card.exhaust) {
        // Already removed from hand, just don't add to discard
        const idx = STATE.player.discard.indexOf(cardName);
        if (idx > -1) STATE.player.discard.splice(idx, 1); // logic check: playCard adds to discard usually?
    }

    // Fix discard logic: playCard added to discard at top. If exhaust, remove it.
    if (card.exhaust) {
        STATE.player.discard.pop();
    }

    // Check Win
    if (STATE.enemy.hp <= 0) {
        winCombat();
        return;
    }
    
    updateCombatUI();
}

function endTurn() {
    // Poison Damage
    if (STATE.enemy.status.poison > 0) {
        STATE.enemy.hp -= STATE.enemy.status.poison;
        STATE.enemy.status.poison--;
        if (STATE.enemy.hp <= 0) {
             winCombat();
             return;
        }
    }

    // Enemy Action
    const intent = STATE.enemy.intent;
    if (intent === 'attack') {
        let dmg = STATE.enemy.nextVal;
        let blocked = Math.min(STATE.player.block, dmg);
        STATE.player.block -= blocked;
        STATE.player.hp -= (dmg - blocked);
    } else if (intent === 'buff') {
        STATE.enemy.nextVal += 2; // Simple scaling
    }

    // Check Loss
    if (STATE.player.hp <= 0) {
        alert("GAME OVER");
        location.reload();
        return;
    }

    // Discard Hand
    STATE.player.discard.push(...STATE.player.hand);
    STATE.player.hand = [];
    
    // Status Decay
    if (STATE.enemy.status.vulnerable) STATE.enemy.status.vulnerable--;
    if (STATE.enemy.status.weak) STATE.enemy.status.weak--;

    startTurn();
}

function winCombat() {
    showView('reward');
    const container = document.getElementById('reward-choices');
    container.innerHTML = '';
    
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
    
    const container = document.getElementById('reward-choices');
    container.innerHTML = '';
    
    options.forEach(cName => {
        const cardData = CARD_DB[cName];
        const el = document.createElement('div');
        el.className = 'card reward-card';
        el.innerHTML = `
            <div class="card-cost">${cardData.cost}</div>
            <div class="card-image">${cardData.img}</div>
            <div class="card-name">${cName}</div>
            <div class="card-desc">${cardData.desc}</div>
        `;
        el.onclick = () => {
            STATE.player.deck.push(cName);
            nextFloor();
        };
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

// --- UI UPDATERS ---
function updateCombatUI() {
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
    if (STATE.enemy.intent === 'attack') intentIcon = "⚔️ " + STATE.enemy.nextVal;
    else if (STATE.enemy.intent === 'buff') intentIcon = "💪";
    else if (STATE.enemy.intent === 'debuff') intentIcon = "🧪";
    document.getElementById('enemy-intent').innerText = intentIcon;

    // Hand
    const handContainer = document.getElementById('hand-container');
    handContainer.innerHTML = '';
    STATE.player.hand.forEach((cName, idx) => {
        const cData = CARD_DB[cName];
        const el = document.createElement('div');
        el.className = `card ${STATE.player.energy >= cData.cost ? 'playable' : 'unplayable'}`;
        el.innerHTML = `
            <div class="card-cost">${cData.cost}</div>
            <div class="card-image">${cData.img}</div>
            <div class="card-name">${cName}</div>
            <div class="card-desc">${cData.desc}</div>
        `;
        el.onclick = () => playCard(idx);
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
