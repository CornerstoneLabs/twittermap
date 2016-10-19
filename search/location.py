"""Location services."""
import csv
import json
import settings

TOWN_CITY = 3
TOWN_LONGITUDE = 6
TOWN_LATITUDE = 5
TOWN_COUNTRY = 1


def read_town_data():
    """Read town data from CSV."""
    result = []
    print('Reading town data')
    with open(settings.TOWN_DATA, newline='', encoding='latin-1') as csvfile:
        town_data_reader = csv.reader(csvfile, delimiter=',', quotechar='"')
        for loop_item in town_data_reader:
            result.append(loop_item)

        print(len(result))

    print('Finished')
    return result


def read_towns():
    """Read town data."""
    town_file = open('public/data/towns.json', 'rt')
    town_data = json.load(town_file)
    town_file.close()

    return town_data


def lookup_town_from_json(search):
    """Lookup towns from json."""
    towns = read_towns()
    found = []

    for town in towns:
        compare_name = town[5].lower().strip()
        if compare_name == search:
            found.append({
                'latitude': town[3],
                'longitude': town[4],
                'name': town[5],
                'country': town[8]
            })

        compare_name = town[6].lower().strip()
        if compare_name == search:
            found.append({
                'latitude': town[3],
                'longitude': town[4],
                'name': town[6],
                'country': town[8]
            })
    return found


def lookup_town(search):
    """Look for a town."""
    search = search.lower()

    if search.find(',') != -1:
        search = search.split(',')[0]

    search = search.strip()

    found = []

    print('Looking up %s' % search)

    found = lookup_town_from_json(search)

    if len(found) == 0:
        with open(settings.TOWN_DATA, newline='', encoding='latin-1') as csvfile:
            town_data_reader = csv.reader(csvfile, delimiter=',', quotechar='"')

            for town in town_data_reader:
                compare_name = town[TOWN_CITY].lower().strip()
                if compare_name == search:
                    found.append({
                        'latitude': town[TOWN_LATITUDE],
                        'longitude': town[TOWN_LONGITUDE],
                        'name': town[TOWN_CITY],
                        'country': town[TOWN_COUNTRY]
                    })

    print('Found %s hits %s' % (len(found), found))

    return found


def ignore_word(word):
    """Work out whether to ignore word."""
    ignore = False

    if word.startswith('#'):
        ignore = True

    return ignore


def lookup_location(text):
    """Lookup the town."""
    split_words = text.split(' ')

    town_list = []
    for search_town in split_words:
        if not ignore_word(search_town):
            town_list = town_list + lookup_town(search_town)

    if len(town_list) > 0:
        return town_list[0]
