"""Common functions for all status tasks."""

from fabric.api import env
from pymongo import MongoClient
import datetime
import os

batch = datetime.datetime.utcnow()


def save(ok, data, database_name, collection_name, captured_output=None):
    """Save the data."""
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


def schedule_log(text):
    """Log a schedule item."""
    global batch

    database_name = 'dumteedum_status'
    client = MongoClient('192.168.1.90', 27017)
    database = getattr(client, database_name)
    collection = database['SCHEDULE_LOG']

    post = {
        "date": datetime.datetime.utcnow(),
        "batch": batch,
        "ip": env.host_string,
        "schedule_id": os.environ['DASHBOARD_SCHEDULE_ID'],
        "message": text
    }

    inserted_id = collection.insert_one(post).inserted_id
    return inserted_id


def setup_environment():
    """Anything useful for the environment here."""
    env.hosts = [
        os.environ['hosts']
    ]
    env.user = os.environ['user']
    pass
