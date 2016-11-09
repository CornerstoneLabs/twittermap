"""Get status of ES."""

import json
from fabric.operations import run
from status_base import save, setup_environment

setup_environment()


def status():
    """Run check on Elasticsearch."""
    output = run('curl http://127.0.0.1:9200/_stats')
    data = json.loads(output)
    save(True, data, 'dumteedum_status', 'elasticsearch')
