install:
	pyvenv .
	source bin/activate && pip3 install -r requirements.txt

deploy:
	#scp -r -P 6022 ./public/* root@46.101.12.19:/var/www/dumteedum/public/
	scp -r -P 6022 ./public/img/* root@46.101.12.19:/var/www/dumteedum/public/img/
	scp -r -P 6022 ./public/js/* root@46.101.12.19:/var/www/dumteedum/public/js/
	scp -r -P 6022 ./public/index.html root@46.101.12.19:/var/www/dumteedum/public/index.html
	scp -r -P 6022 ./search.py root@46.101.12.19:/var/www/dumteedum/search.py
	scp -r -P 6022 ./geohash.py root@46.101.12.19:/var/www/dumteedum/geohash.py
	scp -r -P 6022 ./rehash.py root@46.101.12.19:/var/www/dumteedum/rehash.py
	scp -r -P 6022 ./settings.py root@46.101.12.19:/var/www/dumteedum/settings.py

deploy-geo:
	scp -r -P 6022 ./geo/* root@46.101.12.19:/var/www/dumteedum/geo/

search:
	source bin/activate && python search.py

infinity:
	python search.py
	make infinity
