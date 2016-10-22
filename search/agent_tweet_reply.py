"""Send replies."""
import time
import tweet_update
import dataqueue


def log(text):
    """Some way to output."""
    print(text)


def tweet_queue_run():
    """Send reply tweets."""
    reply_queue = dataqueue.DataQueue('tweet-reply')
    log(reply_queue.status())

    reply_id, reply_data = reply_queue.next()

    while reply_id is not None:
        log(reply_id)
        try:
            log('Replying to %s' % reply_data['screen_name'])
            result = tweet_update.reply_to_tweet(
                reply_data['in_reply_to_status_id'],
                reply_data['screen_name'],
                reply_data['status']
            )

            log('✓')
            log(result)
            # result['id'] will be the new tweet ID
            reply_queue.success(reply_id)

            sent_queue = dataqueue.DataQueue('tweet-reply-sent')
            sent_queue.add(reply_data, result['id'])
        except Exception as ex:
            log('X %s' % reply_id)
            reply_queue.fail(reply_id, str(ex))

        time.sleep(1)
        reply_id, reply_data = reply_queue.next()


if __name__ == '__main__':
    tweet_queue_run()
