"""Reply helpers."""

from agents.tweet_mentions import *


if __name__ == '__main__':
    print(datetime.datetime.now())

    max_id = None

    print('Getting new tweets')
    scan_twitter(max_id)
