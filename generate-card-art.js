// Card art generation script
// This script generates prompts for nano-banana-pro for each card

const cards = [
    { name: "Strike", desc: "A warrior striking with a sword, dynamic action pose" },
    { name: "Defend", desc: "A warrior raising a shield to block, defensive stance" },
    { name: "Bash", desc: "A powerful hammer smash, impact with force" },
    { name: "Neutralize", desc: "A rogue applying poison to a blade, stealthy action" },
    { name: "Survivor", desc: "A character dodging and evading, agile movement" },
    { name: "Eruption", desc: "Fiery explosion, volcanic eruption, intense flames" },
    { name: "Vigilance", desc: "A meditative warrior, calm and focused stance" },
    { name: "Cleave", desc: "A sword sweeping through multiple targets, wide arc attack" },
    { name: "Pommel Strike", desc: "A quick punch with sword pommel, fast close combat" },
    { name: "Shrug It Off", desc: "A character casually blocking damage, confident defense" },
    { name: "Deadly Poison", desc: "Poisonous vial with toxic green liquid, dangerous substance" },
    { name: "Blade Dance", desc: "A rogue spinning with multiple blades, graceful combat" },
    { name: "Shiv", desc: "Small throwing dagger, quick and precise weapon" },
    { name: "Iron Wave", desc: "A warrior combining sword strike and shield defense" },
    { name: "Clothesline", desc: "A powerful clothesline attack, knocking back opponent" },
    { name: "Thunderclap", desc: "Lightning strike from above, electrical energy" },
    { name: "Twin Strike", desc: "Two swords striking simultaneously, dual wield attack" },
    { name: "Sword Boomerang", desc: "A sword spinning and returning, curved trajectory" },
    { name: "Inflame", desc: "A warrior glowing with inner fire, power building up" },
    { name: "Spot Weakness", desc: "A warrior finding enemy's weak point, tactical analysis" },
    { name: "Reaper", desc: "A dark scythe harvesting life energy, soul reaping" },
    { name: "Flame Barrier", desc: "A wall of protective fire, burning shield" },
    { name: "Uppercut", desc: "A powerful uppercut punch, upward striking motion" },
    { name: "Dagger Spray", desc: "Multiple daggers flying in spray pattern, projectile attack" },
    { name: "Dagger Throw", desc: "A thrown dagger spinning through air, precise throw" },
    { name: "Poisoned Stab", desc: "A poisoned dagger stabbing, toxic blade attack" },
    { name: "Sucker Punch", desc: "A surprise punch attack, unexpected strike" },
    { name: "Backflip", desc: "An acrobatic backflip dodge, evasive maneuver" },
    { name: "Footwork", desc: "Quick foot movement, agile positioning" },
    { name: "Leg Sweep", desc: "A sweeping leg attack, low combat move" },
    { name: "Crippling Cloud", desc: "A cloud of poison gas, area effect debuff" },
    { name: "Bouncing Flask", desc: "A potion flask bouncing and spilling, alchemical explosion" },
    { name: "Adrenaline", desc: "A character surging with energy, speed boost effect" }
];

const baseStyle = "Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot";

console.log("Nano-banana-pro prompts for card art generation:");
console.log("=" .repeat(60));

cards.forEach(card => {
    const prompt = `${card.desc}. ${baseStyle}`;
    console.log(`\n${card.name}:`);
    console.log(prompt);
});

console.log("\n" + "=".repeat(60));
console.log("Total cards to generate:", cards.length);
