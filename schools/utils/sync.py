"""
Data synchronization service for offline-first functionality
"""
import json
import logging
from django.db import transaction
from django.core import serializers
from django.contrib.contenttypes.models import ContentType
from django.apps import apps
from django.utils import timezone
from schools.models import SyncQueue, SyncStatus
from schools.utils.network import is_online, check_server_connectivity

logger = logging.getLogger(__name__)


class SyncService:
    """Service class for handling data synchronization"""
    
    def __init__(self):
        self.sync_status = SyncStatus.get_instance()
    
    def queue_operation(self, operation_type, model_instance, user=None, notes=''):
        """
        Queue an operation for later synchronization.
        
        Args:
            operation_type: 'CREATE', 'UPDATE', or 'DELETE'
            model_instance: The model instance to sync
            user: User who performed the operation
            notes: Additional notes
        
        Returns:
            SyncQueue: The created queue item
        """
        try:
            model_name = model_instance.__class__.__name__
            model_id = model_instance.pk
            
            # Serialize the model instance
            serialized_data = serializers.serialize('json', [model_instance])
            data = json.loads(serialized_data)[0]
            
            # Create queue item
            queue_item = SyncQueue.objects.create(
                operation_type=operation_type,
                model_name=model_name,
                model_id=model_id,
                local_id=model_id,
                data=data,
                user=user,
                notes=notes,
                status='PENDING'
            )
            
            # Update sync status counts
            self.sync_status.update_counts()
            
            logger.info(f"Queued {operation_type} operation for {model_name} #{model_id}")
            return queue_item
            
        except Exception as e:
            logger.error(f"Error queueing operation: {str(e)}")
            raise
    
    def sync_pending_operations(self, max_items=None, force=False):
        """
        Sync all pending operations to the server.
        
        Args:
            max_items: Maximum number of items to sync in this batch (None for all)
            force: Force sync even if offline (not recommended)
        
        Returns:
            dict: Results with counts of synced, failed items
        """
        if not force and not is_online():
            logger.info("System is offline, skipping sync")
            return {
                'synced': 0,
                'failed': 0,
                'skipped': 0,
                'online': False
            }
        
        # Update sync status
        self.sync_status.is_online = True
        self.sync_status.last_sync_attempt = timezone.now()
        self.sync_status.save()
        
        # Get pending items
        pending_items = SyncQueue.objects.filter(status='PENDING').order_by('created_at')
        
        if max_items:
            pending_items = pending_items[:max_items]
        
        synced_count = 0
        failed_count = 0
        
        for item in pending_items:
            try:
                item.status = 'SYNCING'
                item.save(update_fields=['status'])
                
                # Attempt to sync
                success = self._sync_item(item)
                
                if success:
                    item.mark_synced()
                    synced_count += 1
                    logger.info(f"Successfully synced {item}")
                else:
                    if item.retry_count < self.sync_status.max_retry_attempts:
                        item.reset_for_retry()
                    else:
                        item.mark_failed("Max retry attempts reached")
                    failed_count += 1
                    logger.warning(f"Failed to sync {item}")
                    
            except Exception as e:
                error_msg = str(e)
                if item.retry_count < self.sync_status.max_retry_attempts:
                    item.reset_for_retry()
                else:
                    item.mark_failed(error_msg)
                failed_count += 1
                logger.error(f"Error syncing {item}: {error_msg}")
        
        # Update sync status
        self.sync_status.last_successful_sync = timezone.now() if synced_count > 0 else self.sync_status.last_successful_sync
        self.sync_status.update_counts()
        self.sync_status.save()
        
        return {
            'synced': synced_count,
            'failed': failed_count,
            'skipped': 0,
            'online': True
        }
    
    def _sync_item(self, queue_item):
        """
        Sync a single queue item to the server.
        
        This is a placeholder implementation. In a real scenario, you would:
        1. Send data to a remote API endpoint
        2. Handle authentication
        3. Handle conflicts
        4. Update local data with server response
        
        Args:
            queue_item: SyncQueue instance to sync
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # For now, we'll implement a local-only sync that marks items as synced
            # In production, you would make an HTTP request to your sync server
            
            # Example implementation:
            # import requests
            # from django.conf import settings
            # 
            # sync_url = getattr(settings, 'SYNC_SERVER_URL', None)
            # if not sync_url:
            #     # If no sync server configured, just mark as synced locally
            #     return True
            # 
            # response = requests.post(
            #     f"{sync_url}/api/sync/",
            #     json={
            #         'operation': queue_item.operation_type,
            #         'model': queue_item.model_name,
            #         'data': queue_item.data
            #     },
            #     headers={'Authorization': f'Token {settings.SYNC_API_TOKEN}'},
            #     timeout=10
            # )
            # 
            # if response.status_code == 200:
            #     return True
            # else:
            #     return False
            
            # For now, simulate successful sync
            # In a real implementation, you would connect to your remote server
            logger.info(f"Syncing {queue_item.operation_type} for {queue_item.model_name} #{queue_item.model_id}")
            
            # Simulate network delay
            import time
            time.sleep(0.1)
            
            # For local-only operation, we'll mark as synced
            # In production, replace this with actual API call
            return True
            
        except Exception as e:
            logger.error(f"Error in _sync_item: {str(e)}")
            return False
    
    def retry_failed_operations(self, max_items=None):
        """
        Retry failed sync operations.
        
        Args:
            max_items: Maximum number of items to retry
        
        Returns:
            dict: Results with counts
        """
        failed_items = SyncQueue.objects.filter(
            status='FAILED',
            retry_count__lt=self.sync_status.max_retry_attempts
        ).order_by('created_at')
        
        if max_items:
            failed_items = failed_items[:max_items]
        
        # Reset status to pending for retry
        for item in failed_items:
            item.reset_for_retry()
        
        # Now sync them
        return self.sync_pending_operations(max_items=max_items)
    
    def get_sync_statistics(self):
        """
        Get current sync statistics.
        
        Returns:
            dict: Statistics about sync queue
        """
        self.sync_status.update_counts()
        
        return {
            'pending': self.sync_status.pending_count,
            'failed': self.sync_status.failed_count,
            'syncing': SyncQueue.objects.filter(status='SYNCING').count(),
            'is_online': is_online(),
            'last_sync': self.sync_status.last_successful_sync,
            'auto_sync_enabled': self.sync_status.auto_sync_enabled,
        }


# Global sync service instance (lazy-loaded)
_sync_service_instance = None

def get_sync_service():
    """Get or create the global sync service instance"""
    global _sync_service_instance
    if _sync_service_instance is None:
        try:
            _sync_service_instance = SyncService()
        except Exception:
            # If database tables don't exist yet (during migrations), return a dummy service
            class DummySyncService:
                def queue_operation(self, *args, **kwargs):
                    pass
                def sync_pending_operations(self, *args, **kwargs):
                    return {'synced': 0, 'failed': 0, 'skipped': 0, 'online': False}
                def get_sync_statistics(self):
                    return {'pending': 0, 'failed': 0, 'syncing': 0, 'is_online': False, 'last_sync': None, 'auto_sync_enabled': True}
                def retry_failed_operations(self, *args, **kwargs):
                    return {'synced': 0, 'failed': 0, 'skipped': 0, 'online': False}
            _sync_service_instance = DummySyncService()
    return _sync_service_instance

# For backward compatibility - use a class that acts like an instance
class SyncServiceProxy:
    """Proxy class that provides sync_service as an instance"""
    def queue_operation(self, *args, **kwargs):
        return get_sync_service().queue_operation(*args, **kwargs)
    def sync_pending_operations(self, *args, **kwargs):
        return get_sync_service().sync_pending_operations(*args, **kwargs)
    def get_sync_statistics(self, *args, **kwargs):
        return get_sync_service().get_sync_statistics(*args, **kwargs)
    def retry_failed_operations(self, *args, **kwargs):
        return get_sync_service().retry_failed_operations(*args, **kwargs)

sync_service = SyncServiceProxy()

