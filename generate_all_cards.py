#!/usr/bin/env python3
import subprocess
import sys
import os

# Card data with prompts from our earlier generation
cards = [
    ("Strike", "A warrior striking with a sword, dynamic action pose. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Defend", "A warrior raising a shield to block, defensive stance. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Bash", "A powerful hammer smash, impact with force. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Neutralize", "A rogue applying poison to a blade, stealthy action. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Survivor", "A character dodging and evading, agile movement. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Eruption", "Fiery explosion, volcanic eruption, intense flames. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Vigilance", "A meditative warrior, calm and focused stance. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Cleave", "A sword sweeping through multiple targets, wide arc attack. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Pommel Strike", "A quick punch with sword pommel, fast close combat. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Shrug It Off", "A character casually blocking damage, confident defense. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Deadly Poison", "Poisonous vial with toxic green liquid, dangerous substance. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Blade Dance", "A rogue spinning with multiple blades, graceful combat. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Shiv", "Small throwing dagger, quick and precise weapon. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Iron Wave", "A warrior combining sword strike and shield defense. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Clothesline", "A powerful clothesline attack, knocking back opponent. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Thunderclap", "Lightning strike from above, electrical energy. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Twin Strike", "Two swords striking simultaneously, dual wield attack. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Sword Boomerang", "A sword spinning and returning, curved trajectory. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Inflame", "A warrior glowing with inner fire, power building up. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Spot Weakness", "A warrior finding enemy's weak point, tactical analysis. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Reaper", "A dark scythe harvesting life energy, soul reaping. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Flame Barrier", "A wall of protective fire, burning shield. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Uppercut", "A powerful uppercut punch, upward striking motion. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Dagger Spray", "Multiple daggers flying in spray pattern, projectile attack. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Dagger Throw", "A thrown dagger spinning through air, precise throw. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Poisoned Stab", "A poisoned dagger stabbing, toxic blade attack. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Sucker Punch", "A surprise punch attack, unexpected strike. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Backflip", "An acrobatic backflip dodge, evasive maneuver. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Footwork", "Quick foot movement, agile positioning. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Leg Sweep", "A sweeping leg attack, low combat move. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Crippling Cloud", "A cloud of poison gas, area effect debuff. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Bouncing Flask", "A potion flask bouncing and spilling, alchemical explosion. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot"),
    ("Adrenaline", "A character surging with energy, speed boost effect. Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic, transparent background, high contrast, dynamic action shot")
]

def generate_all_cards():
    """Generate all card images using the generate_asset.py script"""
    print("Starting batch card art generation...")
    print(f"Total cards to generate: {len(cards)}")
    
    # Ensure assets/cards directory exists
    os.makedirs("assets/cards", exist_ok=True)
    
    success_count = 0
    error_count = 0
    
    for i, (card_name, prompt) in enumerate(cards, 1):
        filename = f"assets/cards/{card_name.lower().replace(' ', '-')}.png"
        print(f"\n[{i}/{len(cards)}] Generating {card_name}...")
        
        try:
            # Call the generate_asset.py script
            result = subprocess.run([
                sys.executable, 
                "tools/generate_asset.py", 
                prompt, 
                filename
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"{card_name} generated successfully!")
                success_count += 1
            else:
                print(f"Error generating {card_name}: {result.stderr}")
                error_count += 1
                
        except Exception as e:
            print(f"Exception generating {card_name}: {e}")
            error_count += 1
    
    print(f"\nGeneration complete!")
    print(f"Successful: {success_count}")
    print(f"Errors: {error_count}")
    
    if error_count > 0:
        print("\nSome cards failed to generate. Check the error messages above.")
    else:
        print("\nAll cards generated successfully! The game should now display the new art.")

if __name__ == "__main__":
    generate_all_cards()
