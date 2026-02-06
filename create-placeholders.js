const fs = require('fs');
const path = require('path');

// List of all card names from CARD_DB
const cardNames = [
    "Strike", "Defend", "Bash", "Neutralize", "Survivor", "Eruption", "Vigilance", 
    "Cleave", "Pommel Strike", "Shrug It Off", "Deadly Poison", "Blade Dance", "Shiv",
    "Iron Wave", "Clothesline", "Thunderclap", "Twin Strike", "Sword Boomerang", 
    "Inflame", "Spot Weakness", "Reaper", "Flame Barrier", "Uppercut", "Dagger Spray", 
    "Dagger Throw", "Poisoned Stab", "Sucker Punch", "Backflip", "Footwork", 
    "Leg Sweep", "Crippling Cloud", "Bouncing Flask", "Adrenaline"
];

// Create a simple placeholder SVG template
function createPlaceholderSVG(cardName) {
    const colors = {
        "Attack": "#ff6b6b",
        "Skill": "#4ecdc4", 
        "Power": "#ffe66d"
    };
    
    // Determine card type based on name
    let cardType = "Skill"; // default
    if (cardName.includes("Strike") || cardName.includes("Bash") || cardName.includes("Eruption") || 
        cardName.includes("Cleave") || cardName.includes("Pommel") || cardName.includes("Reaper") ||
        cardName.includes("Twin") || cardName.includes("Sword") || cardName.includes("Uppercut") ||
        cardName.includes("Dagger") || cardName.includes("Shiv")) {
        cardType = "Attack";
    } else if (cardName.includes("Inflame") || cardName.includes("Spot") || cardName.includes("Footwork")) {
        cardType = "Power";
    }
    
    const color = colors[cardType];
    const shortName = cardName.length > 12 ? cardName.substring(0, 10) + "..." : cardName;
    
    return `<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" fill="${color}" stroke="#000" stroke-width="3" rx="8"/>
    <text x="60" y="50" text-anchor="middle" fill="#000" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${cardType}</text>
    <text x="60" y="70" text-anchor="middle" fill="#000" font-family="Arial, sans-serif" font-size="10">${shortName}</text>
    <text x="60" y="90" text-anchor="middle" fill="#000" font-family="Arial, sans-serif" font-size="8">Art Needed</text>
</svg>`;
}

// Create placeholder SVGs for all cards
cardNames.forEach(cardName => {
    const filename = cardName.toLowerCase().replace(/\s+/g, '-') + '.svg';
    const filepath = path.join('assets', 'cards', filename);
    const svgContent = createPlaceholderSVG(cardName);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`Created placeholder: ${filename}`);
});

console.log(`\nGenerated ${cardNames.length} placeholder card images in assets/cards/`);
console.log("Replace these with nano-banana-pro generated art when ready.");
