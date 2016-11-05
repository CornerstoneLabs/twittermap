"""Location services."""
import csv
import editdistance
import json
import settings

TOWN_CITY = 3
TOWN_LONGITUDE = 6
TOWN_LATITUDE = 5
TOWN_COUNTRY = 1

ALL_TOWN_BUFFER = None


class CountryCsvParser(object):
    """Parse a country CSV row."""

    def __init__(self, data):
        """Parse a single line of CSV."""
        self.data = data
        self.code = data[4]
        self.name = data[5]


def country(code):
    """Return a country code."""
    with open(settings.COUNTRY_DATA, newline='', encoding='latin-1') as csvfile:
        town_data_reader = csv.reader(csvfile, delimiter=',', quotechar='"')
        for loop_item in town_data_reader:
            country_parsed = CountryCsvParser(loop_item)
            if country_parsed.code == code.upper():
                return country_parsed.name

    return None


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


def read_all_towns():
    """Read town data."""
    global ALL_TOWN_BUFFER

    if ALL_TOWN_BUFFER:
        return ALL_TOWN_BUFFER

    town_file = open('public/data/towns.json', 'rt')
    town_data = json.load(town_file)
    town_file.close()

    #
    # sanitise data
    #
    for town in town_data:
        town[5] = town[5].replace('-', ' ')
        town[6] = town[6].replace('-', ' ')

        if town[5] == "":
            town[5] = town[6]

    for town in town_data:
        town[8] = 'GB'

    for additional_town in read_town_data():
        town_data.append([
            '',  # 0 junk
            '',  # 1 junk
            '',  # 2 junk
            additional_town[5],  # 3 latitude
            additional_town[6],  # 4 longitude
            additional_town[3],  # 5 town
            additional_town[3],  # 6 town
            '',  # 7 junk
            additional_town[1],  # 8 country
        ])

    ALL_TOWN_BUFFER = town_data

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
    if search.find(',') != -1:
        search = search.split(',')[0]

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


def match_weight(compare_name, search):
    """Match with weight."""
    compare_parts = compare_name.split()
    compare_parts = set(compare_parts)

    score = 0
    fails = 0

    for word in search:
        if word in compare_parts:
            score += 100

        if word not in compare_parts:
            fails += 1

    # if fails == 0:
    #     score = 1000
    #     input()
    # else:
    #     score = (len(search) - fails) * 1000

    # if score > 0 and fails != 0:
    #     print('Score: %s fails %s' % (score, fails))
    #     print(compare_parts, search)
    #     input()

    fail_negative = ((float(fails) / float(len(search))) * 1000)

    return 1000 - fail_negative


def lookup_town_levenshtein(search, country=None):
    """Use levenshtein."""
    search = search.lower().strip()
    towns = read_all_towns()
    found = []
    zero_match = False

    for town in towns:
        match = False

        compare_name = town[5].lower().strip()
        score = editdistance.eval(search, compare_name)

        if score < 3:
            #
            # only be lenient until we get a direct hit
            #
            if not zero_match:
                match = True

        if score == 0:
            match = True
            zero_match = True

        if match and country:
            if town[8] != country.upper().strip():
                match = False

        if match:
            print('%s %s ' % (score, compare_name))
            found.append({
                'latitude': town[3],
                'longitude': town[4],
                'name': town[5],
                'country': town[8],
                'weight': score
            })
    # if we do have zeroes delete everything else
    if zero_match:
        found = [x for x in found if x['weight'] == 0]

    found.sort(key=lambda item: item['weight'])

    return found


def lookup_words(search):
    """Lookup multiple words."""
    towns = read_all_towns()
    found = []

    for town in towns:
        match = False

        compare_name = town[5].lower().strip()
        compare_name += ' ' + town[6].lower().strip()
        compare_name += ' ' + town[8].lower().strip()

        score = match_weight(compare_name, search)

        breakpoint = 100

        if score >= breakpoint:
            match = True

        if match:
            found.append({
                'latitude': town[3],
                'longitude': town[4],
                'name': town[6],
                'country': town[8],
                'weight': score
            })

    found.sort(key=lambda item: item['weight'])
    found.reverse()
    return found


def ignore_word(word):
    """Work out whether to ignore word."""
    ignore = False

    if word.startswith('#'):
        ignore = True

    if word.startswith('@'):
        ignore = True

    if word == ',':
        ignore = True

    if word == '.':
        ignore = True

    return ignore


def sanitize_words(words):
    """Return a list of words we're going to search on."""
    result = []

    for word in words:
        if not ignore_word(word):
            result.append(word.lower().strip())

    return result


def lookup_location(text):
    """Lookup the town."""
    split_words = text.split(' ')

    search = sanitize_words(split_words)

    town_list = []
    lookup_towns = lookup_words(search)
    town_list = town_list + lookup_towns

    # for word in search:
    #    town_list = town_list + lookup_town(word)

    return town_list
