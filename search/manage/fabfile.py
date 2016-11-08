"""Deploy."""

import os
from fabric.api import env
from fabric.operations import put, run
from fabric.contrib.project import rsync_project

env.hosts = ['138.68.153.64']
env.user = 'root'

remote_dirs = [
    '/var/www/tweetmap/',
    # '/var/www/dumteedum/',
]
local_dir = os.path.abspath('..')

print("Deploying from %s" % local_dir)


def _before_all():
    env_file = os.path.abspath('nodemap/.env')
    if os.path.exists(env_file):
        os.rename(env_file, os.path.abspath('nodemap/_env'))


def _after_all():
    env_file = os.path.abspath('nodemap/_env')
    if os.path.exists(env_file):
        os.rename(env_file, os.path.abspath('nodemap/.env'))


def _upgrade(remote_dir):
    print('Updating npm')
    run('cd %snodemap && npm install' % remote_dir)


def _deploy(files, remote_dir):
    rsync_project(local_dir=os.path.join(local_dir, 'public', 'css'), remote_dir=os.path.join(remote_dir, 'public'))
    rsync_project(local_dir=os.path.join(local_dir, 'public', 'img'), remote_dir=os.path.join(remote_dir, 'public'))
    rsync_project(local_dir=os.path.join(local_dir, 'public', 'js'), remote_dir=os.path.join(remote_dir, 'public'))
    rsync_project(local_dir=os.path.join(local_dir, 'agents'), remote_dir=os.path.join(remote_dir))
    rsync_project(local_dir=os.path.join(local_dir, 'nodemap'), remote_dir=os.path.join(remote_dir), exclude='.env')
    rsync_project(local_dir=os.path.join(local_dir, 'geo'), remote_dir=os.path.join(remote_dir), exclude='.env')
    rsync_project(local_dir=os.path.join(local_dir, 'es-towns'), remote_dir=os.path.join(remote_dir), exclude='.env')

    for file_name in files:
        put(os.path.join(local_dir, file_name), os.path.join(remote_dir, file_name))


def deploy():
    """Deploy files."""
    files = [
        'public/index.html',
        'agent_all_status.py',
        'agent_hashtag_location.py',
        'agent_reply_country_location.py',
        'agent_search.py',
        'agent_tweet_mentions.py',
        'agent_tweet_reply.py',
        'dataqueue.py',
        'geohash.py',
        'events.py',
        'location.py',
        'rehash.py',
        'settings.py',
        'tweet_update.py',
        'requirements.txt'
    ]

    for remote_dir in remote_dirs:
        _deploy(files, remote_dir)
        _upgrade(remote_dir)
