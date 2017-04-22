"""Status of queues."""

import dataqueue

if __name__ == '__main__':
    print(dataqueue.DataQueue('tweet-hashtag-location').status())
    print(dataqueue.DataQueue('tweet-reply').status())
    print(dataqueue.DataQueue('tweet-geocoded').status())
