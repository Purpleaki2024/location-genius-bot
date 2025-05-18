
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
import { MoreHorizontal, Edit, Star, Trash2, Trash, Phone, Info, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Location {
  id: string;
  name: string;
  address: string;
  type: string;
  rating: number;
  lat: number;
  lng: number;
  visits: number;
  code?: string;
  postcode?: string;
  contact?: string;
  info?: string;
  password?: string;
  country?: string;
}

const mockLocations: Location[] = [
  {
    id: "1",
    name: "London",
    address: "UK",
    type: "city",
    rating: 4.7,
    lat: 51.5074,
    lng: -0.1278,
    visits: 1245,
    code: "1",
    postcode: "SW1",
    contact: "+44 7123 456789",
    info: "Available 24/7",
    password: "London",
    country: "UK"
  },
  {
    id: "2",
    name: "Manchester",
    address: "UK",
    type: "city",
    rating: 4.5,
    lat: 53.4808,
    lng: -2.2426,
    visits: 987,
    code: "2",
    postcode: "M1",
    contact: "+44 7234 567890",
    info: "Available Mon-Fri",
    password: "Manchester",
    country: "UK"
  },
  {
    id: "3",
    name: "Birmingham",
    address: "UK",
    type: "city",
    rating: 4.3,
    lat: 52.4862,
    lng: -1.8904,
    visits: 876,
    code: "3",
    postcode: "B1",
    contact: "+44 7345 678901",
    info: "Cash only",
    password: "Birmingham",
    country: "UK"
  },
  {
    id: "4",
    name: "New York",
    address: "USA",
    type: "city",
    rating: 4.8,
    lat: 40.7128,
    lng: -74.0060,
    visits: 3240,
    code: "101",
    postcode: "NY10001",
    contact: "+1 212 555 1234",
    info: "24/7 service",
    password: "NewYork",
    country: "USA"
  },
  {
    id: "5",
    name: "Tokyo",
    address: "Japan",
    type: "city",
    rating: 4.9,
    lat: 35.6762,
    lng: 139.6503,
    visits: 1872,
    code: "201",
    postcode: "100-0001",
    contact: "+81 3 5555 1234",
    info: "Japanese speakers only",
    password: "Tokyo",
    country: "Japan"
  },
];

const LocationTable = () => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const isMobile = useIsMobile();

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
      case 'city':
        return <Badge className="bg-slate-500">City</Badge>;
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
    toast.success("Location deleted successfully");
  };

  const editLocation = (locationId: string) => {
    toast.info(`Editing location ${locationId}`);
  };

  const resetToTestData = () => {
    setLocations(mockLocations);
    toast.success("Reset to test locations successfully");
  };

  // Responsive view for mobile
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Location Database</h2>
          <Button 
            variant="outline" 
            onClick={resetToTestData}
            className="flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            Reset
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">Manage the locations that users can query</p>
        
        <div className="mobile-card-table">
          {locations.map(location => (
            <div key={location.id} className="mobile-card-row shadow-sm">
              <div className="mobile-card-row-header">
                <div className="font-medium">{location.name}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => editLocation(location.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteLocation(location.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Code</div>
                  <div>{location.code}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Postcode</div>
                  <div>{location.postcode}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Country</div>
                  <div>{location.country || location.address}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Contact</div>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                    {location.contact}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground text-xs">Info</div>
                  <div className="flex items-center">
                    <Info className="h-3 w-3 mr-1 text-muted-foreground" />
                    {location.info}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Password</div>
                  <div>{location.password}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-muted-foreground text-sm mt-4">
          Total locations: {locations.length}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={resetToTestData}
          className="flex items-center gap-2"
        >
          <Trash className="h-4 w-4" />
          Reset to Test Locations
        </Button>
      </div>
      
      <div className="border border-border rounded-lg responsive-table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Postcode</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Info</TableHead>
              <TableHead>Password</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map(location => (
              <TableRow key={location.id}>
                <TableCell>{location.code}</TableCell>
                <TableCell className="font-medium">
                  {location.name}
                  <div className="text-xs text-muted-foreground">{location.country || location.address}</div>
                </TableCell>
                <TableCell>{location.postcode}</TableCell>
                <TableCell>{location.contact}</TableCell>
                <TableCell>{location.info}</TableCell>
                <TableCell>{location.password}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => editLocation(location.id)}>
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
      
      <div className="text-muted-foreground text-sm">
        Total locations: {locations.length}
      </div>
    </div>
  );
};

export default LocationTable;
