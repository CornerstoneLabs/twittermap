"""Search client."""

from TwitterSearch import *
import json
import settings


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

    print('Looking up "%s"' % search)

    for town in towns:
        compare_name = town[5].lower().strip()
        if compare_name == search:
            found.append(town)

        compare_name = town[6].lower().strip()
        if compare_name == search:
            found.append(town)

    print('Found %s items' % (len(found)))

    return found

if __name__ == '__main__':
    towns = read_towns()

    output_data = []

    try:
        tso = TwitterSearchOrder()  # create a TwitterSearchOrder object
        tso.set_keywords(settings.SEARCH)  # let's define all words we would like to have a look for
        #tso.set_language('en')  # we want to see German tweets only
        tso.set_include_entities(False)  # and don't give us all those entity information

        # it's about time to create a TwitterSearch object with our secret tokens
        ts = TwitterSearch(
            consumer_key=settings.CONSUMER_KEY,
            consumer_secret=settings.CONSUMER_SECRET,
            access_token=settings.ACCESS_TOKEN,
            access_token_secret=settings.ACCESS_TOKEN_SECRET)

        tweets = ts.search_tweets_iterable(tso)

        # this is where the fun actually starts :)
        for tweet in tweets:
            print('\n%s\n' % tweet)
            print('@%s tweeted: %s %s ' % (tweet['user']['screen_name'], tweet['text'], tweet['user']['location']))

            split_words = tweet['text'].split(' ')

            town_list = []
            for search_town in split_words:
                town_list = town_list + lookup_town(towns, search_town)

            if len(town_list) > 0:
                town = town_list[0]
                lat = town[3]
                lng = town[4]

                output_obj = {}
                output_obj['name'] = '@%s' % tweet['user']['screen_name']
                output_obj['lon'] = lng
                output_obj['lat'] = lat
                output_obj['avatar'] = tweet['user']['profile_image_url']
                output_obj['details'] = town[5]

                output_data.append(output_obj)

    except TwitterSearchException as e:  # take care of all those ugly errors if there are some
        print(e)

    output_file = open('public/data/tweets.json', 'wt')
    output_file.write(json.dumps(output_data))
    output_file.close()
