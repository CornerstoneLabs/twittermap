"""Get status of disk."""

from fabric.operations import run
from status_base import save, setup_environment

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
    """Run check on disk."""
    output = run('df -h')
    save(True, {}, 'dumteedum_status', 'disk', output)
