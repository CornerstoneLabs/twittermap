"""Fabfile."""

import deploy_handler
import status_elasticsearch
import status_memory_free


def deploy():
    """Deploy code."""
    deploy_handler.deploy()


def status():
    """Run checks."""
    status_elasticsearch.status()
    status_memory_free.status()
