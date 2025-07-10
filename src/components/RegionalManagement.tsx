import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Trash2, Plus, MapPin, Globe, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Form schemas
const regionSchema = z.object({
  country_code: z.string().min(2, "Country code is required"),
  country_name: z.string().min(2, "Country name is required"),
  region_code: z.string().min(2, "Region code is required"),
  region_name: z.string().min(2, "Region name is required"),
  emoji: z.string().optional(),
  display_order: z.number().min(0, "Display order must be 0 or greater"),
});

const locationSchema = z.object({
  region_id: z.string().min(1, "Region is required"),
  location_name: z.string().min(2, "Location name is required"),
  location_code: z.string().min(2, "Location code is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  display_order: z.number().min(0, "Display order must be 0 or greater"),
});

const medicalContactSchema = z.object({
  region_id: z.string().optional(),
  location_id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  specialty: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_emergency: z.boolean().default(false),
});

type RegionFormValues = z.infer<typeof regionSchema>;
type LocationFormValues = z.infer<typeof locationSchema>;
type MedicalContactFormValues = z.infer<typeof medicalContactSchema>;

interface Region {
  id: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  emoji: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface RegionLocation {
  id: string;
  region_id: string;
  location_name: string;
  location_code: string;
  latitude?: number;
  longitude?: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  regions?: { region_name: string; country_name: string };
}

interface MedicalContact {
  id: string;
  region_id?: string;
  location_id?: string;
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_emergency: boolean;
  is_active: boolean;
  created_at: string;
  regions?: { region_name: string; country_name: string };
  region_locations?: { location_name: string };
}

export default function RegionalManagement() {
  const [selectedTab, setSelectedTab] = useState<"regions" | "locations" | "contacts">("regions");
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editingLocation, setEditingLocation] = useState<RegionLocation | null>(null);
  const [editingContact, setEditingContact] = useState<MedicalContact | null>(null);
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch regions
  const { data: regions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Region[];
    },
  });

  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["region_locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("region_locations")
        .select(`
          *,
          regions (
            region_name,
            country_name
          )
        `)
        .order("display_order");
      if (error) throw error;
      return data as RegionLocation[];
    },
  });

  // Fetch medical contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["medical_contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_contacts")
        .select(`
          *,
          regions (
            region_name,
            country_name
          ),
          region_locations (
            location_name
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MedicalContact[];
    },
  });

  // Region form
  const regionForm = useForm<RegionFormValues>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      country_code: "",
      country_name: "",
      region_code: "",
      region_name: "",
      emoji: "",
      display_order: 0,
    },
  });

  // Location form
  const locationForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      region_id: "",
      location_name: "",
      location_code: "",
      display_order: 0,
    },
  });

  // Medical contact form
  const contactForm = useForm<MedicalContactFormValues>({
    resolver: zodResolver(medicalContactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      specialty: "",
      address: "",
      is_emergency: false,
    },
  });

  // Region mutations
  const saveRegionMutation = useMutation({
    mutationFn: async (values: RegionFormValues) => {
      if (editingRegion) {
        const { error } = await supabase
          .from("regions")
          .update(values)
          .eq("id", editingRegion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("regions")
          .insert([values]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      setIsRegionDialogOpen(false);
      setEditingRegion(null);
      regionForm.reset();
      toast.success(editingRegion ? "Region updated!" : "Region created!");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Location mutations
  const saveLocationMutation = useMutation({
    mutationFn: async (values: LocationFormValues) => {
      if (editingLocation) {
        const { error } = await supabase
          .from("region_locations")
          .update(values)
          .eq("id", editingLocation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("region_locations")
          .insert([values]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["region_locations"] });
      setIsLocationDialogOpen(false);
      setEditingLocation(null);
      locationForm.reset();
      toast.success(editingLocation ? "Location updated!" : "Location created!");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Medical contact mutations
  const saveContactMutation = useMutation({
    mutationFn: async (values: MedicalContactFormValues) => {
      if (editingContact) {
        const { error } = await supabase
          .from("medical_contacts")
          .update(values)
          .eq("id", editingContact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("medical_contacts")
          .insert([values]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical_contacts"] });
      setIsContactDialogOpen(false);
      setEditingContact(null);
      contactForm.reset();
      toast.success(editingContact ? "Contact updated!" : "Contact created!");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Delete mutations
  const deleteRegionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("regions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region deleted!");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("region_locations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["region_locations"] });
      toast.success("Location deleted!");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("medical_contacts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical_contacts"] });
      toast.success("Contact deleted!");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Handle form submissions
  const onRegionSubmit = (values: RegionFormValues) => {
    saveRegionMutation.mutate(values);
  };

  const onLocationSubmit = (values: LocationFormValues) => {
    saveLocationMutation.mutate(values);
  };

  const onContactSubmit = (values: MedicalContactFormValues) => {
    saveContactMutation.mutate(values);
  };

  // Handle edit actions
  const handleEditRegion = (region: Region) => {
    setEditingRegion(region);
    regionForm.reset({
      country_code: region.country_code,
      country_name: region.country_name,
      region_code: region.region_code,
      region_name: region.region_name,
      emoji: region.emoji,
      display_order: region.display_order,
    });
    setIsRegionDialogOpen(true);
  };

  const handleEditLocation = (location: RegionLocation) => {
    setEditingLocation(location);
    locationForm.reset({
      region_id: location.region_id,
      location_name: location.location_name,
      location_code: location.location_code,
      latitude: location.latitude,
      longitude: location.longitude,
      display_order: location.display_order,
    });
    setIsLocationDialogOpen(true);
  };

  const handleEditContact = (contact: MedicalContact) => {
    setEditingContact(contact);
    contactForm.reset({
      region_id: contact.region_id || "",
      location_id: contact.location_id || "",
      name: contact.name,
      phone: contact.phone,
      email: contact.email || "",
      specialty: contact.specialty || "",
      address: contact.address || "",
      latitude: contact.latitude,
      longitude: contact.longitude,
      is_emergency: contact.is_emergency,
    });
    setIsContactDialogOpen(true);
  };

  // Handle new actions
  const handleNewRegion = () => {
    setEditingRegion(null);
    regionForm.reset();
    setIsRegionDialogOpen(true);
  };

  const handleNewLocation = () => {
    setEditingLocation(null);
    locationForm.reset();
    setIsLocationDialogOpen(true);
  };

  const handleNewContact = () => {
    setEditingContact(null);
    contactForm.reset();
    setIsContactDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Regional Management</h1>
        <div className="flex space-x-2">
          <Button
            variant={selectedTab === "regions" ? "default" : "outline"}
            onClick={() => setSelectedTab("regions")}
          >
            <Globe className="w-4 h-4 mr-2" />
            Regions
          </Button>
          <Button
            variant={selectedTab === "locations" ? "default" : "outline"}
            onClick={() => setSelectedTab("locations")}
          >
            <Map className="w-4 h-4 mr-2" />
            Locations
          </Button>
          <Button
            variant={selectedTab === "contacts" ? "default" : "outline"}
            onClick={() => setSelectedTab("contacts")}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Medical Contacts
          </Button>
        </div>
      </div>

      {selectedTab === "regions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Regions</h2>
            <Dialog open={isRegionDialogOpen} onOpenChange={setIsRegionDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewRegion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Region
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingRegion ? "Edit Region" : "Add New Region"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure region details for the bot location system.
                  </DialogDescription>
                </DialogHeader>
                <Form {...regionForm}>
                  <form onSubmit={regionForm.handleSubmit(onRegionSubmit)} className="space-y-4">
                    <FormField
                      control={regionForm.control}
                      name="country_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country Code</FormLabel>
                          <FormControl>
                            <Input placeholder="england, scotland, wales, ireland" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regionForm.control}
                      name="country_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country Name</FormLabel>
                          <FormControl>
                            <Input placeholder="England, Scotland, Wales, Ireland" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regionForm.control}
                      name="region_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region Code</FormLabel>
                          <FormControl>
                            <Input placeholder="north_east, london, highlands" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regionForm.control}
                      name="region_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region Name</FormLabel>
                          <FormControl>
                            <Input placeholder="North East, London, Highlands" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regionForm.control}
                      name="emoji"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emoji</FormLabel>
                          <FormControl>
                            <Input placeholder="🏔️, 🏛️, 🌊" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regionForm.control}
                      name="display_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={saveRegionMutation.isPending}
                      >
                        {saveRegionMutation.isPending ? "Saving..." : editingRegion ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regionsLoading ? (
              <div>Loading regions...</div>
            ) : (
              regions.map((region) => (
                <Card key={region.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {region.emoji} {region.region_name}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRegion(region)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRegionMutation.mutate(region.id)}
                          disabled={deleteRegionMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {region.country_name} • Order: {region.display_order}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="secondary">{region.region_code}</Badge>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(region.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {selectedTab === "locations" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Locations</h2>
            <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewLocation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingLocation ? "Edit Location" : "Add New Location"}
                  </DialogTitle>
                  <DialogDescription>
                    Add cities and towns to regions for the bot location system.
                  </DialogDescription>
                </DialogHeader>
                <Form {...locationForm}>
                  <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
                    <FormField
                      control={locationForm.control}
                      name="region_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {regions.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.emoji} {region.region_name} ({region.country_name})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="location_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Manchester, Birmingham, Edinburgh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="location_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Code</FormLabel>
                          <FormControl>
                            <Input placeholder="manchester, birmingham, edinburgh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={locationForm.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="any"
                                placeholder="53.4808" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={locationForm.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="any"
                                placeholder="-2.2426" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={locationForm.control}
                      name="display_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={saveLocationMutation.isPending}
                      >
                        {saveLocationMutation.isPending ? "Saving..." : editingLocation ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locationsLoading ? (
              <div>Loading locations...</div>
            ) : (
              locations.map((location) => (
                <Card key={location.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>📍 {location.location_name}</span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditLocation(location)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteLocationMutation.mutate(location.id)}
                          disabled={deleteLocationMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {location.regions?.region_name} • {location.regions?.country_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="secondary">{location.location_code}</Badge>
                      {location.latitude && location.longitude && (
                        <p className="text-sm text-muted-foreground">
                          Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Order: {location.display_order} • Created: {new Date(location.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {selectedTab === "contacts" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Medical Contacts</h2>
            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewContact}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medical Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingContact ? "Edit Medical Contact" : "Add New Medical Contact"}
                  </DialogTitle>
                  <DialogDescription>
                    Add medical professionals and emergency contacts by region/location.
                  </DialogDescription>
                </DialogHeader>
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={contactForm.control}
                        name="region_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regions.map((region) => (
                                  <SelectItem key={region.id} value={region.id}>
                                    {region.emoji} {region.region_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="location_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    📍 {location.location_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={contactForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Sarah Johnson" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={contactForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+44 7700 900123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="doctor@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={contactForm.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialty (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Emergency Medicine, General Practice" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="123 Medical Centre, London, UK" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={contactForm.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="any"
                                placeholder="51.5074" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="any"
                                placeholder="-0.1278" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={contactForm.control}
                      name="is_emergency"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input 
                              type="checkbox" 
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Emergency Contact</FormLabel>
                            <FormDescription>
                              Mark this as an emergency medical contact
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={saveContactMutation.isPending}
                      >
                        {saveContactMutation.isPending ? "Saving..." : editingContact ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contactsLoading ? (
              <div>Loading contacts...</div>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        {contact.is_emergency && <span className="mr-2">🚨</span>}
                        {contact.name}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditContact(contact)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteContactMutation.mutate(contact.id)}
                          disabled={deleteContactMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {contact.specialty && `${contact.specialty} • `}
                      {contact.regions?.region_name || "Global"}
                      {contact.region_locations?.location_name && ` • ${contact.region_locations.location_name}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{contact.phone}</p>
                      {contact.email && (
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      )}
                      {contact.address && (
                        <p className="text-sm text-muted-foreground">{contact.address}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {contact.is_emergency && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                        {contact.specialty && (
                          <Badge variant="secondary">{contact.specialty}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
