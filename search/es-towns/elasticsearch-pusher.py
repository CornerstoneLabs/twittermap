"""Push to elasticsearch."""
from elasticsearch import Elasticsearch
import settings

es = Elasticsearch(settings.ELASTIC_SEARCH_URL)


def create_indexes(indexes, mappings):
    """Ensure all indexes are created."""
    for index in indexes:
        if index in mappings:
            failed = True

            while failed:
                try:
                    es.indices.create(
                        index=index,
                        ignore=400,
                        body=mappings[index]
                    )
                    failed = False
                except Exception:
                    failed = True
        else:
            failed = True

            while failed:
                try:
                    es.indices.create(index=index, ignore=400)
                    failed = False
                except Exception:
                    failed = True


def push(entity):
    """Push entity into the correct index."""
    if entity:
        data = entity.json()

        return es.index(
            index=entity.index,
            doc_type=entity.doc_type,
            id=entity._id,
            body=data
        )
