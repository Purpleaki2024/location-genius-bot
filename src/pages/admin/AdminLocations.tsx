
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocations, Location } from "@/hooks/use-locations";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationModal from "@/components/LocationModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight, Filter, Download } from "lucide-react";

const AdminLocations = () => {
  const navigate = useNavigate();
  const {
    locations,
    isLoading,
    addLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus,
    filter,
    setFilter
  } = useLocations();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  
  // Filter locations based on search term
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAdd = (data: any) => {
    addLocation.mutate(data, {
      onSuccess: () => {
        setShowAddModal(false);
      }
    });
  };
  
  const handleEdit = (data: any) => {
    if (editLocation) {
      updateLocation.mutate(
        { id: editLocation.id, location: data },
        {
          onSuccess: () => {
            setEditLocation(null);
          }
        }
      );
    }
  };
  
  const handleDelete = () => {
    if (locationToDelete) {
      deleteLocation.mutate(locationToDelete, {
        onSuccess: () => {
          setLocationToDelete(null);
        }
      });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleLocationStatus.mutate({ id, active: !currentStatus });
  };
  
  // Get location type badge
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
      case 'cafe':
        return <Badge className="bg-amber-500">Cafe</Badge>;
      case 'bar':
        return <Badge className="bg-red-500">Bar</Badge>;
      case 'museum':
        return <Badge className="bg-indigo-500">Museum</Badge>;
      case 'theater':
        return <Badge className="bg-violet-500">Theater</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Location types for filter
  const locationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'attraction', label: 'Attraction' },
    { value: 'park', label: 'Park' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'bar', label: 'Bar' },
    { value: 'museum', label: 'Museum' },
    { value: 'theater', label: 'Theater' },
    { value: 'other', label: 'Other' }
  ];

  // Export locations to CSV
  const exportToCSV = () => {
    const headers = "ID,Name,Address,Type,Rating,Visits,Active,Created At\n";
    
    const csvData = locations.map(loc => 
      `"${loc.id}","${loc.name}","${loc.address}","${loc.type}",${loc.rating},${loc.visits},${loc.active},"${loc.created_at}"`
    ).join("\n");
    
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'locations.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSearch = () => {
    // This would be replaced with actual search functionality
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading locations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Admin header with controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {locationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>
      </div>
      
      {/* Locations table */}
      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Visits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No locations found. 
                  <Button 
                    variant="link" 
                    onClick={() => setShowAddModal(true)}
                    className="pl-1 h-auto py-0"
                  >
                    Add one now
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map(location => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{location.address}</TableCell>
                  <TableCell>{getTypeBadge(location.type)}</TableCell>
                  <TableCell>{location.rating.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{location.visits}</TableCell>
                  <TableCell>
                    <Badge variant={location.active ? "default" : "outline"}>
                      {location.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditLocation(location)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(location.id, location.active)}>
                          {location.active ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocationToDelete(location.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredLocations.length} of {locations.length} locations
      </div>
      
      {/* Add/Edit Location Modal */}
      <LocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        isSubmitting={addLocation.isPending}
        title="Add New Location"
      />
      
      {editLocation && (
        <LocationModal
          isOpen={!!editLocation}
          onClose={() => setEditLocation(null)}
          onSubmit={handleEdit}
          location={editLocation}
          isSubmitting={updateLocation.isPending}
          title="Edit Location"
        />
      )}
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!locationToDelete} onOpenChange={() => setLocationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this location and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLocations;
