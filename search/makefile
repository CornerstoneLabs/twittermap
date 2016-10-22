install:
	pyvenv .
	source bin/activate && pip3 install -r requirements.txt

deploy:
	#scp -r ./public/* root@138.68.153.64:/var/www/dumteedum/public/
	scp -r ./public/css/* root@138.68.153.64:/var/www/tweetmap/public/css/
	scp -r ./public/img/* root@138.68.153.64:/var/www/tweetmap/public/img/
	scp -r ./public/index.html root@138.68.153.64:/var/www/tweetmap/public/index.html
	scp -r ./public/js/* root@138.68.153.64:/var/www/tweetmap/public/js/
	scp -r ./agent_all_status.py root@138.68.153.64:/var/www/tweetmap/agent_all_status.py
	scp -r ./agent_hashtag_location.py root@138.68.153.64:/var/www/tweetmap/agent_hashtag_location.py
	scp -r ./agent_reply_country_location.py root@138.68.153.64:/var/www/tweetmap/agent_reply_country_location.py
	scp -r ./agent_search.py root@138.68.153.64:/var/www/tweetmap/agent_search.py
	scp -r ./agent_tweet_mentions.py root@138.68.153.64:/var/www/tweetmap/agent_tweet_mentions.py
	scp -r ./agent_tweet_reply.py root@138.68.153.64:/var/www/tweetmap/agent_tweet_reply.py
	scp -r ./dataqueue.py root@138.68.153.64:/var/www/tweetmap/dataqueue.py
	scp -r ./geohash.py root@138.68.153.64:/var/www/tweetmap/geohash.py
	scp -r ./location.py root@138.68.153.64:/var/www/tweetmap/location.py
	scp -r ./rehash.py root@138.68.153.64:/var/www/tweetmap/rehash.py
	scp -r ./settings.py root@138.68.153.64:/var/www/tweetmap/settings.py
	scp -r ./tweet_update.py root@138.68.153.64:/var/www/tweetmap/tweet_update.py
	scp -r ./requirements.txt root@138.68.153.64:/var/www/tweetmap/requirements.txt

deploy-geo:
	scp -r ./geo/* root@138.68.153.64:/var/www/tweetmap/geo/

search:
	source bin/activate && python search.py

infinity:
	python search.py
	make infinity
