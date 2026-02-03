"""
Middleware for offline-first functionality
"""
import logging
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from schools.utils.network import is_online, force_check_online
from schools.models import SyncStatus

logger = logging.getLogger(__name__)

# Cache key for sync status update
SYNC_STATUS_UPDATE_CACHE_KEY = 'sync_status_last_update'
SYNC_STATUS_UPDATE_INTERVAL = 30  # Update sync status every 30 seconds max


class OfflineDetectionMiddleware(MiddlewareMixin):
    """
    Middleware to detect network status and update SyncStatus.
    Checks network connectivity on each request, but throttles database updates.
    """
    
    def process_request(self, request):
        """Check network status on each request"""
        try:
            # Check network status (use cache for performance)
            # This is fast and non-blocking
            online = is_online()
            
            # Add to request for use in views immediately
            request.is_online = online
            
            # Throttle database updates to avoid excessive writes
            # Only update SyncStatus every 30 seconds
            last_update = cache.get(SYNC_STATUS_UPDATE_CACHE_KEY)
            if last_update is None:
                try:
                    sync_status = SyncStatus.get_instance()
                    sync_status.is_online = online
                    sync_status.save(update_fields=['is_online'])
                    # Cache the update timestamp for 30 seconds
                    cache.set(SYNC_STATUS_UPDATE_CACHE_KEY, True, SYNC_STATUS_UPDATE_INTERVAL)
                except Exception as db_error:
                    # If database is not ready (during migrations), just log and continue
                    logger.debug(f"Could not update SyncStatus: {str(db_error)}")
            
        except Exception as e:
            logger.debug(f"Error in OfflineDetectionMiddleware: {str(e)}")
            # Default to offline on error, but don't block the request
            request.is_online = False
        
        return None

