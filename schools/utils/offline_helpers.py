"""
Helper functions for offline-first operations in views
"""
from django.contrib import messages
from schools.utils.network import is_online
from schools.utils.sync import sync_service
from schools.models import SyncQueue
import logging

logger = logging.getLogger(__name__)


def save_with_offline_support(model_instance, operation_type='UPDATE', user=None, request=None):
    """
    Save a model instance with offline support.
    If offline, queues the operation for later sync.
    
    Args:
        model_instance: The model instance to save
        operation_type: 'CREATE' or 'UPDATE'
        user: User performing the operation
        request: Request object (for messages)
    
    Returns:
        tuple: (saved_instance, was_queued)
    """
    online = is_online()
    
    try:
        # Save locally first (always)
        model_instance.save()
        
        # If offline, queue for sync
        if not online:
            try:
                sync_service.queue_operation(
                    operation_type=operation_type,
                    model_instance=model_instance,
                    user=user
                )
                
                if request:
                    messages.info(
                        request,
                        f'Changes saved locally. Will sync when connection is restored.'
                    )
                
                return model_instance, True
            except Exception as e:
                logger.error(f"Error queueing operation: {str(e)}")
                if request:
                    messages.warning(
                        request,
                        'Changes saved locally, but could not queue for sync. Please sync manually later.'
                    )
        
        return model_instance, False
        
    except Exception as e:
        logger.error(f"Error saving model: {str(e)}")
        raise


def delete_with_offline_support(model_instance, user=None, request=None):
    """
    Delete a model instance with offline support.
    If offline, queues the deletion for later sync.
    
    Args:
        model_instance: The model instance to delete
        user: User performing the operation
        request: Request object (for messages)
    
    Returns:
        bool: True if successful
    """
    online = is_online()
    model_id = model_instance.pk
    
    try:
        # Queue deletion before deleting (so we have the data)
        if not online:
            try:
                sync_service.queue_operation(
                    operation_type='DELETE',
                    model_instance=model_instance,
                    user=user
                )
            except Exception as e:
                logger.error(f"Error queueing deletion: {str(e)}")
        
        # Delete locally
        model_instance.delete()
        
        if not online and request:
            messages.info(
                request,
                'Item deleted locally. Deletion will sync when connection is restored.'
            )
        
        return True
        
    except Exception as e:
        logger.error(f"Error deleting model: {str(e)}")
        raise


def get_sync_status_context():
    """
    Get sync status for use in templates.
    
    Returns:
        dict: Context variables for sync status
    """
    from schools.utils.sync import sync_service
    from schools.utils.network import is_online
    
    stats = sync_service.get_sync_statistics()
    
    return {
        'is_online': stats['is_online'],
        'sync_pending': stats['pending'],
        'sync_failed': stats['failed'],
        'last_sync': stats['last_sync'],
        'auto_sync_enabled': stats['auto_sync_enabled'],
    }

