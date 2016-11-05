"""Geocode incoming tweets."""
import datetime
from agents.hashtag_location import *
from rehash import create_geohashes_please


if __name__ == '__main__':
    print(datetime.datetime.now())
    output_data = []
    incoming_tweet_queue_run(output_data)
    save_data(output_data)
    print('Creating hashes')
    create_geohashes_please()
