"""Common functions for all status tasks."""

import datetime
import os
from fabric.api import env


def save(ok, data, database_name, collection_name, captured_output=None):
    """Save the data."""
    from pymongo import MongoClient
    client = MongoClient('192.168.1.90', 27017)
    database = getattr(client, database_name)
    collection = database[collection_name]

    post = {
        "data": data,
        "ok": ok,
        "date": datetime.datetime.utcnow(),
        "ip": env.host_string
    }

    if captured_output:
        post["output"] = captured_output

    inserted_id = collection.insert_one(post).inserted_id
    return inserted_id


def setup_environment():
    """Anything useful for the environment here."""
    env.hosts = [
        os.environ['hosts']
    ]
    env.user = os.environ['user']
    pass
