
import { Button } from "@/components/ui/button";

interface LocationShowMoreButtonProps {
  showAll: boolean;
  setShowAll: (value: boolean) => void;
  totalCount: number;
}

const LocationShowMoreButton = ({ 
  showAll, 
  setShowAll, 
  totalCount 
}: LocationShowMoreButtonProps) => {
  if (totalCount <= 3) {
    return null;
  }
  
  return (
    <div className="flex justify-center mt-4">
      <Button 
        variant="outline" 
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? "Show Less" : `Show All (${totalCount})`}
      </Button>
    </div>
  );
};

export default LocationShowMoreButton;
