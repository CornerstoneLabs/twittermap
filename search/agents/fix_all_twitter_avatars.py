"""Fix all avatars."""
from agents.fix_twitter_avatars import fix_avatars_run
import json
import time
import urllib.request


def read_tweets():
    """Read tweets from the store."""
    input_handle = open('public/data/tweets.spool', 'rt')
    buffer = input_handle.read()
    input_handle.close()

    return buffer


def get_tweets():
    """Get the tweets data."""
    broken_json = read_tweets()
    #
    # Remove the last comma and wrap in a json list
    #
    parsed = json.loads('[%s]' % broken_json[:-1])
    return parsed


def avatar_is_broken(url):
    """Return true if the url 404s."""
    try:
        urllib.request.urlopen(url)
    except Exception:
        return True

    return False


def fix_all_twitter_avatars():
    """Loop through all the tweets."""
    tweets = get_tweets()
    for item in tweets:
        if 'screen_name' in item:
            print(item['screen_name'])

            if avatar_is_broken(item['avatar']):
                fix_avatars_run(item['screen_name'])

                if 'provider' in item and item['provider'] == 'facebook':
                    print('Facebook user')
                else:
                    time.sleep(30)
