
import { useState } from "react";
import Header from "@/components/Header";
import LocationTable from "@/components/LocationTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PlusCircle, 
  Download, 
  Filter, 
  List,
  Search,
  X,
  SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Sheet,
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const handleExport = () => {
    // In a production app, this would generate and download a CSV file
    toast.success("Exporting locations to CSV");
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = "#";
      link.download = "locations_export.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(`Searching for "${searchQuery}"`);
  };
  
  const handleFilter = () => {
    toast.success(`Filter applied: ${selectedType}, min rating: ${minRating}, ${showActiveOnly ? 'active only' : 'all statuses'}`);
    setIsFilterSheetOpen(false);
  };
  
  const handleAddLocation = () => {
    toast.success("Add Location dialog would open here");
    setIsAddLocationOpen(true);
  };
  
  const handleClearFilters = () => {
    setSelectedType("all");
    setMinRating(0);
    setShowActiveOnly(false);
    toast.info("Filters cleared");
  };

  return (
    <div className="space-y-6 p-6">
      <Header title="Location Management" />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsFilterSheetOpen(true)}>
              <Filter className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="flex flex-wrap items-center space-x-2">            
            <Select 
              value={selectedType} 
              onValueChange={setSelectedType}
            >
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
            
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Button onClick={handleAddLocation}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <LocationTable />
        </div>
        
        {selectedType !== "all" && (
          <div className="flex items-center">
            <div className="bg-muted/50 py-1.5 px-3 rounded-md flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Filter: {selectedType}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => setSelectedType("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
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
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(p => Math.max(p - 1, 1));
              toast.info(`Page ${currentPage - 1}`);
            }}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setCurrentPage(p => p + 1);
              toast.info(`Page ${currentPage + 1}`);
            }}
          >
            Next
          </Button>
        </div>
      </div>
      
      {/* Add Location Dialog */}
      <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Fill out the details to add a new location to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              In a production app, this would contain a form to add a new location.
            </p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => {
                setIsAddLocationOpen(false);
                toast.success("Location added successfully");
              }}>
                Add Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Advanced Filters Sheet */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Locations</SheetTitle>
            <SheetDescription>
              Set filters to narrow down the location list.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="location-type">Location Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="location-type">
                  <SelectValue placeholder="Select type" />
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
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="min-rating">Minimum Rating</Label>
              <Select value={String(minRating)} onValueChange={v => setMinRating(Number(v))}>
                <SelectTrigger id="min-rating">
                  <SelectValue placeholder="Select minimum rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="active-only" 
                checked={showActiveOnly} 
                onCheckedChange={(checked) => setShowActiveOnly(!!checked)} 
              />
              <Label htmlFor="active-only">Show active locations only</Label>
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Locations;
