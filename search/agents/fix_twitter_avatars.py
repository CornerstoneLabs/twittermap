"""Reply helpers."""

from twython import Twython
import json
import settings

# Our format:
#
# {
#     'avatar':'https://abs.twimg.com/sticky/default_profile_images/default_profile_4_normal.png',
#     'id':790566826422001668,
#     'details':'Birmingham',
#     'screen_name':'j3rryj0hns0n1',
#     'id_str':'790566826422001668',
#     'name':'Jerry Johnson',
#     'lat':'52.47872',
#     'lon':'-1.90723'
# }
#
# Returned from twitter user profile:
#
# {
#     'profile_image_url':'http://abs.twimg.com/sticky/default_profile_images/default_profile_4_normal.png',
#     'time_zone':None,
#     'favourites_count':0,
#     'follow_request_sent':False,
#     'has_extended_profile':False,
#     'listed_count':0,
#     'profile_image_url_https':'https://abs.twimg.com/sticky/default_profile_images/default_profile_4_normal.png',
#     'followers_count':0,
#     'name':'Jerry Johnson',
#     'friends_count':10,
#     'status':{
#         'favorited':False,
#         'in_reply_to_screen_name':'CLbotbot',
#         'in_reply_to_status_id_str':'790897464777801728',
#         'in_reply_to_status_id':790897464777801728,
#         'retweet_count':0,
#         'geo':None,
#         'id':790897546264711168,
#         'text':'@CLbotbot 1',
#         'is_quote_status':False,
#         'lang':'und',
#         'id_str':'790897546264711168',
#         'in_reply_to_user_id':788299460606648320,
#         'in_reply_to_user_id_str':'788299460606648320',
#         'place':None,
#         'favorite_count':0,
#         'entities':{
#             'urls':[

#             ],
#             'hashtags':[

#             ],
#             'user_mentions':[
#                 {
#                     'id_str':'788299460606648320',
#                     'id':788299460606648320,
#                     'name':'CornerstoneLabsBot',
#                     'screen_name':'CLbotbot',
#                     'indices':[
#                         0,
#                         9
#                     ]
#                 }
#             ],
#             'symbols':[

#             ]
#         },
#         'created_at':'Tue Oct 25 12:47:23 +0000 2016',
#         'truncated':False,
#         'source':'<a href="https://about.twitter.com/products/tweetdeck" rel="nofollow">TweetDeck</a>',
#         'coordinates':None,
#         'retweeted':False,
#         'contributors':None
#     },
#     'profile_background_image_url':None,
#     'profile_link_color':'1DA1F2',
#     'is_translator':False,
#     'id':789097210906542080,
#     'statuses_count':16,
#     'following':False,
#     'lang':'en-gb',
#     'default_profile_image':True,
#     'profile_sidebar_border_color':'C0DEED',
#     'id_str':'789097210906542080',
#     'profile_location':None,
#     'notifications':False,
#     'protected':False,
#     'screen_name':'j3rryj0hns0n1',
#     'location':'',
#     'contributors_enabled':False,
#     'utc_offset':None,
#     'entities':{
#         'description':{
#             'urls':[

#             ]
#         }
#     },
#     'profile_use_background_image':True,
#     'created_at':'Thu Oct 20 13:33:30 +0000 2016',
#     'url':None,
#     'is_translation_enabled':False,
#     'description':'',
#     'profile_sidebar_fill_color':'DDEEF6',
#     'geo_enabled':False,
#     'profile_background_tile':False,
#     'verified':False,
#     'profile_background_image_url_https':None,
#     'default_profile':True,
#     'profile_background_color':'F5F8FA',
#     'profile_text_color':'333333',
#     'translator_type':'none'
# }


def initialise():
    """Initialise the twitter connection."""
    twitter = Twython(
        settings.CONSUMER_KEY,
        settings.CONSUMER_SECRET,
        settings.ACCESS_TOKEN,
        settings.ACCESS_TOKEN_SECRET
    )

    return twitter


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


def save_tweet_data(data):
    """Write data back to the spool file as broken JSON."""
    text_buffer = json.dumps(data)
    text_buffer = text_buffer[1:-1]
    text_buffer = '%s,' % text_buffer

    with open('public/data/tweets.spool', 'wt') as file_handle:
        file_handle.write(text_buffer)

    print('Updated.')


def fix_item(source, twitter_data):
    """Read in the tweet spool and change the name and avatar of a user."""
    tweets_data = get_tweets()

    for item in tweets_data:
        user_found = False

        if 'provider' in item:
            if item['provider'] == 'twitter':
                if item['screen_name'] == source['screen_name'] and item['id'] == source['id']:
                    user_found = True
        else:
            #
            # Default to twitter
            if item['screen_name'] == source['screen_name'] and item['id'] == source['id']:
                user_found = True

        if user_found:
            print('User looked back up again')
            item['name'] = twitter_data['name']
            item['avatar'] = twitter_data['profile_image_url_https']
            print('Changed to')
            print(item)
            break

    save_tweet_data(tweets_data)


def check_avatar(item):
    """It is a tweet user."""
    if 'screen_name' in item:
        twitter = initialise()
        user_data = twitter.show_user(screen_name=item['screen_name'])
        print ('Comparing')
        print (item)
        print (user_data)

        if user_data['profile_image_url_https'] != item['avatar']:
            print('Updated avatar')
        else:
            print('No change to avatar')

        if user_data['name'] != item['name']:
            print('Updated name')
        else:
            print('No change to name')

        input('Press enter to fix: ')
        fix_item(item, user_data)


def handle_item(item, user_to_check):
    """Check if it's a twitter item."""
    if 'provider' in item:
        if item['provider'] == 'twitter':
            if item['screen_name'] == user_to_check:
                check_avatar(item)
    else:
        #
        # Default to twitter
        if item['screen_name'] == user_to_check:
            check_avatar(item)


def handle_items(data, user_to_check):
    """Loop through the items."""
    for item in data:
        handle_item(item, user_to_check)


def fix_avatars_run(user_to_check):
    """Process reading and checking avatar."""
    print('Checking items')
    parsed = get_tweets()
    handle_items(parsed, user_to_check)
