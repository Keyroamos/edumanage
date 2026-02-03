"""
Management command to sync pending operations when online
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from schools.utils.sync import sync_service
from schools.utils.network import is_online
from schools.models import SyncStatus
import logging
import time

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Sync pending operations to the server when online'

    def add_arguments(self, parser):
        parser.add_argument(
            '--max-items',
            type=int,
            default=None,
            help='Maximum number of items to sync in this run',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force sync even if offline (not recommended)',
        )
        parser.add_argument(
            '--retry-failed',
            action='store_true',
            help='Retry failed operations',
        )
        parser.add_argument(
            '--continuous',
            action='store_true',
            help='Run continuously, checking for sync at intervals',
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=300,
            help='Interval in seconds between sync checks (default: 300 = 5 minutes)',
        )

    def handle(self, *args, **options):
        max_items = options.get('max_items')
        force = options.get('force', False)
        retry_failed = options.get('retry_failed', False)
        continuous = options.get('continuous', False)
        interval = options.get('interval', 300)
        
        sync_status = SyncStatus.get_instance()
        
        if continuous:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Starting continuous sync mode (checking every {interval} seconds)'
                )
            )
            
            while True:
                try:
                    self._perform_sync(max_items, force, retry_failed)
                    time.sleep(interval)
                except KeyboardInterrupt:
                    self.stdout.write(self.style.WARNING('\nStopped by user'))
                    break
                except Exception as e:
                    logger.error(f"Error in continuous sync: {str(e)}")
                    time.sleep(interval)
        else:
            self._perform_sync(max_items, force, retry_failed)
    
    def _perform_sync(self, max_items, force, retry_failed):
        """Perform the actual sync operation"""
        sync_status = SyncStatus.get_instance()
        
        # Check if online
        online = is_online()
        
        if not online and not force:
            self.stdout.write(
                self.style.WARNING('System is offline. Use --force to sync anyway.')
            )
            return
        
        # Update statistics
        stats = sync_service.get_sync_statistics()
        
        self.stdout.write(f"Sync Status:")
        self.stdout.write(f"  Online: {online}")
        self.stdout.write(f"  Pending: {stats['pending']}")
        self.stdout.write(f"  Failed: {stats['failed']}")
        
        if retry_failed:
            self.stdout.write("Retrying failed operations...")
            results = sync_service.retry_failed_operations(max_items=max_items)
        else:
            self.stdout.write("Syncing pending operations...")
            results = sync_service.sync_pending_operations(max_items=max_items, force=force)
        
        # Display results
        if results['synced'] > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully synced {results["synced"]} item(s)'
                )
            )
        
        if results['failed'] > 0:
            self.stdout.write(
                self.style.ERROR(
                    f'Failed to sync {results["failed"]} item(s)'
                )
            )
        
        if results['synced'] == 0 and results['failed'] == 0:
            self.stdout.write(
                self.style.SUCCESS('No pending operations to sync')
            )

