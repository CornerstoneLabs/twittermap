"""Fabfile."""

import status_elasticsearch
import status_memory_free
import status_disk
import status_pm2_list


def status():
    """Run checks."""
    status_elasticsearch.status()
    status_memory_free.status()
    status_disk.status()


def status__elasticsearch():
    """Run status."""
    status_elasticsearch.status()


def status__memory_free():
    """Run status."""
    status_memory_free.status()


def status__disk():
    """Run status."""
    status_disk.status()


def status__pm2_list():
    """Run pm2 status."""
    status_pm2_list.status()
