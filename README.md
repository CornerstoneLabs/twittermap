# twittermap
A map to show Tweets

## Repository
[Github](https://github.com/CornerstoneLabs/twittermap)

## Run
```
$ cd twittermap/search/public
$ python3 -m http.server --bind 0.0.0.0 8888
```

## Visit
`http://0.0.0.0:8888/`

## Update twitter names

To refresh the twitter users, get the username from twitter then do


cd /var/www/tweetmap
source env/bin/activate
python agent_fix_twitter_avatars.py USER_HANDLE

it will ask you some questions, then update tweet.spool

