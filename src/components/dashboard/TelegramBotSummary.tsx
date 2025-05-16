
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MessageSquare, Check, AlertCircle, Users, Bot, Activity, Search } from "lucide-react";
import TelegramBotConfig from "@/components/TelegramBotConfig";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BotStats {
  users: number;
  messages: number;
  searches: number;
  commands: {
    [key: string]: number;
  };
}

const TelegramBotSummary = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [botUsername, setBotUsername] = useState("");
  const [hasWebhook, setHasWebhook] = useState(false);

  // Load bot configuration on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("telegram_bot_token");
    const savedWebhookUrl = localStorage.getItem("telegram_webhook_url");
    
    if (savedToken) {
      setIsConfigured(true);
      
      // For demo purposes, we're setting a sample bot username
      // In a real application, you would fetch this from the Telegram API
      setBotUsername(localStorage.getItem("telegram_bot_username") || "TeleLocatorBot");
    }
    
    if (savedWebhookUrl) {
      setHasWebhook(true);
    }
  }, []);

  // Fetch bot stats from Supabase
  const { data: botStats = { users: 0, messages: 0, searches: 0, commands: {} }, isLoading, error } = useQuery({
    queryKey: ['botStats'],
    queryFn: async () => {
      try {
        // Get user count
        const { count: userCount, error: userError } = await supabase
          .from("telegram_users")
          .select("*", { count: 'exact', head: true });
          
        if (userError) throw new Error(userError.message);
        
        // Get messages stats
        const { data: statsData, error: statsError } = await supabase
          .from("bot_stats")
          .select("*");
          
        if (statsError) throw new Error(statsError.message);
        
        // Build stats object
        const stats: BotStats = {
          users: userCount || 0,
          messages: 0,
          searches: 0,
          commands: {}
        };
        
        // Process stats from the bot_stats table
        statsData?.forEach(stat => {
          if (stat.name === 'total_messages') {
            stats.messages = stat.value;
          } else if (stat.name === 'location_searches') {
            stats.searches = stat.value;
          } else if (stat.name.startsWith('cmd_')) {
            // Track command usage
            const cmdName = stat.name.substring(4); // Remove 'cmd_' prefix
            stats.commands[cmdName] = stat.value;
          }
        });
        
        return stats;
      } catch (e) {
        console.error("Error fetching bot stats:", e);
        return { users: 0, messages: 0, searches: 0, commands: {} };
      }
    },
    enabled: isConfigured,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Test the bot connection
  const testBotConnection = async () => {
    const token = localStorage.getItem("telegram_bot_token");
    if (!token) {
      toast.error("Bot token not configured");
      return;
    }

    try {
      toast.info("Testing bot connection...");
      
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();
      
      if (data.ok && data.result) {
        const username = data.result.username;
        toast.success(`Connected to @${username}`);
        setBotUsername(username);
        localStorage.setItem("telegram_bot_username", username);
      } else {
        toast.error("Connection failed. Invalid bot token.");
      }
    } catch (err) {
      console.error("Error testing bot:", err);
      toast.error("Connection error. Please check your internet connection.");
    }
  };

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
                  <Button variant="outline" size="sm" onClick={testBotConnection}>
                    Test Connection
                  </Button>
                  <div className={`h-2 w-2 rounded-full ${isConfigured ? "bg-green-500" : "bg-amber-500"}`}></div>
                  <span className="text-sm font-medium">
                    {isConfigured ? "Online" : "Setup required"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <div className="text-xl font-medium">{isLoading ? '...' : botStats.users}</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <MessageSquare className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <div className="text-xl font-medium">{isLoading ? '...' : botStats.messages}</div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Search className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <div className="text-xl font-medium">{isLoading ? '...' : botStats.searches}</div>
                  <div className="text-xs text-muted-foreground">Searches</div>
                </div>
              </div>
              
              {error && (
                <div className="text-center p-2 text-sm text-red-500">
                  Error loading stats. Please check your Supabase connection.
                </div>
              )}
              
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
