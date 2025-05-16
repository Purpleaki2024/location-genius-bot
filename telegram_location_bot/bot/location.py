
"""Module for handling location-related functionality."""
import requests
import logging
from typing import Tuple, Optional

# For demo purposes, we'll use a free geocoding service
# In a production environment, you would use a more reliable service with an API key
GEOCODE_API_URL = "https://nominatim.openstreetmap.org/search"
REVERSE_GEOCODE_API_URL = "https://nominatim.openstreetmap.org/reverse"

def geocode_address(address: str) -> Optional[Tuple[float, float, str]]:
    """
    Convert an address to latitude, longitude, and formatted address.
    
    Args:
        address: The address to geocode
        
    Returns:
        Tuple of (latitude, longitude, formatted_address) or None if not found
    """
    try:
        params = {
            'q': address,
            'format': 'json',
            'limit': 1,
        }
        headers = {
            'User-Agent': 'TeleLocatorBot/1.0',  # Nominatim requires a user agent
        }
        
        response = requests.get(GEOCODE_API_URL, params=params, headers=headers, timeout=5)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        
        results = response.json()
        
        if not results:
            return None
            
        result = results[0]
        lat = float(result['lat'])
        lon = float(result['lon'])
        formatted_address = result.get('display_name', address)
        
        return (lat, lon, formatted_address)
    except Exception as e:
        logging.error(f"Geocoding error: {e}")
        return None

def reverse_geocode(lat: float, lon: float) -> Optional[str]:
    """
    Convert latitude and longitude to an address.
    
    Args:
        lat: Latitude
        lon: Longitude
        
    Returns:
        Formatted address string or None if not found
    """
    try:
        params = {
            'lat': lat,
            'lon': lon,
            'format': 'json',
        }
        headers = {
            'User-Agent': 'TeleLocatorBot/1.0',  # Nominatim requires a user agent
        }
        
        response = requests.get(REVERSE_GEOCODE_API_URL, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        
        result = response.json()
        
        if not result or 'display_name' not in result:
            return None
            
        return result['display_name']
    except Exception as e:
        logging.error(f"Reverse geocoding error: {e}")
        return None
