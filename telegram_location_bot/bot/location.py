"""Location lookup utilities using geocoding APIs."""
import requests
import logging
from typing import Tuple, Optional

# Use Nominatim (OpenStreetMap) for geocoding
GEOCODE_URL = "https://nominatim.openstreetmap.org/search"
REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
HEADERS = {"User-Agent": "TelegramLocationBot/1.0"}

def geocode_address(query: str) -> Optional[Tuple[float, float, str]]:
    """Geocode an address or place name to latitude, longitude, and address string.
    Returns (lat, lon, address) or None if not found."""
    try:
        params = {
            "q": query,
            "format": "json",
            "limit": 1,
            "addressdetails": 0
        }
        resp = requests.get(GEOCODE_URL, params=params, headers=HEADERS, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        if not data:
            return None
        result = data[0] if isinstance(data, list) else data
        lat = float(result.get("lat"))
        lon = float(result.get("lon"))
        address = result.get("display_name", "").strip()
        return lat, lon, address
    except Exception as e:
        logging.error(f"Geocoding error: {e}")
        return None

def reverse_geocode(latitude: float, longitude: float) -> Optional[str]:
    """Reverse geocode coordinates to an address string. Returns address or None."""
    try:
        params = {
            "lat": str(latitude),
            "lon": str(longitude),
            "format": "json"
        }
        resp = requests.get(REVERSE_URL, params=params, headers=HEADERS, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        if not data:
            return None
        address = data.get("display_name", "").strip()
        return address if address else None
    except Exception as e:
        logging.error(f"Reverse geocoding error: {e}")
        return None
