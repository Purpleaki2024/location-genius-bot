import { useState } from "react";
import UserHeader from "@/components/UserHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Settings as SettingsIcon, Bell, Layout, User, Clock, Save } from "lucide-react";
import { toast } from "sonner";
import { useSettings, ColorScheme, SidebarMode } from "@/contexts/SettingsContext";
import TemplateMessageConfig from "@/components/TemplateMessageConfig";

const Settings = () => {
  const {
    colorScheme,
    setColorScheme,
    sidebarMode,
    setSidebarMode,
    compactMode,
    setCompactMode,
    resetSettings
  } = useSettings();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/dd/yyyy");

  const handleSaveGeneralSettings = () => {
    toast.success("General settings saved successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved");
  };

  const handleSaveDateTimeSettings = () => {
    toast.success("Date and time settings saved");
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      <UserHeader title="Settings" />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted w-full justify-start h-auto p-1 flex-wrap">
          <TabsTrigger value="general" className="flex items-center">
            <SettingsIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center">
            <Layout className="mr-2 h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="datetime" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Date & Time
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Bot Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="Location Management Dashboard" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="app-description">Application Description</Label>
                <Input id="app-description" defaultValue="Manage locations and track activities" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Enable Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow collection of usage data
                  </p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>
              
              <Button onClick={handleSaveGeneralSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Color Scheme</Label>
                <RadioGroup 
                  value={colorScheme}
                  onValueChange={(value) => setColorScheme(value as ColorScheme)}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-3"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <RadioGroupItem value="blue" id="color-blue" className="bg-white" />
                    </div>
                    <Label htmlFor="color-blue">Blue</Label>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <RadioGroupItem value="green" id="color-green" className="bg-white" />
                    </div>
                    <Label htmlFor="color-green">Green</Label>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <RadioGroupItem value="purple" id="color-purple" className="bg-white" />
                    </div>
                    <Label htmlFor="color-purple">Purple</Label>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                      <RadioGroupItem value="amber" id="color-amber" className="bg-white" />
                    </div>
                    <Label htmlFor="color-amber">Amber</Label>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-500 flex items-center justify-center">
                      <RadioGroupItem value="slate" id="color-slate" className="bg-white" />
                    </div>
                    <Label htmlFor="color-slate">Slate</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Use smaller spacing and controls
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>
              
              <div className="pt-4">
                <Button variant="outline" onClick={resetSettings}>
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive important alerts via SMS
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
              
              <Button onClick={handleSaveNotifications} className="w-full mt-4">
                <Save className="mr-2 h-4 w-4" />
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>
                Customize the layout of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Sidebar Mode</Label>
                <RadioGroup
                  value={sidebarMode}
                  onValueChange={(value) => setSidebarMode(value as SidebarMode)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expanded" id="sidebar-expanded" />
                    <Label htmlFor="sidebar-expanded">Always Expanded</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="collapsed" id="sidebar-collapsed" />
                    <Label htmlFor="sidebar-collapsed">Always Collapsed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="sidebar-auto" />
                    <Label htmlFor="sidebar-auto">Responsive (Auto)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="default-tab">Default Dashboard Tab</Label>
                <Select defaultValue="overview">
                  <SelectTrigger id="default-tab">
                    <SelectValue placeholder="Select default tab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="requests">Requests</SelectItem>
                    <SelectItem value="locations">Locations</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datetime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Date and Time</CardTitle>
              <CardDescription>
                Configure date and time formatting preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    <SelectItem value="dd.MM.yyyy">DD.MM.YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select defaultValue="12h">
                  <SelectTrigger id="time-format">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSaveDateTimeSettings} className="w-full mt-4">
                <Save className="mr-2 h-4 w-4" />
                Save Date & Time Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplateMessageConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
