
import Header from "@/components/Header";
import LocationTable from "@/components/LocationTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Download, Filter, List } from "lucide-react";

// Sample location data
const locationData = [
  {
    id: "1",
    name: "Central Park Café",
    lat: 40.7812,
    lng: -73.9665,
    rating: 4.7,
    type: "restaurant"
  },
  {
    id: "2",
    name: "Ocean View Hotel",
    lat: 40.7609,
    lng: -73.9845,
    rating: 4.5,
    type: "hotel"
  },
  {
    id: "3",
    name: "City Museum",
    lat: 40.7789,
    lng: -73.9675,
    rating: 4.8,
    type: "attraction"
  },
  {
    id: "4",
    name: "Sunset Park",
    lat: 40.7645,
    lng: -73.9865,
    rating: 4.3,
    type: "park"
  },
  {
    id: "5",
    name: "Downtown Mall",
    lat: 40.7512,
    lng: -73.9785,
    rating: 4.1,
    type: "shopping"
  }
];

const Locations = () => {
  return (
    <div className="space-y-6 p-6">
      <Header title="Location Management" />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search locations..."
              className="max-w-sm"
            />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center space-x-2">            
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="attraction">Attraction</SelectItem>
                <SelectItem value="park">Park</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <LocationTable />
        </div>
        
        <div className="mt-4 bg-muted/50 p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            To add a new location, click on the "Add Location" button.
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 5 of 842 locations
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Locations;
