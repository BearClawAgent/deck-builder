#!/usr/bin/env python3
"""
Generate background art layers for parallax effect using Google Imagen API
"""

import os
import sys
import subprocess

# Background layer generation prompts
backgrounds = {
    "bg-far": {
        "filename": "assets/bg-far.png",
        "prompt": "Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic. Distant fantasy landscape, mountains in background, dark stormy sky, castle ruins on horizon, COMPLETELY TRANSPARENT BACKGROUND, no white areas, no checkerboard, only the landscape elements visible, alpha channel transparency, high contrast, fantasy environment."
    },
    "bg-near": {
        "filename": "assets/bg-near.png", 
        "prompt": "Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic. Mid-ground fantasy forest, twisted trees, rocky terrain, misty atmosphere, some vegetation, COMPLETELY TRANSPARENT BACKGROUND, no white areas, no checkerboard, only the forest elements visible, alpha channel transparency, high contrast, fantasy environment."
    },
    "bg-ground": {
        "filename": "assets/bg-ground.png",
        "prompt": "Dark fantasy comic book style, thick jagged black outlines, cel-shaded, hard edges, earthy saturated colors, hand-drawn vector aesthetic. Ground level terrain, stone floor, dirt path, scattered rocks, battle arena ground, COMPLETELY TRANSPARENT BACKGROUND, no white areas, no checkerboard, only the ground elements visible, alpha channel transparency, high contrast, fantasy environment."
    }
}

def generate_background(name, config):
    """Generate a single background layer"""
    print(f"Generating {name} background layer...")
    
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

def generate_all_backgrounds():
    """Generate all background layers"""
    print("Starting background layer generation...")
    print(f"Total backgrounds to generate: {len(backgrounds)}")
    
    success_count = 0
    error_count = 0
    
    for name, config in backgrounds.items():
        if generate_background(name, config):
            success_count += 1
        else:
            error_count += 1
    
    print(f"\nGeneration complete!")
    print(f"Successful: {success_count}")
    print(f"Errors: {error_count}")
    
    if error_count > 0:
        print("\nSome backgrounds failed to generate. Check the error messages above.")
    else:
        print("\nAll background layers generated successfully!")

if __name__ == "__main__":
    generate_all_backgrounds()
