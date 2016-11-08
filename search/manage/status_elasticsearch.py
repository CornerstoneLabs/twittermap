"""Get status of ES."""

import datetime
import json
from fabric.api import env
from fabric.operations import run

env.hosts = ['138.68.153.64']
env.user = 'root'


def save(ok, data, database_name, collection_name):
    """Save the data."""
    from pymongo import MongoClient
    client = MongoClient('192.168.1.90', 27017)
    database = getattr(client, database_name)
    collection = database[collection_name]

    post = {
        "data": data,
        "ok": ok,
        "date": datetime.datetime.utcnow()
    }

    inserted_id = collection.insert_one(post).inserted_id
    return inserted_id


def status():
    """Run check on Elasticsearch."""
    output = run('curl http://127.0.0.1:9200/_stats')
    data = json.loads(output)
    save(True, data, 'dumteedum_status', 'elasticsearch')
