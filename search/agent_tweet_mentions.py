"""Reply helpers."""

from twython import Twython
import dataqueue
import datetime
import json
import settings
import events


def initialise():
    """Initialise the twitter connection."""
    twitter = Twython(
        settings.CONSUMER_KEY,
        settings.CONSUMER_SECRET,
        settings.ACCESS_TOKEN,
        settings.ACCESS_TOKEN_SECRET
    )

    return twitter


def get_max_id():
    """Get the latest tweet we've ever got."""
    max_id = 0

    try:
        file_handle = open('public/data/agent_mentions_maxid.json', 'rt')
        data = json.load(file_handle)
        print(data)
        max_id = data['max_id']
        file_handle.close()
    except Exception as ex:
        print('error %s' % ex)
    return max_id


def set_max_id(max_id):
    """Set the latest tweet we've ever got."""
    output_file = open('public/data/agent_mentions_maxid.json', 'wt')
    output_data = {
        'max_id': max_id
    }
    output_file.write(json.dumps(output_data))
    output_file.close()


def store_tweet(tweet):
    """Store the tweet for backup."""
    reply_queue = dataqueue.DataQueue('tweet-reply-country-location')
    reply_queue.add(tweet, tweet['id'])

    #
    # We need to link this tweet to the reply
    #
    events.store(
        'TWEET_MENTIONED',
        tweet['id'],
        tweet,
        events.find_metakey_id(tweet['in_reply_to_status_id'])
    )


def scan_twitter(max_id):
    """Scan twitter."""
    print('Scanning twitter for mentions')
    max_id = get_max_id()

    twitter = initialise()

    try:
        if max_id:
            print('Searching since: %s' % max_id)
            # working backwards
            # tso.set_max_id(max_id)
            #
            # working forwards
            tweets = twitter.get_mentions_timeline(since_id=max_id)
        else:
            tweets = twitter.get_mentions_timeline()

        print('Retrieved list of tweets')

        for tweet in tweets:
            print(tweet)
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

    except Exception as e:  # take care of all those ugly errors if there are some
        print(e)

if __name__ == '__main__':
    print(datetime.datetime.now())

    max_id = None

    print('Getting new tweets')
    scan_twitter(max_id)
