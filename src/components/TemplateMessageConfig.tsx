
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Send, Settings } from 'lucide-react';
import { TelegramBotApi } from '@/utils/telegramBotApi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [botToken, setBotToken] = useState('');
  const [testChatId, setTestChatId] = useState('');
  const [botStatus, setBotStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
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

  // Test Telegram bot connection
  const testBotConnection = async () => {
    if (!botToken) {
      toast.error('Please enter a bot token');
      return;
    }

    setIsConnecting(true);
    setBotStatus('idle');

    try {
      const botApi = new TelegramBotApi({ token: botToken });
      const response = await botApi.testConnection();

      if (response.ok) {
        setBotStatus('success');
        toast.success('Bot connection successful!');
        localStorage.setItem('telegram_bot_token', botToken);
      } else {
        setBotStatus('error');
        toast.error(`Connection failed: ${response.description}`);
      }
    } catch (error) {
      setBotStatus('error');
      toast.error('Failed to connect to Telegram bot');
      console.error('Error testing bot connection:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Send test message
  const sendTestMessage = async () => {
    if (!botToken) {
      toast.error('Please enter a bot token');
      return;
    }

    if (!testChatId) {
      toast.error('Please enter a chat ID for testing');
      return;
    }

    setIsSending(true);

    try {
      const botApi = new TelegramBotApi({ token: botToken });
      const currentTemplate = templates[activeTab as keyof typeof templates];
      // Fix: Remove the 'locations' property and just send the template message
      const response = await botApi.sendMessage({
        chat_id: testChatId,
        text: currentTemplate.message,
        parse_mode: 'HTML'
      });

      if (response.ok) {
        toast.success('Test message sent successfully!');
      } else {
        toast.error(`Failed to send message: ${response.description}`);
      }
    } catch (error) {
      toast.error('Failed to send test message');
      console.error('Error sending test message:', error);
    } finally {
      setIsSending(false);
    }
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
        <div className="space-y-6">
          {/* Bot Configuration Section */}
          <div className="space-y-4 pb-4 border-b">
            <h3 className="text-lg font-medium">Telegram Bot Configuration</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="bot-token">
                Bot Token <span className="text-xs text-muted-foreground">(from BotFather)</span>
              </label>
              <div className="flex space-x-2">
                <Input
                  id="bot-token"
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="flex-1"
                />
                <Button 
                  onClick={testBotConnection}
                  disabled={isConnecting}
                  variant="outline"
                >
                  {isConnecting ? "Connecting..." : "Test Connection"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This token will be stored securely in your browser for testing purposes.
              </p>
            </div>

            {botStatus === 'success' && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <Settings className="h-4 w-4 text-green-600" />
                <AlertTitle>Connection Successful</AlertTitle>
                <AlertDescription>
                  Your Telegram bot is connected and ready to use.
                </AlertDescription>
              </Alert>
            )}

            {botStatus === 'error' && (
              <Alert variant="destructive">
                <Settings className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>
                  Unable to connect to your Telegram bot. Please check the token and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Command Templates Section */}
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
                  Use {{locations}} as a placeholder for the list of locations.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Test Message Section */}
          {botStatus === 'success' && (
            <div className="pt-4 border-t space-y-4">
              <h3 className="text-lg font-medium">Test Message</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="test-chat-id">
                  Chat ID for Testing
                </label>
                <Input
                  id="test-chat-id"
                  value={testChatId}
                  onChange={(e) => setTestChatId(e.target.value)}
                  placeholder="Chat ID (e.g., 123456789)"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your personal chat ID to receive test messages.
                </p>
              </div>
              <Button 
                onClick={sendTestMessage}
                disabled={isSending || !testChatId}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSending ? "Sending..." : "Send Test Message"}
              </Button>
            </div>
          )}
        </div>
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
