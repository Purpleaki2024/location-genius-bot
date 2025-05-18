
import { useState } from "react";
import { useSettings, ColorScheme, SidebarMode } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Check, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    colorScheme,
    setColorScheme,
    sidebarMode,
    setSidebarMode,
    compactMode,
    setCompactMode,
    resetSettings
  } = useSettings();

  const colorSchemes: { value: ColorScheme; label: string }[] = [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
    { value: "amber", label: "Amber" },
    { value: "slate", label: "Slate" },
  ];

  const sidebarModes: { value: SidebarMode; label: string }[] = [
    { value: "expanded", label: "Always Expanded" },
    { value: "collapsed", label: "Always Collapsed" },
    { value: "auto", label: "Responsive" },
  ];

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Dashboard Settings</h4>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        <Tabs defaultValue="appearance">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Color Scheme</h5>
              <RadioGroup 
                value={colorScheme} 
                onValueChange={(value) => setColorScheme(value as ColorScheme)}
                className="grid grid-cols-3 gap-2"
              >
                {colorSchemes.map((scheme) => (
                  <div key={scheme.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={scheme.value} id={`color-${scheme.value}`} />
                    <Label htmlFor={`color-${scheme.value}`}>{scheme.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Sidebar Mode</h5>
              <RadioGroup 
                value={sidebarMode} 
                onValueChange={(value) => setSidebarMode(value as SidebarMode)}
                className="space-y-1"
              >
                {sidebarModes.map((mode) => (
                  <div key={mode.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={mode.value} id={`sidebar-${mode.value}`} />
                    <Label htmlFor={`sidebar-${mode.value}`}>{mode.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">Use smaller spacing and controls</p>
              </div>
              <Switch
                id="compact-mode"
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsPanel;
