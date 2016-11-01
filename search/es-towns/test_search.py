"""Here it is."""

from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q, A
import settings


def list_countries():
    """List all countries and towns within."""
    elasticsearch = Elasticsearch(settings.ELASTIC_SEARCH_URL)

    search = Search(using=elasticsearch)
    aggregations = A('terms', field='country_code', size=0)
    search.aggs.bucket('country_code_terms', aggregations)

    print(search.to_dict())

    search = search[:0]
    response = search.execute(search)

    for item in dir(response):
        print('%s %s' % (item, getattr(response, item)))

    for row in response.aggregations.country_code_terms.buckets:
        print(row.key, row.doc_count)


def town_lookup(country, town_name):
    """List all towns."""
    elasticsearch = Elasticsearch(settings.ELASTIC_SEARCH_URL)

    search = Search(using=elasticsearch)
    search = search.query('bool', filter=[
        Q('term', name=town_name) &
        Q('term', country_code=country.lower())
    ])

    response = search.execute(search)

    for item in dir(response):
        print('%s %s' % (item, getattr(response, item)))

    for row in response:
        print(row)

    print(len(response))

town_lookup('GB', 'Grateley')
#
list_countries()

