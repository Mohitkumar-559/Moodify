"""
Downloads the demo catalog's real audio files from archive.org into
backend/media/tracks/. Not committed to git (see .gitignore) — this script
is how any dev reproduces them.

Source: Broke For Free — "Directionless EP" and "Layers", both licensed
CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/). Attribution is
required and shown in the app (see ProfileScreen.tsx's credits line).

Usage: cd backend && .venv\\Scripts\\python.exe scripts\\download_demo_tracks.py
"""
import sys
import urllib.request
from pathlib import Path

MEDIA_DIR = Path(__file__).resolve().parent.parent / "media" / "tracks"

# (filename, archive.org direct download URL)
FILES = [
    ("night-owl.mp3", "https://archive.org/download/DirectionlessEP/Broke%20For%20Free%20-%20Directionless%20EP%20-%2001%20Night%20Owl.mp3"),
    ("my-always-mood.mp3", "https://archive.org/download/DirectionlessEP/Broke%20For%20Free%20-%20Directionless%20EP%20-%2002%20My%20Always%20Mood.mp3"),
    ("day-bird.mp3", "https://archive.org/download/DirectionlessEP/Broke%20For%20Free%20-%20Directionless%20EP%20-%2003%20Day%20Bird.mp3"),
    ("mells-parade.mp3", "https://archive.org/download/DirectionlessEP/Broke%20For%20Free%20-%20Directionless%20EP%20-%2005%20Mell%27s%20Parade.mp3"),
    ("as-colourful-as-ever.mp3", "https://archive.org/download/BrokeForFreeLayers/Broke%20For%20Free%20-%20Layers%20-%2001%20As%20Colourful%20As%20Ever.mp3"),
    ("knock-knock.mp3", "https://archive.org/download/BrokeForFreeLayers/Broke%20For%20Free%20-%20Layers%20-%2002%20Knock%20Knock.mp3"),
    ("spellbound.mp3", "https://archive.org/download/BrokeForFreeLayers/BrokeForFree-Layers-07Spellbound.mp3"),
    ("murmur.mp3", "https://archive.org/download/BrokeForFreeLayers/Broke%20For%20Free%20-%20Layers%20-%2006%20Murmur.mp3"),
]


def main() -> None:
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    for filename, url in FILES:
        dest = MEDIA_DIR / filename
        if dest.exists():
            print(f"skip (exists): {filename}")
            continue
        print(f"downloading: {filename}")
        urllib.request.urlretrieve(url, dest)
    print("done.")


if __name__ == "__main__":
    sys.exit(main())
