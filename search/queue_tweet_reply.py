"""Send replies."""
import time
import tweet_update
import dataqueue


def tweet_queue_run():
    """Send reply tweets."""
    reply_queue = dataqueue.DataQueue('tweet-reply')
    print(reply_queue.status())

    reply_id, reply_data = reply_queue.next()

    while reply_id is not None:
        try:
            print('Replying to %s' % reply_data['screen_name'])
            tweet_update.reply_to_tweet(
                reply_data['in_reply_to_status_id'],
                reply_data['screen_name'],
                reply_data['status']
            )

            print('✓')
            reply_queue.success(reply_id)
        except Exception as ex:
            print('X')
            reply_queue.fail(reply_id, str(ex))

        time.sleep(1)
        reply_id, reply_data = reply_queue.next()


if __name__ == '__main__':
    tweet_queue_run()
