
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LocationForm from "@/components/LocationForm";
import { Location, NewLocation } from "@/hooks/use-locations";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewLocation) => void;
  location?: Location;
  isSubmitting: boolean;
  title: string;
}

const LocationModal = ({
  isOpen,
  onClose,
  onSubmit,
  location,
  isSubmitting,
  title,
}: LocationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <LocationForm
          location={location}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
