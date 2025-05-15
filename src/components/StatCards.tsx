
import { useState } from "react";
import { Users, MapPin, Clock, ArrowUpRight, ArrowDownRight, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StatCards = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  
  const stats = [
    {
      id: "users",
      title: "Total Users",
      value: "3,721",
      change: "+12%",
      trend: "up",
      icon: <Users className="h-5 w-5" />,
      color: "bg-blue-500/10 text-blue-500",
      detail: "354 new users this week, 68 today"
    },
    {
      id: "locations",
      title: "Locations",
      value: "842",
      change: "+5%",
      trend: "up",
      icon: <MapPin className="h-5 w-5" />,
      color: "bg-green-500/10 text-green-500",
      detail: "42 new locations this month, 8 pending review"
    },
    {
      id: "requests",
      title: "Requests Today",
      value: "1,245",
      change: "-3%",
      trend: "down",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-orange-500/10 text-orange-500",
      detail: "Peak time: 2-4 PM, 38% mobile users"
    },
    {
      id: "active",
      title: "Active Now",
      value: "42",
      change: "+18%",
      trend: "up",
      icon: <Users className="h-5 w-5" />,
      color: "bg-violet-500/10 text-violet-500",
      detail: "70% retention rate, 4.2 min avg. session"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card 
          key={stat.id} 
          className={`relative transition-all duration-200 ${expanded === stat.id ? 'ring-2 ring-primary/20' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className={`rounded-full p-2 ${stat.color}`}>{stat.icon}</div>
              <div className={`flex items-center ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 ml-1" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-muted-foreground text-sm">{stat.title}</p>
            </div>
            
            {expanded === stat.id && (
              <div className="mt-3 pt-3 border-t text-sm text-muted-foreground animate-fade-in">
                {stat.detail}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute bottom-1 right-1 h-6 w-6 p-0 rounded-full"
              onClick={() => setExpanded(expanded === stat.id ? null : stat.id)}
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${expanded === stat.id ? 'rotate-180' : ''}`} />
              <span className="sr-only">Show details</span>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;
