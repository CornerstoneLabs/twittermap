install:
	pyvenv .
	source bin/activate && pip3 install -r requirements.txt

deploy:
	scp -r -P 6022 ./public/* root@46.101.12.19:/var/www/dumteedum/public/
	scp -r -P 6022 ./geo/* root@46.101.12.19:/var/www/dumteedum/geo/
	scp -r -P 6022 ./search.py root@46.101.12.19:/var/www/dumteedum/search.py
	scp -r -P 6022 ./settings.py root@46.101.12.19:/var/www/dumteedum/settings.py

search:
	source bin/activate && python search.py

infinity:
	python search.py
	make infinity
