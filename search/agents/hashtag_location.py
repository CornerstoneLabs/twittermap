"""Geocode incoming tweets."""
import dataqueue
import json
import location
import events
import settings


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


def add_tweet_enqueue_which_country(output_obj, question, answers, parent):
    """Enqueue the reply now we've worked out where it's for."""
    reply_queue = dataqueue.DataQueue('tweet-reply')

    reply_data = {
        'in_reply_to_status_id': output_obj['id'],
        'screen_name': output_obj['screen_name'],
        'status': question,
        'answers': answers,
        'details': output_obj['details'],
        'parent': parent,
    }

    reply_queue.add(reply_data, output_obj['id'])


def store_geocoded_tweet(output_data, town, tweet):
    """Store the geocoded tweet."""
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


def request_town_confirmation(unique_countries, towns, tweet):
    """Request which town from the user."""
    town_name = towns[0]['name']
    question = '%s\n' % town_name

    for country in range(len(unique_countries)):
        question += '\n%s %s' % (country + 1, location.country(unique_countries[country]))

    if len(question) + len(tweet['user']['screen_name']) + 2 + len(town_name) >= 140:
        question = question[:140 - len(town_name) - (len(tweet['user']['screen_name']) + 2)]

    output_obj = {}
    output_obj['id'] = tweet['id']
    output_obj['id_str'] = tweet['id_str']
    output_obj['name'] = '%s' % tweet['user']['name']
    output_obj['screen_name'] = '%s' % tweet['user']['screen_name']
    output_obj['details'] = town_name
    answers = []
    for country in unique_countries:
        answers.append(country)

    add_tweet_enqueue_which_country(
        output_obj,
        question,
        answers,
        events.find_metakey_id(tweet['id'])
    )


def add_tweet_cant_find_it(tweet):
    """Enqueue the reply that we couldn't find it."""
    reply_queue = dataqueue.DataQueue('tweet-reply')

    reply_data = {
        'in_reply_to_status_id': tweet['id'],
        'screen_name': tweet['user']['screen_name'],
        'status': 'I\'m sorry! I couldn\'t find that. Try tweeting the nearest town to #dtdmap',
        'parent': tweet['id'],
    }

    reply_queue.add(reply_data, tweet['id'])


def geocode_tweet(output_data, tweet):
    """Add the tweet to data."""
    tweet_text = ' '.join(location.sanitize_words(tweet['text'].split()))

    towns = location.lookup_town_levenshtein(tweet_text, None)
    unique_countries = list(set([town['country'] for town in towns]))
    unique_countries.sort()

    if len(unique_countries) == 1:
        town = towns[0]
        store_geocoded_tweet(output_data, town, tweet)

        return True

    if len(unique_countries) == 0:
        events.store(
            'GEOCODE_TOWN_NOT_FOUND',
            None,
            {},
            events.find_metakey_id(tweet['id'])
        )

        print('Could not find town')
        add_tweet_cant_find_it(tweet)

        return False

    if len(unique_countries) > 1:
        request_town_confirmation(unique_countries, towns, tweet)

        return True


def incoming_tweet_queue_run(output_data):
    """Handle incoming tweets."""
    hashtag_location_tweets = dataqueue.DataQueue('tweet-hashtag-location')
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
