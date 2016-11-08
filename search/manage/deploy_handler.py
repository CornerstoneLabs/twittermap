"""Deploy."""

import os
from fabric.api import env
from fabric.operations import put, run
from fabric.contrib.project import rsync_project

env.hosts = ['138.68.153.64']
env.user = 'root'

LOCAL_DIR = os.path.abspath('..')

remote_dirs = [
    '/var/www/tweetmap/',
    # '/var/www/dumteedum/',
]
local_dir = os.path.abspath('..')


def _status():
    print("Deploying from %s" % local_dir)
    print('LOCAL_DIR: %s' % LOCAL_DIR)
    print('remote_dirs: %s' % remote_dirs)


def _before_all():
    env_file = os.path.abspath('../nodemap/.env')
    print('Checking %s' % env_file)
    if os.path.exists(env_file):
        print('Moving .env away')
        os.rename(env_file, os.path.abspath('../nodemap/_env'))


def _after_all():
    env_file = os.path.abspath('../nodemap/_env')
    if os.path.exists(env_file):
        os.rename(env_file, os.path.abspath('../nodemap/.env'))


def _upgrade(remote_dir):
    print('Updating npm')
    run('cd %snodemap && npm install' % remote_dir)


def _deploy(files, remote_dir):
    exclude_files = ['.env', '_env']

    rsync_project(local_dir=os.path.join(LOCAL_DIR, 'public', 'css'), remote_dir=os.path.join(remote_dir, 'public'))
    rsync_project(local_dir=os.path.join(LOCAL_DIR, 'public', 'img'), remote_dir=os.path.join(remote_dir, 'public'))
    rsync_project(local_dir=os.path.join(LOCAL_DIR, 'public', 'js'), remote_dir=os.path.join(remote_dir, 'public'))
    rsync_project(local_dir=os.path.join(LOCAL_DIR, 'agents'), remote_dir=os.path.join(remote_dir))
    rsync_project(local_dir=os.path.join(LOCAL_DIR, 'nodemap'), remote_dir=os.path.join(remote_dir), exclude=exclude_files)
    rsync_project(local_dir=os.path.join(LOCAL_DIR, 'geo'), remote_dir=os.path.join(remote_dir), exclude=exclude_files)
    rsync_project(local_dir=os.path.join(LOCAL_DIR, 'es-towns'), remote_dir=os.path.join(remote_dir), exclude=exclude_files)

    for file_name in files:
        put(os.path.join(LOCAL_DIR, file_name), os.path.join(remote_dir, file_name))


def _restart_app():
    run('pm2 restart tweetmap')


def deploy():
    """Deploy files."""
    _status()

    input('Ready?')

    _before_all()

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

    _restart_app()
    _after_all()
