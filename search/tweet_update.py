"""Reply helpers."""

from twython import Twython
import settings


def initialise():
    """Initialise the twitter connection."""
    twitter = Twython(
        settings.CONSUMER_KEY,
        settings.CONSUMER_SECRET,
        settings.ACCESS_TOKEN,
        settings.ACCESS_TOKEN_SECRET
    )

    return twitter


def update_status(message):
    """
    Write a message.

    Use like this:

    response = update_status('Good morning, awesome people!')
    """
    twitter = initialise()
    return twitter.update_status(status=message)


def reply_to_tweet(tweet_id, username, message):
    """
    Reply to a tweet.

    Example:

    response = reply_to_tweet(788302444249874432, 'adamauckland', 'Me too!')

    """
    username = 'adamauckland'
    twitter = initialise()
    twitter.update_status(
        status='@%s %s' % (username, message),
        in_reply_to_status_id=tweet_id
    )
