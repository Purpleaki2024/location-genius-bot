
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Users, MessageSquare, TrendingUp } from "lucide-react";

const TelegramBotSummary = () => {
  // Mock data - in a real app, this would come from your backend
  const botStats = {
    totalUsers: 1247,
    activeUsers: 89,
    messagesProcessed: 3521,
    uptime: "99.8%"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>Telegram Bot Status</CardTitle>
        </div>
        <CardDescription>
          Real-time status and statistics for your Telegram bot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{botStats.totalUsers.toLocaleString()}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{botStats.activeUsers}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Messages</span>
            </div>
            <div className="text-2xl font-bold">{botStats.messagesProcessed.toLocaleString()}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{botStats.uptime}</div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramBotSummary;
