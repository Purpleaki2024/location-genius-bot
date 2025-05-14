
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';

// Initial template data
const defaultTemplates = {
  start: {
    title: "/start Command",
    message: "Welcome to our location service! Use /location to find places near you."
  },
  location: {
    title: "/location Command",
    message: "Here are the locations near you: {{locations}}"
  }
};

const TemplateMessageConfig = () => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [activeTab, setActiveTab] = useState('start');
  
  // Handle save template
  const handleSaveTemplate = () => {
    // Here you would typically save to a database
    // For now, we'll just show a success toast
    toast.success(`Template for /${activeTab} updated successfully`);
  };
  
  // Handle template message change
  const handleMessageChange = (value: string) => {
    setTemplates(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab as keyof typeof prev],
        message: value
      }
    }));
  };
  
  // Handle template title change
  const handleTitleChange = (value: string) => {
    setTemplates(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab as keyof typeof prev],
        title: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Command Templates</CardTitle>
        <CardDescription>
          Configure responses sent when users interact with bot commands
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="start">/start</TabsTrigger>
            <TabsTrigger value="location">/location</TabsTrigger>
          </TabsList>
          
          <TabsContent value="start" className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="start-title">
                Template Title
              </label>
              <Input
                id="start-title"
                value={templates.start.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="start-message">
                Welcome Message
              </label>
              <Textarea
                id="start-message"
                value={templates.start.message}
                onChange={(e) => handleMessageChange(e.target.value)}
                className="mt-1 h-32"
                placeholder="Enter the message users will see when they use /start"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message is sent when users first interact with the bot.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="location" className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="location-title">
                Template Title
              </label>
              <Input
                id="location-title"
                value={templates.location.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="location-message">
                Location Response
              </label>
              <Textarea
                id="location-message"
                value={templates.location.message}
                onChange={(e) => handleMessageChange(e.target.value)}
                className="mt-1 h-32"
                placeholder="Enter the message users will see when they use /location"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {{'{{'}}locations{{'}}'}} as a placeholder for the list of locations.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveTemplate}>
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateMessageConfig;
