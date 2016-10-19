"""Data stores."""

import json
import os
import shutil
import errno

DATA_STORE = os.path.join(os.path.abspath('.'), 'datastores')


def make_sure_path_exists(path):
    """Create dir if it doesn't exist."""
    try:
        os.makedirs(path)
    except OSError as exception:
        if exception.errno != errno.EEXIST:
            raise


class DataQueue(object):
    """Handle data streams."""

    def __init__(self, name):
        """Constructor."""
        self.name = name
        self.PENDING_PATH = os.path.join(DATA_STORE, name, 'pending')
        self.SUCCESS_PATH = os.path.join(DATA_STORE, name, 'success')
        self.FAIL_PATH = os.path.join(DATA_STORE, name, 'fail')

        self.create_stores(name)

    def destroy_stores(self):
        """Destroy all the stores."""
        shutil.rmtree(os.path.join(DATA_STORE, self.name))

    def create_stores(self, name):
        """Create the stores."""
        make_sure_path_exists(self.PENDING_PATH)
        make_sure_path_exists(self.SUCCESS_PATH)
        make_sure_path_exists(self.FAIL_PATH)

    def add(self, data, id):
        """Write a data piece to the input stream."""
        filename = os.path.join(self.PENDING_PATH, '%s.json' % id)

        output_file = open(filename, 'wt')
        output_file.write(json.dumps(data))
        output_file.close()

    def success(self, id):
        """Move a data piece into the success stream."""
        filename_source = os.path.join(self.PENDING_PATH, '%s.json' % id)
        filename_destination = os.path.join(self.SUCCESS_PATH, '%s.json' % id)

        shutil.move(filename_source, filename_destination)

    def fail(self, id, error=None):
        """Move a data piece into the success stream."""
        filename_source = os.path.join(self.PENDING_PATH, '%s.json' % id)
        filename_destination = os.path.join(self.FAIL_PATH, '%s.json' % id)

        shutil.move(filename_source, filename_destination)

        if error:
            self.write_failure_notice(id, error)

    def write_failure_notice(self, id, error):
        """Write the reason why."""
        filename = os.path.join(self.FAIL_PATH, '%s.log' % id)

        output_file = open(filename, 'wt')
        output_file.write(error)
        output_file.close()

    def read(self, id):
        """Read the file and return json object."""
        filename = os.path.join(self.PENDING_PATH, '%s.json' % id)

        file_handle = open(filename, 'rt')
        data = json.load(file_handle)
        file_handle.close()

        return data

    def next(self):
        """Get the next file from pending."""
        files = os.listdir(self.PENDING_PATH)
        files.sort()

        if len(files) > 0:
            next_id = files[0].split('.json')[0]
            return next_id, self.read(next_id)

        return None, None

    def status(self):
        """Get status of queues."""
        return {
            'name': self.name,
            'pending': len(os.listdir(self.PENDING_PATH)),
            'success': len(os.listdir(self.SUCCESS_PATH)),
            'fail': len(os.listdir(self.FAIL_PATH)),
        }

    def requeue(self):
        """Put the failed items back in."""
        files = os.listdir(self.FAIL_PATH)

        for file_name in files:
            if not file_name.endswith('.log'):
                filename_destination = os.path.join(self.PENDING_PATH, file_name)
                filename_source = os.path.join(self.FAIL_PATH, file_name)

                shutil.move(filename_source, filename_destination)
