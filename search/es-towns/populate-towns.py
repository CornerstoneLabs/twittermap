"""Push CSV into ES."""
from elasticsearch import Elasticsearch
import elastic_pusher
import settings
import csv
import json

elastic_pusher.create_indexes(settings.DEFAULT_INDEXES, settings.MAPPINGS)


class Entity(object):
    """Entity."""

    def __init__(self, data):
        """init."""
        self.data = data
        self.index = 'towns'
        self.doc_type = 'town'
        self._id = data['id']

    def json(self):
        """Output json."""
        return json.dumps(self.data)


def check_existing(country, town):
    """Check for existing."""
    es = Elasticsearch(settings.ELASTIC_SEARCH_URL)
    check = es.search(
        index='towns',
        body={
            'query': {
                'constant_score': {
                    'filter': {
                        'and': [
                            {
                                'term': {
                                    'country_code': country.lower()
                                },
                            },
                            {
                                'term': {
                                    'name': town
                                }
                            }
                        ]
                    }
                }
            }
        }
    )
    return check['hits']['total'] != 0


with open('../geo/GeoLiteCity-Location.csv', 'rt') as csvfile:
    town_reader = csv.reader(csvfile, delimiter=',', quotechar='"')

    for row in town_reader:
        data = {}

        data['id'] = row[0]
        data['country_code'] = row[1]
        data['name'] = row[3]
        data['region'] = row[2]

        try:
            data['location'] = {
                'lon': float(row[6]),
                'lat': float(row[5])
            }

            if not check_existing(data['country_code'], data['name']):
                entity = Entity(data)
                result = elastic_pusher.push(entity)
            else:
                print('%s exists in database, skipping' % (data['name']))
        except Exception as ex:
            print(ex)
