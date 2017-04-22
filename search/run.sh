#!/bin/bash
source /var/www/dumteedum/env/bin/activate
cd /var/www/dumteedum
python agent_search.py 
python agent_hashtag_location.py 
python agent_tweet_reply.py 
python agent_all_status.py > public/data/status.json
python agent_tweet_mentions.py 
python agent_reply_country_location.py 
