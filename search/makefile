install:
	pyvenv .
	source bin/activate && pip3 install -r requirements.txt

deploy:
	source bin/activate && cd manage && fab deploy

deploy-geo:
	scp -r ./geo/* root@138.68.153.64:/var/www/tweetmap/geo/

search:
	source bin/activate && python search.py

infinity:
	python search.py
	make infinity

tunnelstats:
	ssh -L 5984:127.0.0.1:5984 root@tweetmap.cornerstonelabs.co.uk
