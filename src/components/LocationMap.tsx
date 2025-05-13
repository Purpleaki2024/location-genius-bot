
import { useEffect, useRef } from "react";

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  type: string;
}

interface LocationMapProps {
  locations?: Location[];
  height?: string;
}

const LocationMap = ({ locations = [], height = "400px" }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // This would be replaced with actual map integration (like Google Maps, Mapbox, Leaflet)
  // For now, we'll create a placeholder map UI
  useEffect(() => {
    if (!mapRef.current) return;
    
    const renderPlaceholderMap = () => {
      const mapElement = mapRef.current;
      if (!mapElement) return;
      
      // Style the map container
      mapElement.style.position = 'relative';
      mapElement.style.overflow = 'hidden';
      mapElement.style.borderRadius = '0.5rem';
      mapElement.innerHTML = '';
      
      // Create map background
      const grid = document.createElement('div');
      grid.style.position = 'absolute';
      grid.style.inset = '0';
      grid.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)';
      grid.style.backgroundSize = '20px 20px';
      grid.style.backgroundColor = '#f8fafc';
      
      // Add some fake map features
      const water = document.createElement('div');
      water.style.position = 'absolute';
      water.style.left = '20%';
      water.style.top = '30%';
      water.style.width = '40%';
      water.style.height = '25%';
      water.style.backgroundColor = '#B3E5FC';
      water.style.borderRadius = '40%';
      
      const park = document.createElement('div');
      park.style.position = 'absolute';
      park.style.left = '65%';
      park.style.top = '15%';
      park.style.width = '20%';
      park.style.height = '25%';
      park.style.backgroundColor = '#C8E6C9';
      park.style.borderRadius = '50%';
      
      // Add road
      const road = document.createElement('div');
      road.style.position = 'absolute';
      road.style.left = '10%';
      road.style.top = '50%';
      road.style.width = '80%';
      road.style.height = '10px';
      road.style.backgroundColor = '#E0E0E0';
      road.style.transform = 'translateY(-50%)';
      
      // Add place markers for each location
      locations.forEach((loc, index) => {
        // Position markers at pseudorandom positions for demo
        const marker = document.createElement('div');
        marker.style.position = 'absolute';
        marker.style.left = `${25 + (index * 15) % 65}%`;
        marker.style.top = `${20 + (index * 17) % 60}%`;
        marker.style.width = '20px';
        marker.style.height = '20px';
        marker.style.backgroundColor = '#FF5252';
        marker.style.borderRadius = '50%';
        marker.style.transform = 'translate(-50%, -50%)';
        marker.style.boxShadow = '0 0 0 5px rgba(255, 82, 82, 0.2)';
        
        // Create a tooltip
        marker.title = `${loc.name} (Rating: ${loc.rating}/5)`;
        marker.style.cursor = 'pointer';
        
        // Simple pulse animation
        marker.style.animation = 'pulse-slow 2s infinite';
        
        mapElement.appendChild(marker);
      });
      
      // Append all elements
      mapElement.appendChild(grid);
      mapElement.appendChild(water);
      mapElement.appendChild(park);
      mapElement.appendChild(road);
      
      // Add map controls
      const controls = document.createElement('div');
      controls.style.position = 'absolute';
      controls.style.top = '10px';
      controls.style.right = '10px';
      controls.style.display = 'flex';
      controls.style.flexDirection = 'column';
      controls.style.gap = '5px';
      
      const zoomIn = document.createElement('button');
      zoomIn.innerHTML = '➕';
      zoomIn.className = 'bg-background border border-input rounded-md w-8 h-8 flex items-center justify-center';
      
      const zoomOut = document.createElement('button');
      zoomOut.innerHTML = '➖';
      zoomOut.className = 'bg-background border border-input rounded-md w-8 h-8 flex items-center justify-center';
      
      controls.appendChild(zoomIn);
      controls.appendChild(zoomOut);
      mapElement.appendChild(controls);
      
      // Add map attribution
      const attribution = document.createElement('div');
      attribution.innerText = 'Map placeholder | Actual map integration would go here';
      attribution.style.position = 'absolute';
      attribution.style.bottom = '5px';
      attribution.style.right = '5px';
      attribution.style.fontSize = '10px';
      attribution.style.color = '#666';
      attribution.style.padding = '2px 5px';
      attribution.style.backgroundColor = 'rgba(255,255,255,0.7)';
      attribution.style.borderRadius = '3px';
      mapElement.appendChild(attribution);
    };
    
    renderPlaceholderMap();
  }, [locations]);

  return (
    <div 
      ref={mapRef} 
      className="w-full border border-border rounded-lg overflow-hidden bg-muted/30"
      style={{ height }}
    >
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
};

export default LocationMap;
