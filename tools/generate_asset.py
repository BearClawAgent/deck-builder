# scripts/generate_asset.py
import os
import sys
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Configure your API key
api_key = os.environ.get("GOOGLE_AI_API_KEY") or "AIzaSyDFJHGenauorF_bxGp0g2cNQVODDB1oUcU"
client = genai.Client(api_key=api_key)

def generate_image(prompt, output_filename="generated_asset.png"):
    print(f"Generating image for: '{prompt}'...")
    
    # "Nano Banana" usually corresponds to the Imagen 3 models in the API
    # You can swap this for 'gemini-2.5-flash-image' if that is your specific endpoint
    MODEL_ID = "imagen-4.0-generate-001"

    try:
        response = client.models.generate_images(
            model=MODEL_ID,
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
            )
        )
        
        # Save the image
        for generated_image in response.generated_images:
            image_data = generated_image.image.image_bytes
            with open(output_filename, "wb") as f:
                f.write(image_data)
                
        print(f"Success! Saved to {output_filename}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_asset.py <prompt> <optional_filename>")
        sys.exit(1)
        
    prompt_text = sys.argv[1]
    filename = sys.argv[2] if len(sys.argv) > 2 else "asset.png"
    
    generate_image(prompt_text, filename)