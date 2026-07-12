import os
from pathlib import Path
from dotenv import load_dotenv #type: ignore

# Load environment variables from current working directory first, and then from microservice folder
load_dotenv()
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:5000")
