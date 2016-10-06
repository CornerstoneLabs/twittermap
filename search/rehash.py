"""Search client."""

from TwitterSearch import *
import json
import settings
import geohash

TOWN_CITY = 3
TOWN_LONGITUDE = 6
TOWN_LATITUDE = 5
TOWN_COUNTRY = 1


def write_keys(hashes):
    """Output all the hashes that we have."""
    keys = [key for key in hashes]
    output_file = open('public/data/hashindex.json', 'wt')
    output_file.write(json.dumps(keys))
    output_file.close()


def read_data():
    """Save data to a file."""
    input_file = open('public/data/tweets.json', 'rt')
    input_data = input_file.read()
    result = json.loads(input_data)
    input_file.close()

    return result


def write_geohashes(hashes):
    """Write out the hashes."""
    for key in hashes:
        value = hashes[key]

        output_file = open('public/data/tweets-%s.json' % (key), 'wt')
        output_file.write(json.dumps(value))
        output_file.close()


def create_geohashes(output_data):
    """Create hashes from each row in output_data."""
    hashes = {}

    for item in output_data:
        calculated_geohash = geohash.encode(
            float(item['lat']),
            float(item['lon']),
            settings.GEOHASH_PRECISION
        )

        if calculated_geohash not in hashes:
            hashes[calculated_geohash] = []
            print('Added hash %s' % calculated_geohash)

        hashes[calculated_geohash].append(item)

    write_geohashes(hashes)
    write_keys(hashes)

if __name__ == '__main__':
    data = read_data()
    create_geohashes(data)
