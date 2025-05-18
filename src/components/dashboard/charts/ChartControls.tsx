
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartControlsProps {
  activeTab: string;
  chartType: string;
  dataType: string;
  onChartTypeChange: (value: string) => void;
  onDataTypeChange: (value: string) => void;
}

const ChartControls = ({
  activeTab,
  chartType,
  dataType,
  onChartTypeChange,
  onDataTypeChange,
}: ChartControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      {activeTab === "activity" && (
        <Select 
          value={chartType} 
          onValueChange={onChartTypeChange}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Chart Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Select 
        value={dataType} 
        onValueChange={onDataTypeChange}
      >
        <SelectTrigger className="w-[100px] h-8">
          <SelectValue placeholder="Data" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="users">Users</SelectItem>
          <SelectItem value="locations">Locations</SelectItem>
          <SelectItem value="reviews">Reviews</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChartControls;
