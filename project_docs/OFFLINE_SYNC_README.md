# Offline-First System Documentation

This system has been enhanced with offline-first capabilities, allowing it to operate locally without internet and automatically sync data when connection is restored.

## Features

- **Local Operation**: System works completely offline, saving all data locally
- **Automatic Sync**: When internet connection is restored, data is automatically synced
- **Queue Management**: All operations are queued when offline and processed when online
- **Status Indicators**: Visual indicators show sync status and pending operations
- **Manual Sync**: Option to manually trigger sync operations

## Components

### 1. Models

- **SyncQueue**: Tracks operations that need to be synced (CREATE, UPDATE, DELETE)
- **SyncStatus**: Tracks overall sync status and settings

### 2. Utilities

- **network.py**: Network detection and connectivity checking
- **sync.py**: Data synchronization service
- **offline_helpers.py**: Helper functions for views to use offline mode

### 3. Middleware

- **OfflineDetectionMiddleware**: Automatically detects network status on each request

### 4. Management Command

- **sync_data**: Command to manually or automatically sync pending operations

## Usage

### In Views

To make a view work offline, use the helper functions:

```python
from schools.utils.offline_helpers import save_with_offline_support, delete_with_offline_support

# When saving a model
def student_create(request):
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            student = form.save(commit=False)
            # Use offline helper instead of direct save
            student, was_queued = save_with_offline_support(
                student, 
                operation_type='CREATE',
                user=request.user,
                request=request
            )
            messages.success(request, 'Student created successfully')
            return redirect('student_list')
```

### Manual Sync

Run the management command to sync pending operations:

```bash
# Sync all pending operations
python manage.py sync_data

# Sync with limit
python manage.py sync_data --max-items 10

# Retry failed operations
python manage.py sync_data --retry-failed

# Continuous sync (checks every 5 minutes)
python manage.py sync_data --continuous --interval 300
```

### Automatic Sync

The system can automatically sync when online. To enable:

1. Set up a cron job or scheduled task to run:
   ```bash
   python manage.py sync_data --continuous --interval 300
   ```

2. Or use Django's background task system (Celery, etc.)

### Sync Status

View sync status at: `/sync/status/`

Or check via API: `/sync/status/api/`

## Configuration

### Settings

Add to `settings.py`:

```python
# Optional: Configure sync server URL (if syncing to remote server)
SYNC_SERVER_URL = 'https://your-sync-server.com/api/sync/'
SYNC_API_TOKEN = 'your-api-token-here'
```

### Middleware

The middleware is already added to `MIDDLEWARE` in settings.py.

### Context Processor

The sync status context processor is already added to `TEMPLATES` context processors.

## How It Works

1. **Offline Detection**: Middleware checks network status on each request
2. **Local Save**: All operations save to local database immediately
3. **Queue Operation**: If offline, operation is queued in SyncQueue
4. **Auto Sync**: When online, queued operations are automatically synced
5. **Status Update**: UI shows current sync status and pending count

## Sync Queue Status

- **PENDING**: Waiting to be synced
- **SYNCING**: Currently being synced
- **SYNCED**: Successfully synced
- **FAILED**: Sync failed (will retry up to max attempts)

## Notes

- The current implementation syncs locally (marks as synced). 
- To sync to a remote server, modify `_sync_item()` in `schools/utils/sync.py` to make HTTP requests to your sync API.
- All data is always saved locally first, ensuring no data loss.
- The system gracefully handles network interruptions.

## Troubleshooting

### Sync not working

1. Check network status: Look for the sync indicator in the UI
2. Check sync queue: Visit `/sync/status/` to see pending items
3. Run manual sync: `python manage.py sync_data`
4. Check logs: Look for sync errors in Django logs

### Operations not queuing

1. Ensure middleware is enabled
2. Check that views are using `save_with_offline_support()` or `delete_with_offline_support()`
3. Verify SyncQueue model is properly migrated

## Future Enhancements

- Conflict resolution for concurrent edits
- Bi-directional sync (pull changes from server)
- Selective sync (sync only specific models)
- Sync compression for large datasets
- Background sync service

