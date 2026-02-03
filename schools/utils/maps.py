"""
Map utilities for route management and geocoding
Uses Google Maps API
"""
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

GOOGLE_MAPS_API_KEY = getattr(settings, 'GOOGLE_MAPS_API_KEY', '')
GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json"


def geocode_address(address):
    """
    Geocode an address to get latitude and longitude using Google Maps Geocoding API.
    
    Args:
        address: Address string to geocode
    
    Returns:
        tuple: (latitude, longitude) or (None, None) if failed
    """
    if not GOOGLE_MAPS_API_KEY:
        logger.warning("Google Maps API key not configured")
        return None, None
    
    try:
        params = {
            'address': address,
            'key': GOOGLE_MAPS_API_KEY
        }
        response = requests.get(GEOCODE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') == 'OK' and data.get('results'):
            location = data['results'][0]['geometry']['location']
            return float(location['lat']), float(location['lng'])
        else:
            logger.warning(f"Google Geocoding failed for address: {address}, status: {data.get('status')}")
            return None, None
    except requests.exceptions.RequestException as e:
        logger.error(f"Error during Google Geocoding for {address}: {e}")
        return None, None
    except Exception as e:
        logger.error(f"Unexpected error during geocoding: {e}")
        return None, None


def get_directions(origin, destination, waypoints=None):
    """
    Get directions from origin to destination with optional waypoints using Google Directions API.
    
    Args:
        origin: Origin coordinates as (lat, lng) tuple or string "lat,lng"
        destination: Destination coordinates as (lat, lng) tuple or string "lat,lng"
        waypoints: List of waypoint coordinates as (lat, lng) tuples
    
    Returns:
        dict: Directions data with route geometry or None if failed
    """
    if not GOOGLE_MAPS_API_KEY:
        logger.warning("Google Maps API key not configured")
        return None
    
    try:
        # Format coordinates
        def format_coord(coord):
            if isinstance(coord, tuple):
                return f"{coord[0]},{coord[1]}"  # lat,lng
            elif isinstance(coord, str):
                return coord
            return str(coord)
        
        params = {
            'origin': format_coord(origin),
            'destination': format_coord(destination),
            'key': GOOGLE_MAPS_API_KEY,
            'mode': 'driving'
        }
        
        if waypoints:
            waypoint_str = '|'.join([format_coord(wp) for wp in waypoints])
            params['waypoints'] = waypoint_str
        
        response = requests.get(DIRECTIONS_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') == 'OK' and data.get('routes'):
            route = data['routes'][0]
            leg = route['legs'][0]
            
            return {
                'status': 'OK',
                'routes': [{
                    'legs': [{
                        'distance': leg.get('distance', {}),
                        'duration': leg.get('duration', {}),
                        'steps': leg.get('steps', [])
                    }],
                    'overview_polyline': route.get('overview_polyline', {}),
                    'distance': leg.get('distance', {}).get('value', 0),
                    'duration': leg.get('duration', {}).get('value', 0)
                }]
            }
        else:
            logger.warning(f"Google Directions failed, status: {data.get('status')}")
            return None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error getting directions: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error getting directions: {e}")
        return None


def reverse_geocode(lat, lng):
    """
    Reverse geocode coordinates to get address using Google Maps Geocoding API.
    
    Args:
        lat: Latitude
        lng: Longitude
    
    Returns:
        str: Formatted address or None if failed
    """
    if not GOOGLE_MAPS_API_KEY:
        logger.warning("Google Maps API key not configured")
        return None
    
    try:
        params = {
            'latlng': f"{lat},{lng}",
            'key': GOOGLE_MAPS_API_KEY
        }
        response = requests.get(GEOCODE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') == 'OK' and data.get('results'):
            return data['results'][0]['formatted_address']
        else:
            logger.warning(f"Google Reverse Geocoding failed for {lat},{lng}, status: {data.get('status')}")
            return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Error during reverse geocoding for {lat},{lng}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during reverse geocoding: {e}")
        return None
