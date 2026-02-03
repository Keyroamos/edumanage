"""
Nominatim geocoding utilities (free alternative to Google Geocoding API)
"""
import requests
import logging
import time
from typing import Tuple, Optional, List, Dict

logger = logging.getLogger(__name__)

# Nominatim usage policy: max 1 request per second
_last_request_time = 0
_min_request_interval = 1.0  # 1 second between requests


def _rate_limit():
    """Respect Nominatim's rate limit (1 request per second)"""
    global _last_request_time
    current_time = time.time()
    time_since_last = current_time - _last_request_time
    
    if time_since_last < _min_request_interval:
        time.sleep(_min_request_interval - time_since_last)
    
    _last_request_time = time.time()


def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Geocode an address to get latitude and longitude using Nominatim.
    
    Args:
        address: Address string to geocode
    
    Returns:
        tuple: (latitude, longitude) or None if failed
    """
    if not address:
        return None
    
    _rate_limit()
    
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': address,
            'format': 'json',
            'limit': 1,
            'addressdetails': 1
        }
        headers = {
            'User-Agent': 'School Management System/1.0'  # Required by Nominatim
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data and len(data) > 0:
            result = data[0]
            lat = float(result['lat'])
            lon = float(result['lon'])
            return (lat, lon)
        else:
            logger.warning(f"No results found for address: {address}")
            return None
            
    except Exception as e:
        logger.error(f"Error geocoding address {address}: {str(e)}")
        return None


def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    """
    Reverse geocode coordinates to get address using Nominatim.
    
    Args:
        lat: Latitude
        lng: Longitude
    
    Returns:
        str: Formatted address or None if failed
    """
    _rate_limit()
    
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            'lat': lat,
            'lon': lng,
            'format': 'json',
            'addressdetails': 1
        }
        headers = {
            'User-Agent': 'School Management System/1.0'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data and 'display_name' in data:
            return data['display_name']
        else:
            logger.warning(f"No address found for coordinates: {lat}, {lng}")
            return None
            
    except Exception as e:
        logger.error(f"Error reverse geocoding: {str(e)}")
        return None


def search_addresses(query: str, limit: int = 5) -> List[Dict]:
    """
    Search for addresses using Nominatim (for autocomplete).
    
    Args:
        query: Search query
        limit: Maximum number of results
    
    Returns:
        list: List of address results with lat, lon, and display_name
    """
    if not query or len(query) < 3:
        return []
    
    _rate_limit()
    
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': query,
            'format': 'json',
            'limit': limit,
            'addressdetails': 1
        }
        headers = {
            'User-Agent': 'School Management System/1.0'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data:
            results.append({
                'lat': float(item['lat']),
                'lon': float(item['lon']),
                'display_name': item.get('display_name', ''),
                'address': item.get('address', {})
            })
        
        return results
        
    except Exception as e:
        logger.error(f"Error searching addresses: {str(e)}")
        return []

