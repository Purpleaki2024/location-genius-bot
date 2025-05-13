
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Star, Trash2 } from "lucide-react";

interface Location {
  id: string;
  name: string;
  address: string;
  type: string;
  rating: number;
  lat: number;
  lng: number;
  visits: number;
}

const mockLocations: Location[] = [
  {
    id: "1",
    name: "Central Park Café",
    address: "123 Park Ave",
    type: "restaurant",
    rating: 4.7,
    lat: 40.7812,
    lng: -73.9665,
    visits: 1245,
  },
  {
    id: "2",
    name: "Ocean View Hotel",
    address: "500 Beach Rd",
    type: "hotel",
    rating: 4.5,
    lat: 40.7609,
    lng: -73.9845,
    visits: 987,
  },
  {
    id: "3",
    name: "City Museum",
    address: "200 History St",
    type: "attraction",
    rating: 4.8,
    lat: 40.7789,
    lng: -73.9675,
    visits: 2456,
  },
  {
    id: "4",
    name: "Sunset Park",
    address: "300 Green Ave",
    type: "park",
    rating: 4.3,
    lat: 40.7645,
    lng: -73.9865,
    visits: 3240,
  },
  {
    id: "5",
    name: "Downtown Mall",
    address: "150 Shopping Blvd",
    type: "shopping",
    rating: 4.1,
    lat: 40.7512,
    lng: -73.9785,
    visits: 5632,
  },
];

const LocationTable = () => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <Badge className="bg-orange-500">Restaurant</Badge>;
      case 'hotel':
        return <Badge className="bg-blue-500">Hotel</Badge>;
      case 'attraction':
        return <Badge className="bg-purple-500">Attraction</Badge>;
      case 'park':
        return <Badge className="bg-green-500">Park</Badge>;
      case 'shopping':
        return <Badge className="bg-pink-500">Shopping</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  const deleteLocation = (locationId: string) => {
    setLocations(locations.filter(loc => loc.id !== locationId));
  };

  return (
    <div className="border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Visits</TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map(location => (
            <TableRow key={location.id}>
              <TableCell className="font-medium">{location.name}</TableCell>
              <TableCell className="max-w-[200px] truncate">{location.address}</TableCell>
              <TableCell>{getTypeBadge(location.type)}</TableCell>
              <TableCell>{renderRating(location.rating)}</TableCell>
              <TableCell className="text-right">{location.visits.toLocaleString()}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive" 
                      onClick={() => deleteLocation(location.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LocationTable;
