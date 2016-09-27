"""SETTINGS FILE."""

from os.path import join, dirname
from dotenv import load_dotenv
import os

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

SEARCH = ['#cltmtest', ]
CONSUMER_KEY = os.environ['CONSUMER_KEY']
CONSUMER_SECRET = os.environ['CONSUMER_SECRET']
ACCESS_TOKEN = os.environ['ACCESS_TOKEN']
ACCESS_TOKEN_SECRET = os.environ['ACCESS_TOKEN_SECRET']
TOWN_DATA = os.environ['TOWN_DATA']
COUNTRY_DATA = os.environ['COUNTRY_DATA']
