"""Test stores."""
import dataqueue
import unittest
import os
import time


class TestQueue(unittest.TestCase):
    """Test queue."""

    def test_happy_queue(self):
        """Test queue."""
        data_queue = dataqueue.DataQueue('tests')

        test_object = {
            'name': 'test object',
            'age': 40
        }
        data_queue.add(test_object, 1)

        next_id, next_object = data_queue.next()

        self.assertEqual(next_object['name'], 'test object')
        self.assertEqual(next_object['age'], 40)

        data_queue.success(1)

        # wait for file to move
        time.sleep(1)

        pending_filename = os.path.join(data_queue.PENDING_PATH, '%s.json' % next_id)
        self.assertEqual(os.path.exists(pending_filename), False)

        success_filename = os.path.join(data_queue.SUCCESS_PATH, '%s.json' % next_id)
        self.assertEqual(os.path.exists(success_filename), True)

    def test_sad_queue(self):
        """Test queue."""
        data_queue = dataqueue.DataQueue('tests')

        test_object = {
            'name': 'test object',
            'age': 40
        }
        data_queue.add(test_object, 1)

        next_id, next_object = data_queue.next()

        self.assertEqual(next_object['name'], 'test object')
        self.assertEqual(next_object['age'], 40)

        data_queue.fail(1, 'Broken')

        # wait for file to move
        time.sleep(1)

        pending_filename = os.path.join(data_queue.PENDING_PATH, '%s.json' % next_id)
        self.assertEqual(os.path.exists(pending_filename), False)

        fail_filename = os.path.join(data_queue.FAIL_PATH, '%s.json' % next_id)
        self.assertEqual(os.path.exists(fail_filename), True)

        fail_reason = os.path.join(data_queue.FAIL_PATH, '%s.log' % next_id)
        self.assertEqual(os.path.exists(fail_reason), True)

    def tearDown(self):
        """Tear down."""
        data_queue = dataqueue.DataQueue('tests')
        data_queue.destroy_stores()

if __name__ == '__main__':
    unittest.main()
