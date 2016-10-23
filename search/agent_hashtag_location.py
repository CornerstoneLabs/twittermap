"""Geocode incoming tweets."""

from agents.hashtag_location import *


if __name__ == '__main__':
    print(datetime.datetime.now())
    output_data = []
    incoming_tweet_queue_run(output_data)
    save_data(output_data)
    create_geohashes_please()


if __name__ == '__main__':
    print(datetime.datetime.now())
    output_data = []
    incoming_tweet_queue_run(output_data)
    save_data(output_data)
    print('Creating hashes')
    create_geohashes_please()
