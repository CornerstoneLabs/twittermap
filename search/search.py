"""Search client."""

from TwitterSearch import TwitterSearchOrder, TwitterSearchException, TwitterSearch
import json
import settings
import datetime
import location
import tweet_update
from rehash import create_geohashes_please


def add_tweet(output_data, tweet):
    """Add the tweet to data."""
    print('\n%s\n' % tweet)
    print('%s tweeted: %s %s ' % (tweet['user']['name'], tweet['text'], tweet['user']['location']))

    town = location.lookup_location(tweet['text'])

    if town:
        latitude = town['latitude']
        longitude = town['longitude']

        output_obj = {}
        output_obj['name'] = '%s' % tweet['user']['name']
        output_obj['screen_name'] = '%s' % tweet['user']['screen_name']
        output_obj['lon'] = longitude
        output_obj['lat'] = latitude
        output_obj['avatar'] = tweet['user']['profile_image_url_https']
        output_obj['details'] = town['name']
        output_obj['id'] = tweet['id']
        output_obj['id_str'] = tweet['id_str']

        output_data.append(output_obj)
    else:
        print('Could not find town')


def get_max_id():
    """Get the latest tweet we've ever got."""
    max_id = 0

    try:
        file_handle = open('public/data/maxid.json', 'rt')
        data = json.load(file_handle)
        print(data)
        max_id = data['max_id']
        file_handle.close()
    except Exception as ex:
        print('error %s' % ex)
        pass
    return max_id


def set_max_id(max_id):
    """Set the latest tweet we've ever got."""
    output_file = open('public/data/maxid.json', 'wt')
    output_data = {
        'max_id': max_id
    }
    output_file.write(json.dumps(output_data))
    output_file.close()


def store_tweet(tweet):
    """Store the tweet for backup."""
    output_file = open('public/data/raw-tweets.spool', 'at')
    output_file.write('%s,\n' % json.dumps(tweet))
    output_file.close()


def scan_twitter(output_data, max_id):
    """Scan twitter."""
    print('Scanning twitter for %s' % settings.SEARCH)
    max_id = get_max_id()
    tweet_list = []

    try:
        tso = TwitterSearchOrder()
        tso.set_keywords(settings.SEARCH)
        tso.set_include_entities(True)

        # if max_id != 0:
        #    tso.set_max_id(max_id)

        ts = TwitterSearch(
            consumer_key=settings.CONSUMER_KEY,
            consumer_secret=settings.CONSUMER_SECRET,
            access_token=settings.ACCESS_TOKEN,
            access_token_secret=settings.ACCESS_TOKEN_SECRET)

        if max_id:
            print('Searching since: %s' % max_id)
            # working backwards
            # tso.set_max_id(max_id)
            #
            # working forwards
            tso.set_since_id(max_id)

        print('Retrieved list of tweets')
        tweets = ts.search_tweets_iterable(tso)

        print('Statistics')
        print(ts.get_statistics())

        print('Now examining tweets')
        for tweet in tweets:
            store_tweet(tweet)
            tweet_list.append(tweet)

        for tweet in tweet_list:
            print(tweet)
            add_tweet(output_data, tweet)

            # if we're working backwards
            # if max_id == 0 or tweet['id'] < max_id:
            #     max_id = tweet['id'] - 1
            #     print('Setting max_id %s' % max_id)
            #     set_max_id(max_id)
            #
            # working forwards
            if max_id == 0 or tweet['id'] > max_id:
                max_id = tweet['id']
                print('Setting max_id %s' % max_id)
                set_max_id(max_id)

        print('Finished')

    except TwitterSearchException as e:  # take care of all those ugly errors if there are some
        print(e)


def save_data(output_data):
    """Save data to a file."""
    # try:
    #     input_file = open('public/data/tweets.json', 'rt')
    #     data = json.loads(input_file.read())
    #     input_file.close()

    #     for item in data:
    #         output_data.append(item)
    # except Exception as ex:
    #     print(ex)

    output_file = open('public/data/tweets.spool', 'at')
    for loop_item in output_data:
        output_file.write('%s,' % json.dumps(loop_item))
    output_file.close()

    output_file = open('public/data/tweets.json', 'wt')
    output_file.write(json.dumps(output_data))
    output_file.close()


if __name__ == '__main__':
    print(datetime.datetime.now())

    output_data = []
    max_id = None

    scan_twitter(output_data, max_id)
    save_data(output_data)
    print('Creating hashes')
    create_geohashes_please()
    print('Done')

    print('Notifying')
    for output_obj in output_data:
        link = 'https://www.cornerstonelabs.co.uk/assets/tweetmap?lat=%s&lng=%s&o=t' % (
            output_obj['lat'],
            output_obj['lon']
        )
        tweet_update.reply_to_tweet(output_obj['id'], output_obj['screen_name'], "you're on the map! %s" % link)
