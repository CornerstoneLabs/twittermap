"""Search client."""

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

    try:
        input_file = open('public/data/hashindex.json', 'rt')
        data = json.loads(input_file.read())
        input_file.close()

        for item in data:
            keys.append(item)
    except Exception as ex:
        print(ex)

    # output_file = open('public/data/hashindex.json', 'wt')
    # output_file.write(json.dumps(keys))
    # output_file.close()


def read_data():
    """Save data to a file."""
    input_file = open('public/data/tweets.spool', 'rt')
    input_data = input_file.read()
    result = json.loads('[%s]' % input_data[:-1])
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
        try:
            calculated_geohash = geohash.encode(
                float(item['lat']),
                float(item['lon']),
                settings.GEOHASH_PRECISION
            )

            if calculated_geohash not in hashes:
                hashes[calculated_geohash] = []
                print('Added hash %s' % calculated_geohash)

            print('%s hashed %s' % (item['details'], calculated_geohash))

            hashes[calculated_geohash].append(item)
        except Exception as ex:
            print('FAILURE TO CREATE GEOHASH %s' % ex)
            print(item)

    write_geohashes(hashes)
    write_keys(hashes)


def create_geohashes_please():
    """Read all the data first."""
    data = read_data()
    create_geohashes(data)

if __name__ == '__main__':
    create_geohashes_please()
