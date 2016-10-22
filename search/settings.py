"""SETTINGS FILE."""

from os.path import join, dirname
from dotenv import load_dotenv
import os

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)


def environment_value(key, default=None):
    """Helper to allow defaults."""
    if key in os.environ:
        return os.environ[key]
    else:
        return default

SEARCH = ['#clmtest']

#
# Twitter settings.
#
CONSUMER_KEY = environment_value('CONSUMER_KEY')
CONSUMER_SECRET = environment_value('CONSUMER_SECRET')
ACCESS_TOKEN = environment_value('ACCESS_TOKEN')
ACCESS_TOKEN_SECRET = environment_value('ACCESS_TOKEN_SECRET')

#
# JSON file settings.
#
TOWN_DATA = environment_value('TOWN_DATA')
COUNTRY_DATA = environment_value('COUNTRY_DATA')
GEOHASH_PRECISION = 3

#
# Place to store the working data.
#
DATASTORE_PATH = environment_value('DATASTORE_PATH', os.path.abspath('.'))

#
# Geohash box size.
#
if 'GEOHASH_PRECISION' in os.environ:
    GEOHASH_PRECISION = int(os.environ['GEOHASH_PRECISION'])

WHITELIST = [
    'adamauckland',
    'kaelifa',
    'j3rryj0hns0n1',
]
