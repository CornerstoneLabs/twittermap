"""test_couchdb."""

import couchdb
import settings

server = couchdb.Server(settings.COUCHDB_SERVER)
database = server[settings.COUCHDB_DATABASE]

doc_id, doc_rev = database.save({'type': 'Person', 'name': 'John Doe'})
