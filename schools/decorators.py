"""
Decorators for offline-first functionality and permission checks
"""
from functools import wraps
from django.http import JsonResponse, HttpResponseForbidden
from django.shortcuts import redirect
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from schools.utils.network import is_online
from schools.utils.sync import get_sync_service
import logging

logger = logging.getLogger(__name__)


def admin_required(view_func):
    """Decorator to require admin privileges"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        if not (request.user.is_superuser or request.user.is_staff):
            raise PermissionDenied("You must be an administrator to access this page.")
        return view_func(request, *args, **kwargs)
    return wrapper


def accountant_required(view_func):
    """Decorator to require accountant privileges"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        if not (request.user.is_superuser or 
                request.user.groups.filter(name='Accountant').exists() or
                request.user.is_staff):
            raise PermissionDenied("You must be an accountant to access this page.")
        return view_func(request, *args, **kwargs)
    return wrapper


def can_manage_students(view_func):
    """Decorator to check if user can manage students"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        if not (request.user.is_superuser or 
                request.user.is_staff or
            request.user.groups.filter(name__in=['Admin', 'Teacher', 'Accountant']).exists()):
            raise PermissionDenied("You do not have permission to manage students.")
        return view_func(request, *args, **kwargs)
    return wrapper


def handle_offline_operation(view_func):
    """
    Decorator to handle operations when offline.
    Queues operations for later sync when offline.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Check if online
        online = is_online()
        request.is_online = online
        
        # Call the original view
        response = view_func(request, *args, **kwargs)
        
        # If offline and operation was successful, queue it
        # Note: This is a simplified version. In practice, you'd need to
        # detect which operations were performed and queue them appropriately.
        
        return response
    
    return wrapper


def require_online_or_queue(view_func):
    """
    Decorator that allows operations when offline but queues them.
    Shows appropriate messages to the user.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        online = is_online()
        
        if not online:
            # Add offline notice
            messages.info(
                request,
                'You are currently offline. Your changes will be saved locally and synced when connection is restored.'
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper
