# config.py
import os
from dotenv import load_dotenv

load_dotenv() # Load variables from .env

class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://chama_user:Manu1234@localhost/chama_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')