
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, TrendingUp, UserCheck } from "lucide-react";
import { useUserManagement, useUserStats } from "@/hooks/useUserManagement";
import UserStatsCards from "@/components/UserStatsCards";
import { useNavigate } from "react-router-dom";

const UsersTabContent = () => {
  const navigate = useNavigate();
  const { data: users, isLoading } = useUserManagement('', 'all');
  const { data: stats } = useUserStats();
  
  const topActiveUsers = users?.slice(0, 5) || [];

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-500 text-xs">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-purple-500 text-xs">Manager</Badge>;
      case 'user':
        return <Badge className="bg-green-500 text-xs">User</Badge>;
      case 'blocked':
        return <Badge variant="destructive" className="text-xs">Blocked</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Statistics Overview */}
      <UserStatsCards />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="space-y-6">
            {/* User Activity Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  User Activity Trends
                </CardTitle>
                <CardDescription>Daily active users over the past month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>User activity chart</p>
                    <p className="text-sm">Coming soon with analytics integration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Active Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Most Active Users
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/users')}
                  >
                    View All
                  </Button>
                </div>
                <CardDescription>Users with the most recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted"></div>
                          <div>
                            <div className="h-4 w-24 bg-muted rounded mb-1"></div>
                            <div className="h-3 w-16 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="h-4 w-12 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topActiveUsers.map((user, i) => (
                      <div key={user.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                            {(user.username || user.first_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'}
                              {getRoleBadge(user.role)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Last active: {formatLastActive(user.last_seen)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {user.requests_today || 0} requests today
                        </div>
                      </div>
                    ))}
                    {topActiveUsers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No users found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Quick User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Total Users</div>
                <div className="font-medium">{stats?.totalUsers || 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Active Today</div>
                <div className="font-medium">{stats?.activeToday || 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">New This Week</div>
                <div className="font-medium">{stats?.newThisWeek || 0}</div>
              </div>
              <div className="pt-2 border-t">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/users')}
                >
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
              <CardDescription>Current user role breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.roleDistribution && Object.entries(stats.roleDistribution).map(([role, count]) => {
                  const percentage = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0;
                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{role}</span>
                        <span>{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            role === 'admin' ? 'bg-blue-500' :
                            role === 'manager' ? 'bg-purple-500' :
                            role === 'user' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Retention Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[120px]">
                <div className="text-3xl font-bold text-primary">
                  {stats?.totalUsers && stats?.activeToday 
                    ? Math.round((stats.activeToday / stats.totalUsers) * 100)
                    : 0}%
                </div>
                <div className="text-muted-foreground text-sm text-center mt-1">
                  Daily engagement rate
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UsersTabContent;
