"""Geocode incoming tweets."""
import dataqueue
import datetime
import json
import location
import events
import settings
from rehash import create_geohashes_please


def add_tweet_enqueue_reply(output_obj, parent):
    """Enqueue the reply now we've worked out where it's for."""
    reply_queue = dataqueue.DataQueue('tweet-reply')

    link = settings.WEB_LINK + '/?lat=%s&lng=%s&o=t' % (
        output_obj['lat'],
        output_obj['lon']
    )

    reply_data = {
        'in_reply_to_status_id': output_obj['id'],
        'screen_name': output_obj['screen_name'],
        'link': link,
        'status': "you're on the map! %s" % link,
        'parent': parent,
    }

    reply_queue.add(reply_data, output_obj['id'])


def add_tweet_enqueue_which_country(output_obj, question, parent):
    """Enqueue the reply now we've worked out where it's for."""
    reply_queue = dataqueue.DataQueue('tweet-reply')

    reply_data = {
        'in_reply_to_status_id': output_obj['id'],
        'screen_name': output_obj['screen_name'],
        'status': question,
        'parent': parent,
    }

    reply_queue.add(reply_data, output_obj['id'])


def geocode_tweet(output_data, tweet):
    """Add the tweet to data."""
    print('\n%s\n' % tweet)
    print('%s tweeted: %s \nuser location %s ' % (tweet['user']['name'], tweet['text'], tweet['user']['location']))

    text = tweet['text'].lower()
    text = text.replace('@CLbotbot', '')
    text = text.replace('@dtdbot_', '')
    text = text.strip()

    try:
        reply_value = int(text)
    except Exception as ex:
        print('Unable to parse %s' % text)
        print(ex)
        return False

    reply_tweet = tweet['in_reply_to_status_id']
    tweet_reply_queue = dataqueue.DataQueue('tweet-reply-sent')
    print('Finding reply tweet: %s' % reply_tweet)
    original = tweet_reply_queue.find(reply_tweet)

    print('Original tweet: %s' % original)
    answers = original['answers']
    town = original['details']
    country_code = answers[reply_value - 1]

    print ('Got country code %s, town %s' % (country_code, town))
    towns = location.lookup_town_levenshtein(town, country_code)

    if len(towns) > 0:
        town = towns[0]
        print('Using %s' % (town['name']))

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

        add_tweet_enqueue_reply(output_obj, events.find_metakey_id(tweet['id']))

        geolocated_tweet_queue = dataqueue.DataQueue('tweet-geocoded')
        geolocated_tweet_queue.add(output_obj, output_obj['id'])

        output_data.append(output_obj)

        events.store(
            'TWEET_GEOCODED',
            None,
            output_obj,
            events.find_metakey_id(tweet['id'])
        )

        return True

    if len(towns) == 0:
        print('Could not find town')
        return False


def incoming_tweet_queue_run(output_data):
    """Handle incoming tweets."""
    hashtag_location_tweets = dataqueue.DataQueue('tweet-reply-country-location')
    hashtag_location_tweets.requeue()

    tweet_id, tweet = hashtag_location_tweets.next()

    while tweet_id is not None:
        result = geocode_tweet(output_data, tweet)

        if result:
            hashtag_location_tweets.success(tweet_id)
        else:
            hashtag_location_tweets.fail(tweet_id)

        tweet_id, tweet = hashtag_location_tweets.next()


def save_data(output_data):
    """Save data to a file."""
    output_file = open('public/data/tweets.spool', 'at')
    for loop_item in output_data:
        output_file.write('%s,' % json.dumps(loop_item))
    output_file.close()
