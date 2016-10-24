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

SEARCH = [environment_value('HASHTAG')]

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

COUCHDB_SERVER = environment_value('COUCHDB_SERVER')
COUCHDB_DATABASE = environment_value('COUCHDB_DATABASE')

BOOTSTRAP_VIEWS = {
    '_design/ancestor': {
        '_id': '_design/ancestor',
        'views': {
            'find': {
                'map': 'function(doc){ if (doc.parent) { emit(doc.metakey, doc.parent);} else { emit(doc.metakey, doc._id); } }'
            },
            'thread': {
                'map': 'function(doc){ if (doc.parent) { emit(doc.parent, doc);} else { emit(doc._id, doc); } }'
            }
        }
    },
    '_design/event': {
        '_id': '_design/event',
        'views': {
            'all': {
                'map': 'function(doc){ emit(doc.event_type, doc); }'
            },
            'datetime': {
                'map': 'function(doc){ emit(doc.event_type, doc.datetime); }'
            }
        }
    },
}
