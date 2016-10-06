"""Search client."""

from TwitterSearch import *
import csv
import json
import settings
import time
from rehash import create_geohashes

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


def lookup_town(towns, search):
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

    print('Found %s' % found)

    return found


def ignore_word(word):
    """Work out whether to ignore word."""
    ignore = False

    if word.startswith('#'):
        ignore = True

    return ignore


def lookup_location(towns, tweet):
    """Lookup the town."""
    split_words = tweet['text'].split(' ')

    town_list = []
    for search_town in split_words:
        if not ignore_word(search_town):
            town_list = town_list + lookup_town(towns, search_town)

    if len(town_list) > 0:
        return town_list[0]


def add_tweet(output_data, towns, tweet):
    """Add the tweet to data."""
    print('\n%s\n' % tweet)
    print('@%s tweeted: %s %s ' % (tweet['user']['screen_name'], tweet['text'], tweet['user']['location']))

    town = lookup_location(towns, tweet)

    if town:
        latitude = town['latitude']
        longitude = town['longitude']

        output_obj = {}
        output_obj['name'] = '@%s' % tweet['user']['screen_name']
        output_obj['lon'] = longitude
        output_obj['lat'] = latitude
        output_obj['avatar'] = tweet['user']['profile_image_url']
        output_obj['details'] = town['name']
        output_obj['id'] = tweet['id']

        output_data.append(output_obj)
    else:
        print('Could not find town')


def scan_twitter(output_data, max_id, towns):
    """Scan twitter."""
    print('Scanning twitter')
    try:
        tso = TwitterSearchOrder()
        tso.set_keywords(settings.SEARCH)
        # tso.set_language('en')  # we want to see German tweets only
        tso.set_include_entities(False)

        ts = TwitterSearch(
            consumer_key=settings.CONSUMER_KEY,
            consumer_secret=settings.CONSUMER_SECRET,
            access_token=settings.ACCESS_TOKEN,
            access_token_secret=settings.ACCESS_TOKEN_SECRET)

        if max_id:
            print('Searching since: %s' % max_id)
            ts.set_since_id(max_id)

        print('Retrieved list of tweets')
        tweets = ts.search_tweets_iterable(tso)

        print('Now examining tweets')
        for tweet in tweets:
            print(tweet)
            if max_id is None or (max_id and tweet['id'] > max_id):
                max_id = tweet['id']
                print('Setting max_id %s' % max_id)

            add_tweet(output_data, towns, tweet)

        print('Finished')

    except TwitterSearchException as e:  # take care of all those ugly errors if there are some
        print(e)


def save_data(output_data):
    """Save data to a file."""
    output_file = open('public/data/tweets.json', 'wt')
    output_file.write(json.dumps(output_data))
    output_file.close()

if __name__ == '__main__':
    towns = []

    output_data = []
    max_id = None

    while True:
        scan_twitter(output_data, max_id, towns)
        save_data(output_data)
        print('Creating hashes')
        create_geohashes(output_data)
        print('Sleeping')
        time.sleep(60)
