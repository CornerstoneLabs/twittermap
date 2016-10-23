"""test_couchdb."""

import couchdb
import settings
import datetime
from uuid import uuid4

server = couchdb.Server(settings.COUCHDB_SERVER)
database = server[settings.COUCHDB_DATABASE]


def get(id):
    """Find by id."""
    try:
        return database[id]
    except couchdb.http.ResourceNotFound:
        return None


def save(document):
    """Store something."""
    try:
        doc_id, doc_rev = database.save(document)
    except couchdb.http.ResourceConflict:
        #
        # Document exists, replace it
        #
        find_document = get(document['_id'])
        document['_rev'] = find_document['_rev']
        doc_id, doc_rev = database.save(document)

    return doc_id, doc_rev


def store(event_type, metakey, data, parent=None):
    """Save an event."""
    payload = {
        '_id': uuid4().hex,
        'event_type': event_type,
        'data': data,
        'datetime': datetime.datetime.utcnow().isoformat()
    }

    if metakey:
        payload['metakey'] = str(metakey)

    if parent:
        payload['parent'] = str(parent)

    return save(payload)


def thread(parent_id):
    """Look for all events for a thread."""
    results = database.iterview('ancestor/thread', 10, key=str(parent_id))

    thread = []
    for result in results:
        thread.append(get(result.value))

    thread.sort(key=lambda x: x['datetime'])

    return thread


def find_metakey_id(metakey):
    """Look for a metakey."""
    results = database.iterview('ancestor/find', 10, key=str(metakey))

    value = None
    for result in results:
        value = result.value

    return value


def bootstrap():
    """Initialise database."""
    if not settings.BOOTSTRAP_VIEWS:
        return

    for key in settings.BOOTSTRAP_VIEWS.keys():
        parent_view = get(key)
        if not parent_view or True:
            save(settings.BOOTSTRAP_VIEWS[key])

