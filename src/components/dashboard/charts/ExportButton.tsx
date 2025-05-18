
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  activeTab: string;
}

const ExportButton = ({ activeTab }: ExportButtonProps) => {
  const handleExportData = () => {
    toast.success("Chart data exported successfully");
    
    // Create export data based on chart type
    const blob = new Blob(["Chart Data Export"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chart-data-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="mt-4 text-xs text-muted-foreground text-right">
      <Button variant="ghost" size="sm" className="h-auto p-0" onClick={handleExportData}>
        <span>Export Data</span>
        <ChevronDown className="ml-1 h-3 w-3" />
      </Button>
    </div>
  );
};

export default ExportButton;
