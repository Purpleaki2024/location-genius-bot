
import LocationMap from "@/components/LocationMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Location data
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
  }
];

const LocationMapCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Map</CardTitle>
        <CardDescription>
          Top rated locations in the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LocationMap locations={locationData} height="300px" />
      </CardContent>
    </Card>
  );
};

export default LocationMapCard;
