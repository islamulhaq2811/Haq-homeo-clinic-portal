import os
import sys
from pathlib import Path

path = Path(__file__).parent
if str(path) not in sys.path:
    sys.path.insert(0, str(path))

os.environ.setdefault("DATABASE_URL", "sqlite:///./haq_homeo.db")

from app.main import app
