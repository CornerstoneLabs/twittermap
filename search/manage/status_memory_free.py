"""Get status of memory."""

import datetime
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


def convert(data):
    """Convert the output to JSON."""
    print(data)
    lines = data.split('\r')
    header = lines[0].split()
    values = lines[1].split()

    output = []

    for i in range(len(header)):
        output.append({
            'name': header[i],
            'value': values[i + 1]
        })
    return output


def status():
    """Run check on Elasticsearch."""
    output = run('free')
    data = convert(output)
    save(True, data, 'dumteedum_status', 'memory-free')
