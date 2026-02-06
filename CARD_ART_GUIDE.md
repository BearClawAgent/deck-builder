# Card Art Generation Guide

## Quick Start

1. **Install dependencies:**
```bash
pip install google-genai python-dotenv
```

2. **Set up your API key:**
   - Either set environment variable: `GOOGLE_AI_API_KEY=your_key_here`
   - Or edit `tools/generate_asset.py` and replace the hardcoded key

3. **Generate all card art at once:**
```bash
python generate_all_cards.py
```

4. **Generate individual cards:**
```bash
python tools/generate_asset.py "A warrior striking with a sword, dynamic action pose" "assets/cards/strike.png"
```

## What Happens

- The script will generate 33 card images using Google Imagen 3
- Images are saved as PNG files in `assets/cards/`
- The game automatically uses the new images once they're generated
- Each generation takes a few seconds, so total time is ~2-3 minutes

## Style

All prompts use the "Dark fantasy comic book style" with:
- Thick jagged black outlines
- Cel-shaded, hard edges
- Earthy saturated colors
- Hand-drawn vector aesthetic
- Transparent background
- High contrast, dynamic action shots

## Troubleshooting

- **API errors:** Check your API key is valid and has quota
- **Missing dependencies:** Run the pip install command above
- **Permission errors:** Make sure the `assets/cards/` directory is writable

Once generation completes, refresh your browser to see the new card art in the game!
