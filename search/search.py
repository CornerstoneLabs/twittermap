"""Search client."""

from TwitterSearch import TwitterSearchOrder, TwitterSearchException, TwitterSearch
import dataqueue
import datetime
import json
import settings


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
    reply_queue = dataqueue.DataQueue('tweet-hashtag-location')
    reply_queue.add(tweet, tweet['id'])

    output_file = open('public/data/%s.tweetjson' % tweet['id'], 'wt')
    output_file.write('%s' % json.dumps(tweet))
    output_file.close()

    output_file = open('public/data/raw-tweets.spool', 'at')
    output_file.write('%s,\n' % json.dumps(tweet))
    output_file.close()


def scan_twitter(max_id):
    """Scan twitter."""
    print('Scanning twitter for %s' % settings.SEARCH)
    max_id = get_max_id()

    try:
        tso = TwitterSearchOrder()
        tso.set_keywords(settings.SEARCH)
        tso.set_include_entities(True)

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

        for tweet in tweets:
            store_tweet(tweet)

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

    except TwitterSearchException as e:  # take care of all those ugly errors if there are some
        print(e)


if __name__ == '__main__':
    print(datetime.datetime.now())

    max_id = None

    print('Getting new tweets')
    scan_twitter(max_id)
