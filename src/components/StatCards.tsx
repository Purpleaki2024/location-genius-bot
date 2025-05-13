
import { Users, MapPin, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

const StatCards = () => {
  const stats = [
    {
      title: "Total Users",
      value: "3,721",
      change: "+12%",
      trend: "up",
      icon: <Users className="h-5 w-5" />,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Locations",
      value: "842",
      change: "+5%",
      trend: "up",
      icon: <MapPin className="h-5 w-5" />,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Requests Today",
      value: "1,245",
      change: "-3%",
      trend: "down",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Active Now",
      value: "42",
      change: "+18%",
      trend: "up",
      icon: <Users className="h-5 w-5" />,
      color: "bg-violet-500/10 text-violet-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-card rounded-lg border border-border p-4 shadow-sm"
        >
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
        </div>
      ))}
    </div>
  );
};

export default StatCards;
