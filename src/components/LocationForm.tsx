
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Location, NewLocation } from '@/hooks/use-locations';

// Updated schema to include the new fields
const locationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  description: z.string().nullable().optional(),
  active: z.boolean().default(true),
  type: z.string().min(1, 'Please select a location type'),
  // New fields
  contact: z.string().optional(),
  password: z.string().optional(),
  info: z.string().optional(),
  // Hidden fields with default values to maintain compatibility
  lat: z.coerce.number().min(-90).max(90).default(0),
  lng: z.coerce.number().min(-180).max(180).default(0),
  rating: z.coerce.number().min(0).max(5).default(0),
  visits: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof locationSchema>;

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: NewLocation) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const LocationForm = ({ location, onSubmit, onCancel, isSubmitting }: LocationFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      address: location?.address || '',
      type: location?.type || '',
      contact: location?.contact || '',
      password: location?.password || '',
      info: location?.info || '',
      lat: location?.lat || 0,
      lng: location?.lng || 0,
      rating: location?.rating || 0,
      description: location?.description || '',
      active: location?.active ?? true,
      visits: location?.visits || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="town">Town</SelectItem>
                  <SelectItem value="village">Village</SelectItem>
                  <SelectItem value="postcode">Postcode</SelectItem>
                  <SelectItem value="attraction">Attraction</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="Phone number" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password for access" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Information</FormLabel>
              <FormControl>
                <Input placeholder="Additional information" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe this location..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4"
                />
              </FormControl>
              <FormLabel className="font-normal">Active</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : location ? 'Update Location' : 'Add Location'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LocationForm;
