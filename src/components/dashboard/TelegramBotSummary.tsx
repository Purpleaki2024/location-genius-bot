
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MessageSquare, Check, AlertCircle, Users, Bot, Activity } from "lucide-react";
import TelegramBotConfig from "@/components/TelegramBotConfig";

const TelegramBotSummary = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [botUsername, setBotUsername] = useState("");
  const [hasWebhook, setHasWebhook] = useState(false);
  const [botStats, setBotStats] = useState({
    users: 0,
    messages: 0,
    searches: 0
  });

  // Load bot configuration on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("telegram_bot_token");
    const savedWebhookUrl = localStorage.getItem("telegram_webhook_url");
    
    if (savedToken) {
      setIsConfigured(true);
      
      // For demo purposes, we're setting a sample bot username
      // In a real application, you would fetch this from the Telegram API
      setBotUsername("TeleLocatorBot");
    }
    
    if (savedWebhookUrl) {
      setHasWebhook(true);
    }
    
    // Sample data for statistics
    // In a real application, you would fetch this from your database
    setBotStats({
      users: 147,
      messages: 2348,
      searches: 1256
    });
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Telegram Bot</CardTitle>
        <CardDescription>Status and configuration of your TeleLocator bot</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isConfigured ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">@{botUsername}</div>
                    <div className="text-xs text-muted-foreground">
                      {hasWebhook ? "Webhook active" : "Polling mode"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isConfigured ? "bg-green-500" : "bg-amber-500"}`}></div>
                  <span className="text-sm font-medium">
                    {isConfigured ? "Online" : "Setup required"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <div className="text-xl font-medium">{botStats.users}</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <MessageSquare className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <div className="text-xl font-medium">{botStats.messages}</div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Activity className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <div className="text-xl font-medium">{botStats.searches}</div>
                  <div className="text-xs text-muted-foreground">Searches</div>
                </div>
              </div>
              
              <div className="pt-2">
                <TelegramBotConfig />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="rounded-full bg-amber-100 p-3">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">Bot not configured</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your Telegram bot to start receiving location queries
                </p>
              </div>
              <TelegramBotConfig />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramBotSummary;
