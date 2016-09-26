install:
	pyvenv .
	source bin/activate && pip3 install -r requirements.txt

deploy:
	scp -r -P 6022 ./public/* root@46.101.12.19:/var/www/dumteedum/public/

search:
	source bin/activate && python search.py

infinity:
	python search.py
	make infinity
