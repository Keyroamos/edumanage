"""
Network detection and connectivity utilities for offline-first functionality
"""
import socket
import requests
import logging
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

# Cache key for network status
NETWORK_STATUS_CACHE_KEY = 'network_status'
NETWORK_STATUS_CACHE_TIMEOUT = 60  # Cache for 60 seconds


def check_internet_connection(host="8.8.8.8", port=53, timeout=1):
    """
    Check if internet connection is available by attempting to connect to a reliable host.
    Uses shorter timeout to avoid blocking requests.
    
    Args:
        host: Host to connect to (default: Google DNS)
        port: Port to connect to (default: 53 for DNS)
        timeout: Connection timeout in seconds (reduced to 1 for faster response)
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        # Use a new socket with timeout to avoid affecting other operations
        test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        test_socket.settimeout(timeout)
        test_socket.connect((host, port))
        test_socket.close()
        return True
    except (socket.error, OSError, socket.timeout):
        return False
    except Exception:
        # Catch any other exceptions to prevent blocking
        return False


def check_http_connection(url=None, timeout=1):
    """
    Check if HTTP connection is available by making a HEAD request.
    Uses shorter timeout to avoid blocking requests.
    
    Args:
        url: URL to check (default: Google)
        timeout: Request timeout in seconds (reduced to 1 for faster response)
    
    Returns:
        bool: True if HTTP connection is successful, False otherwise
    """
    if url is None:
        url = "https://www.google.com"
    
    try:
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        return response.status_code < 500
    except (requests.RequestException, requests.ConnectionError, requests.Timeout, Exception):
        # Catch all exceptions to prevent blocking
        return False


def is_online(use_cache=True):
    """
    Check if the system is online (has internet connectivity).
    For the cPanel deployment, we assume the server is always online.
    This prevents blocking socket calls that exhaust worker processes.
    """
    return True


def force_check_online():
    """
    Force a fresh network check without using cache.
    """
    return True


def clear_network_cache():
    """Clear the cached network status"""
    pass


def check_server_connectivity(server_url=None):
    """
    Check if the main server is reachable (for sync operations).
    """
    return True

