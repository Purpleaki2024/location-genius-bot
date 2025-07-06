
import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { MessageSquare, Send, Check, Cog, Code, Webhook, RefreshCw } from "lucide-react";
import { TelegramBotApi, TelegramCommand } from "@/utils/telegramBotApi";
import { createLocationCommandHandlers } from "@/utils/locationService";
import { supabase } from "@/integrations/supabase/client";

const RESERVED_COMMANDS = ['start', 'help', 'city', 'town', 'village', 'postcode'];

interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

const TelegramBotConfig = () => {
  const [botToken, setBotToken] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [testMessage, setTestMessage] = useState<string>("Hello from TeleLocator Dashboard!");
  const [isTesting, setIsTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [commands, setCommands] = useState<TelegramCommand[]>([
    { command: 'start', description: 'Start the bot and get welcome message' },
    { command: 'help', description: 'Show available commands' },
    { command: 'city', description: 'Find locations in a city' },
    { command: 'town', description: 'Find locations in a town' },
    { command: 'village', description: 'Find locations in a village' },
    { command: 'postcode', description: 'Find locations by postcode' },
  ]);
  const [activeTab, setActiveTab] = useState("general");

  // Load saved configuration on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("telegram_bot_token");
    const savedChatId = localStorage.getItem("telegram_chat_id");
    const savedWebhookUrl = localStorage.getItem("telegram_webhook_url");
    
    if (savedToken) {
      setBotToken(savedToken);
      setIsConfigured(true);
    }
    
    if (savedChatId) {
      setChatId(savedChatId);
    }
    
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
  }, []);

  const loadCommands = useCallback(async () => {
    if (!botToken) return;
    
    try {
      const telegramBot = new TelegramBotApi({ token: botToken });
      const response = await telegramBot.getMyCommands();
      
      if (response.ok && Array.isArray(response.result)) {
        setCommands(response.result);
      }
    } catch (error) {
      console.error("Error loading commands:", error);
    }
  }, [botToken]);

  // Load commands from bot if token is set
  useEffect(() => {
    if (botToken) {
      loadCommands();
    }
  }, [botToken, loadCommands]);

  const saveConfiguration = () => {
    if (!botToken) {
      toast.error("Please provide a Bot Token");
      return;
    }
    
    localStorage.setItem("telegram_bot_token", botToken);
    
    if (chatId) {
      localStorage.setItem("telegram_chat_id", chatId);
    }
    
    if (webhookUrl) {
      localStorage.setItem("telegram_webhook_url", webhookUrl);
    }
    
    setIsConfigured(true);
    
    toast.success("Telegram Bot configuration saved successfully!");
  };

  const testBotConnection = async () => {
    if (!botToken) {
      toast.error("Please provide a Bot Token");
      return;
    }
    
    setIsTesting(true);
    try {
      const telegramBot = new TelegramBotApi({ token: botToken });
      const response = await telegramBot.testConnection();
      
      if (response.ok && response.result) {
        const botInfo = response.result as BotInfo;
        toast.success(`Connection successful! Bot "${botInfo.username}" is working properly.`);
      } else {
        toast.error("Connection failed. Please check your Bot Token.");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Connection failed. Please check your Bot Token.");
    } finally {
      setIsTesting(false);
    }
  };

  const sendTestMessage = async () => {
    if (!botToken || !chatId || !testMessage) {
      toast.error("Please provide Bot Token, Chat ID, and a test message");
      return;
    }
    
    setIsTesting(true);
    try {
      const telegramBot = new TelegramBotApi({ token: botToken });
      const response = await telegramBot.sendMessage({
        chat_id: chatId,
        text: testMessage
      });
      
      if (response.ok) {
        toast.success("Test message sent successfully!");
      } else {
        toast.error("Failed to send message. Please check your configuration.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please check your configuration.");
    } finally {
      setIsTesting(false);
    }
  };

  const setupCommands = async () => {
    if (!botToken) {
      toast.error("Please provide a Bot Token");
      return;
    }
    
    setIsTesting(true);
    try {
      const telegramBot = new TelegramBotApi({ token: botToken });
      const response = await telegramBot.setCommands(commands);
      
      if (response.ok) {
        toast.success("Bot commands set up successfully!");
        // Refresh commands
        await loadCommands();
      } else {
        toast.error("Failed to set up commands. Please check your Bot Token.");
      }
    } catch (error) {
      console.error("Error setting up commands:", error);
      toast.error("Failed to set up commands. Please check your Bot Token.");
    } finally {
      setIsTesting(false);
    }
  };

  const setWebhook = async () => {
    if (!botToken || !webhookUrl) {
      toast.error("Please provide both Bot Token and Webhook URL");
      return;
    }
    
    setIsSettingWebhook(true);
    try {
      const telegramBot = new TelegramBotApi({ token: botToken });
      const response = await telegramBot.setWebhook(webhookUrl);
      
      if (response.ok) {
        toast.success("Webhook set up successfully!");
        localStorage.setItem("telegram_webhook_url", webhookUrl);
      } else {
        toast.error(`Failed to set webhook: ${response.description || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error setting webhook:", error);
      toast.error("Failed to set webhook. Please check your configuration.");
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const deleteWebhook = async () => {
    if (!botToken) {
      toast.error("Please provide a Bot Token");
      return;
    }
    
    setIsSettingWebhook(true);
    try {
      const telegramBot = new TelegramBotApi({ token: botToken });
      const response = await telegramBot.deleteWebhook();
      
      if (response.ok) {
        toast.success("Webhook deleted successfully!");
        setWebhookUrl("");
        localStorage.removeItem("telegram_webhook_url");
      } else {
        toast.error("Failed to delete webhook. Please check your Bot Token.");
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Failed to delete webhook. Please check your configuration.");
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const resetConfiguration = () => {
    localStorage.removeItem("telegram_bot_token");
    localStorage.removeItem("telegram_chat_id");
    localStorage.removeItem("telegram_webhook_url");
    setBotToken("");
    setChatId("");
    setWebhookUrl("");
    setCommands([
      { command: 'start', description: 'Start the bot and get welcome message' },
      { command: 'help', description: 'Show available commands' },
      { command: 'city', description: 'Find locations in a city' },
      { command: 'town', description: 'Find locations in a town' },
      { command: 'village', description: 'Find locations in a village' },
      { command: 'postcode', description: 'Find locations by postcode' },
    ]);
    setIsConfigured(false);
    toast.info("Configuration reset");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <MessageSquare className="h-4 w-4" />
          {isConfigured ? "Manage Telegram Bot" : "Connect Telegram Bot"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Telegram Bot Integration</DialogTitle>
          <DialogDescription>
            Connect your Dashboard to a Telegram Bot to manage locations and send notifications directly from the application.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bot-token">Bot Token (from BotFather)</Label>
              <div className="flex gap-2">
                <Input
                  id="bot-token"
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={testBotConnection}
                  disabled={!botToken || isTesting}
                >
                  {isTesting ? "Testing..." : "Test"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create a bot on Telegram by chatting with <a href="https://t.me/BotFather" target="_blank" className="text-primary hover:underline">@BotFather</a> and get your token.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chat-id">Default Chat ID</Label>
              <Input
                id="chat-id"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="-1001234567890 or @channelname"
              />
              <p className="text-xs text-muted-foreground">
                The chat ID where the bot should send default messages (your user ID, group ID, or channel username)
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="test-message">Test Message</Label>
              <div className="flex gap-2">
                <Input
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type a message to test your bot"
                  className="flex-1"
                />
                <Button 
                  onClick={sendTestMessage}
                  disabled={!botToken || !chatId || !testMessage || isTesting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="commands" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Bot Commands</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={setupCommands}
                  disabled={isTesting}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Commands
                </Button>
              </div>
              
              <div className="border rounded-md p-4 space-y-2 max-h-[300px] overflow-y-auto">
                {commands.map((cmd, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-muted px-2 py-1 rounded">/{cmd.command}</span>
                    <span className="text-sm flex-1">{cmd.description}</span>
                  </div>
                ))}
                
                <p className="text-xs text-muted-foreground mt-4">
                  These commands are set up automatically and handle location searches by city, town, village, or postcode.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="webhook" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/telegram-webhook"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={setWebhook}
                  disabled={!botToken || !webhookUrl || isSettingWebhook}
                >
                  <Webhook className="h-4 w-4 mr-2" />
                  Set
                </Button>
                <Button 
                  variant="outline" 
                  onClick={deleteWebhook}
                  disabled={!botToken || isSettingWebhook}
                >
                  Delete
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                For Supabase edge functions, use: <code className="bg-muted px-1 py-0.5 rounded text-xs">{`${window.location.origin}/functions/v1/telegram-webhook`}</code>
              </p>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/50">
              <h4 className="font-medium mb-2">How to set up a webhook</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Deploy the telegram-webhook edge function to your Supabase project</li>
                <li>Set up the environment variable <code className="bg-muted px-1 py-0.5 rounded text-xs">TELEGRAM_BOT_TOKEN</code> in your Supabase project</li>
                <li>Enter the webhook URL in the format: <code className="bg-muted px-1 py-0.5 rounded text-xs">{`${window.location.origin}/functions/v1/telegram-webhook`}</code></li>
                <li>Click "Set" to register the webhook with Telegram</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          {isConfigured && (
            <Button 
              variant="destructive" 
              onClick={resetConfiguration}
              className="mr-auto"
            >
              Reset
            </Button>
          )}
          <Button variant="outline" onClick={saveConfiguration}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TelegramBotConfig;
