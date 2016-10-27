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


def read_delete_data():
    """Allow us to delete tweets."""
    try:
        input_file = open('public/data/deleted.spool', 'rt')
        input_data = input_file.read()
        result = json.loads(input_data)
        input_file.close()
    except Exception as ex:
        print('Read delete data error %s' % ex)
        result = []

    return result


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
        if 'deleted' in item and item['deleted'] is True:
            print('Item %s is deleted' % item['id'])
        else:
            print('Hashing %s' % item['id'])
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
    # write_keys(hashes)


def hide_deleted(data):
    """Strip off items with the id in deleted."""
    deleted = read_delete_data()

    if len(deleted) > 0:
        print('There are deleted items')
        for loop_item in data:
            for deleted_item in deleted:
                if loop_item['id'] == deleted_item:
                    loop_item['deleted'] = True

    return data


def create_geohashes_please():
    """Read all the data first."""
    data = read_data()
    data = hide_deleted(data)
    create_geohashes(data)

if __name__ == '__main__':
    create_geohashes_please()
