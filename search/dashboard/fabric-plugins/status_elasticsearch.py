"""Get status of ES."""

import json
from fabric.operations import run
from status_base import save, setup_environment, schedule_log
from fabric.api import settings


class FabricException(Exception):
    """Error."""

    pass

setup_environment()


def status():
    """Run check on Elasticsearch."""
    schedule_log("Starting Elasticsearch Monitor")

    command_text = 'curl http://127.0.0.1:9200/_stats'

    schedule_log('Running: %s' % command_text)

    output = run(command_text)

    # with settings(abort_exception=FabricException):
    #     try:
    #         schedule_log('In settings context')
    #         output = run(command_text)
    #         schedule_log(output)
    #     except FabricException as ex:
    #         schedule_log('Error %s' % ex)

    schedule_log('Success')

    data = json.loads(output)

    schedule_log('Loaded json')

    schedule_log('Saving')

    save(True, data, 'dumteedum_status', 'elasticsearch', output)

    schedule_log('Finished')
