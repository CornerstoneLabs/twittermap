"""settings."""

DEFAULT_INDEXES = [
    'towns',
]

MAPPINGS = {
    'towns': """{
        "mappings": {
            "town": {
                "properties": {
                    "location": {
                        "type": "geo_point"
                    },
                    "name" : {
                        "type" : "string",
                        "index" : "not_analyzed"
                    }
                }
            }
        }
    }"""
}

ELASTIC_SEARCH_URL = 'http://0.0.0.0:9200'

config = {
    'host': 'http://0.0.0.0',
    'port': 9200,
    'url_prefix': 'es',
    'use_ssl': True
}
