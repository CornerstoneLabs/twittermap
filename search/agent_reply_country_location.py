"""Geocode incoming tweets."""
import datetime
from agents.reply_country_location import *

if __name__ == '__main__':
    print(datetime.datetime.now())
    output_data = []
    incoming_tweet_queue_run(output_data)
    save_data(output_data)
