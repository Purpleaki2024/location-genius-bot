
import { useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const LocationsTabContent = () => {
  const navigate = useNavigate();
  
  const handleViewAllLocations = () => {
    navigate('/admin/locations');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Total Locations</h3>
          </div>
          <p className="text-2xl font-bold mt-1">842</p>
        </div>
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium">Active</h3>
          </div>
          <p className="text-2xl font-bold mt-1">789</p>
        </div>
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-medium">Pending</h3>
          </div>
          <p className="text-2xl font-bold mt-1">35</p>
        </div>
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium">New</h3>
          </div>
          <p className="text-2xl font-bold mt-1">18</p>
        </div>
      </div>
      
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Location Type Distribution</h3>
        <div className="space-y-2 mt-3">
          <div>
            <div className="flex justify-between text-sm">
              <span>Restaurants</span>
              <span>42%</span>
            </div>
            <Progress value={42} className="h-2 mt-1" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Hotels</span>
              <span>28%</span>
            </div>
            <Progress value={28} className="h-2 mt-1" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Attractions</span>
              <span>18%</span>
            </div>
            <Progress value={18} className="h-2 mt-1" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Shopping</span>
              <span>12%</span>
            </div>
            <Progress value={12} className="h-2 mt-1" />
          </div>
        </div>
        <Button 
          className="w-full mt-4" 
          size="sm"
          onClick={handleViewAllLocations}
        >
          View All Locations
        </Button>
      </div>
    </div>
  );
};

export default LocationsTabContent;
