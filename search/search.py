"""Search client."""

from TwitterSearch import *
import json
import settings
import time


def read_towns():
    """Read town data."""
    town_file = open('public/data/towns.json', 'rt')
    town_data = json.load(town_file)
    town_file.close()

    return town_data


def lookup_town(towns, search):
    """Look for a town."""
    search = search.lower()

    if search.find(',') != -1:
        search = search.split(',')[0]

    search = search.strip()

    found = []

    for town in towns:
        compare_name = town[5].lower().strip()
        if compare_name == search:
            found.append(town)

        compare_name = town[6].lower().strip()
        if compare_name == search:
            found.append(town)

    return found


def lookup_location(towns, tweet):
    """Lookup the town."""
    split_words = tweet['text'].split(' ')

    town_list = []
    for search_town in split_words:
        town_list = town_list + lookup_town(towns, search_town)

    if len(town_list) > 0:
        return town_list[0]


def add_tweet(output_data, towns, tweet):
    """Add the tweet to data."""
    print('\n%s\n' % tweet)
    print('@%s tweeted: %s %s ' % (tweet['user']['screen_name'], tweet['text'], tweet['user']['location']))

    town = lookup_location(towns, tweet)
    lat = town[3]
    lng = town[4]

    output_obj = {}
    output_obj['name'] = '@%s' % tweet['user']['screen_name']
    output_obj['lon'] = lng
    output_obj['lat'] = lat
    output_obj['avatar'] = tweet['user']['profile_image_url']
    output_obj['details'] = town[5]
    output_obj['id'] = tweet['id']

    output_data.append(output_obj)


def scan_twitter(output_data, max_id, towns):
    """Scan twitter."""
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

        tweets = ts.search_tweets_iterable(tso)

        for tweet in tweets:
            if max_id is None or (max_id and tweet['id'] > max_id):
                max_id = tweet['id']
                print('Setting max_id %s' % max_id)

            add_tweet(output_data, towns, tweet)

    except TwitterSearchException as e:  # take care of all those ugly errors if there are some
        print(e)


def save_data(output_data):
    """Save data to a file."""
    output_file = open('public/data/tweets.json', 'wt')
    output_file.write(json.dumps(output_data))
    output_file.close()

if __name__ == '__main__':
    towns = read_towns()

    output_data = []
    max_id = None

    while True:
        scan_twitter(output_data, max_id, towns)
        save_data(output_data)
        time.sleep(60)
