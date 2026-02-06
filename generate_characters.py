#!/usr/bin/env python3
"""
Generate character sprites for Ironclad and Silent using Google Imagen API
"""

import os
import sys
import subprocess

# Character generation prompts
characters = {
    "ironclad": {
        "filename": "assets/characters/ironclad.png",
        "prompt": "Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic. A muscular male warrior with glowing red armor plates, horned helmet, wielding a large sword, dynamic action pose, transparent background, high contrast, fantasy character design."
    },
    "silent": {
        "filename": "assets/characters/silent.png", 
        "prompt": "Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic. A female rogue/ninja with daggers, wearing dark hooded cloak, agile combat stance, throwing knives ready, transparent background, high contrast, fantasy character design."
    }
}

def generate_character(name, config):
    """Generate a single character sprite"""
    print(f"Generating {name} character...")
    
    try:
        # Call the generate_asset.py script
        result = subprocess.run([
            sys.executable, 
            "tools/generate_asset.py", 
            config["prompt"], 
            config["filename"]
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"{name} generated successfully!")
            return True
        else:
            print(f"Error generating {name}: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Exception generating {name}: {e}")
        return False

def generate_all_characters():
    """Generate all character sprites"""
    print("Starting character sprite generation...")
    print(f"Total characters to generate: {len(characters)}")
    
    success_count = 0
    error_count = 0
    
    # Create assets/characters directory if it doesn't exist
    os.makedirs("assets/characters", exist_ok=True)
    
    for name, config in characters.items():
        if generate_character(name, config):
            success_count += 1
        else:
            error_count += 1
    
    print(f"\nGeneration complete!")
    print(f"Successful: {success_count}")
    print(f"Errors: {error_count}")
    
    if error_count > 0:
        print("\nSome characters failed to generate. Check the error messages above.")
    else:
        print("\nAll character sprites generated successfully!")

if __name__ == "__main__":
    generate_all_characters()
