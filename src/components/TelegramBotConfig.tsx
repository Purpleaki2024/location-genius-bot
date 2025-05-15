
import { useState, useEffect } from "react";
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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { MessageSquare, Telegram, Send } from "lucide-react";
import { testConnection, sendMessage } from "@/utils/telegramBotApi";

const TelegramBotConfig = () => {
  const [botToken, setBotToken] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [testMessage, setTestMessage] = useState<string>("Hello from TeleLocator Dashboard!");
  const [isTesting, setIsTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Load saved configuration on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("telegram_bot_token");
    const savedChatId = localStorage.getItem("telegram_chat_id");
    
    if (savedToken && savedChatId) {
      setBotToken(savedToken);
      setChatId(savedChatId);
      setIsConfigured(true);
    }
  }, []);

  const saveConfiguration = () => {
    if (!botToken || !chatId) {
      toast.error("Please provide both Bot Token and Chat ID");
      return;
    }
    
    localStorage.setItem("telegram_bot_token", botToken);
    localStorage.setItem("telegram_chat_id", chatId);
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
      const response = await testConnection(botToken);
      if (response.ok) {
        toast.success("Connection successful! Bot is working properly.");
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
      const response = await sendMessage(botToken, chatId, testMessage);
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

  const resetConfiguration = () => {
    localStorage.removeItem("telegram_bot_token");
    localStorage.removeItem("telegram_chat_id");
    setBotToken("");
    setChatId("");
    setIsConfigured(false);
    toast.info("Configuration reset");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <Telegram className="h-4 w-4" />
          {isConfigured ? "Manage Telegram Bot" : "Connect Telegram Bot"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Telegram Bot Integration</DialogTitle>
          <DialogDescription>
            Connect your Dashboard to a Telegram Bot to send notifications and messages directly from the application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
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
            <Label htmlFor="chat-id">Chat ID</Label>
            <Input
              id="chat-id"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-1001234567890 or @channelname"
            />
            <p className="text-xs text-muted-foreground">
              The chat ID where the bot should send messages (your user ID, group ID, or channel username)
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
        </div>
        
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
