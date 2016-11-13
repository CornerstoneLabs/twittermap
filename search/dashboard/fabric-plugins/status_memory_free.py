"""Get status of memory."""

from fabric.operations import run
from status_base import save, setup_environment, schedule_log

setup_environment()


def convert(data):
    """Convert the output to JSON."""
    lines = data.split('\r')
    header = lines[0].split()
    values = lines[1].split()

    output = []

    for i in range(len(header)):
        output.append({
            'name': header[i],
            'value': values[i + 1]
        })
    return output


def status():
    """Run check on memory."""
    schedule_log("Starting Memory Monitor")

    output = run('free')
    data = convert(output)
    save(True, data, 'dumteedum_status', 'memory-free', output)

    schedule_log("Finished")