install:
	pyvenv .
	source bin/activate && pip3 install -r requirements.txt

deploy:
	#scp -r ./public/* root@138.68.153.64:/var/www/dumteedum/public/
	scp -r ./public/css/* root@138.68.153.64:/var/www/dumteedum/public/css/
	scp -r ./public/img/* root@138.68.153.64:/var/www/dumteedum/public/img/
	scp -r ./public/index.html root@138.68.153.64:/var/www/dumteedum/public/index.html
	scp -r ./public/js/* root@138.68.153.64:/var/www/dumteedum/public/js/
	scp -r ./agent_all_status.py root@138.68.153.64:/var/www/dumteedum/agent_all_status.py
	scp -r ./agent_geocode.py root@138.68.153.64:/var/www/dumteedum/agent_geocode.py
	scp -r ./agent_tweet_reply.py root@138.68.153.64:/var/www/dumteedum/agent_tweet_reply.py
	scp -r ./dataqueue.py root@138.68.153.64:/var/www/dumteedum/dataqueue.py
	scp -r ./geohash.py root@138.68.153.64:/var/www/dumteedum/geohash.py
	scp -r ./location.py root@138.68.153.64:/var/www/dumteedum/location.py
	scp -r ./rehash.py root@138.68.153.64:/var/www/dumteedum/rehash.py
	scp -r ./search.py root@138.68.153.64:/var/www/dumteedum/search.py
	scp -r ./settings.py root@138.68.153.64:/var/www/dumteedum/settings.py
	scp -r ./tweet_update.py root@138.68.153.64:/var/www/dumteedum/tweet_update.py

deploy-geo:
	scp -r ./geo/* root@138.68.153.64:/var/www/dumteedum/geo/

search:
	source bin/activate && python search.py

infinity:
	python search.py
	make infinity
