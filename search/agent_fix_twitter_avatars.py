"""Fix twitter avatars."""

from agents.fix_twitter_avatars import *
import sys


if __name__ == '__main__':
    user_to_check = sys.argv[1]
    print('About to check %s' % user_to_check)
    input('Press enter')
    fix_avatars_run(user_to_check)
