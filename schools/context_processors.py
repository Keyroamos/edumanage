"""
Context processors for the schools app
"""
from schools.utils.offline_helpers import get_sync_status_context


def sync_status(request):
    """
    Add sync status information to template context.
    """
    return get_sync_status_context()

